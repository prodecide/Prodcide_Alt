// Supabase (Postgres) storage with a small MongoDB-style API (find/findOne/insertOne/updateOne/
// deleteMany/countDocuments), so the API handlers keep their original shape.
// Each collection is a table: id text primary key, data jsonb.
import pg from 'pg';
import { randomBytes } from 'crypto';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('Please set DATABASE_URL (Supabase connection string).');
}

const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10000,
});

const TABLES = new Set(['consultants', 'bookings', 'users', 'user_profiles', 'availability', 'reviews', 'otps', 'rate_limits']);

export class ObjectId {
    constructor(id) { this.id = String(id ?? randomBytes(12).toString('hex')); }
    toString() { return this.id; }
    toJSON() { return this.id; }
    static isValid(id) { return /^[0-9a-fA-F]{24}$/.test(String(id)); }
}

const plain = (v) => (v instanceof ObjectId ? v.toString() : v);
const newId = () => randomBytes(12).toString('hex');

// Translate a Mongo-style filter into a SQL WHERE clause.
function where(filter = {}, params) {
    const parts = [];
    const add = (v) => { params.push(v); return `$${params.length}`; };
    const cmp = { $lt: '<', $lte: '<=', $gt: '>', $gte: '>=' };

    for (const [key, raw] of Object.entries(filter)) {
        const cond = plain(raw);
        const isOp = cond && typeof cond === 'object' && !(cond instanceof Date) && !Array.isArray(cond);
        if (!isOp) {
            parts.push(key === '_id' ? `id = ${add(String(cond))}` : `data @> ${add(JSON.stringify({ [key]: cond }))}::jsonb`);
            continue;
        }
        for (const [op, val0] of Object.entries(cond)) {
            const val = plain(val0);
            if (op === '$ne') {
                parts.push(key === '_id' ? `id <> ${add(String(val))}` : `NOT (data @> ${add(JSON.stringify({ [key]: val }))}::jsonb)`);
            } else if (cmp[op]) {
                const col = key === '_id' ? 'id' : typeof val === 'number' ? `(data->>'${key.replace(/'/g, "''")}')::numeric` : `data->>'${key.replace(/'/g, "''")}'`;
                const p = typeof val === 'number' ? add(val) : add(val instanceof Date ? val.toISOString() : String(val));
                parts.push(`${col} ${cmp[op]} ${p}`);
            } else if (op === '$in') {
                parts.push(`(${val.map((x) => (key === '_id' ? `id = ${add(String(plain(x)))}` : `data @> ${add(JSON.stringify({ [key]: plain(x) }))}::jsonb`)).join(' OR ') || 'false'})`);
            } else {
                throw new Error(`Unsupported filter operator ${op}`);
            }
        }
    }
    return parts.length ? `WHERE ${parts.join(' AND ')}` : '';
}

const toDoc = (row) => ({ _id: row.id, ...row.data });

function applyProjection(doc, projection) {
    if (!projection) return doc;
    const keys = Object.keys(projection).filter((k) => k !== '_id');
    if (!keys.length) return doc;
    const include = projection[keys[0]] === 1 || projection[keys[0]] === true;
    const out = {};
    if (include) {
        for (const k of keys) if (doc[k] !== undefined) out[k] = doc[k];
        if (projection._id !== 0) out._id = doc._id;
    } else {
        Object.assign(out, doc);
        for (const k of keys) delete out[k];
        if (projection._id === 0) delete out._id;
    }
    return out;
}

function sortDocs(docs, sort) {
    if (!sort) return docs;
    const [[key, dir]] = Object.entries(sort);
    return [...docs].sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * (dir < 0 ? -1 : 1));
}

class Collection {
    constructor(name) {
        if (!TABLES.has(name)) throw new Error(`Unknown collection ${name}`);
        this.table = `public."${name}"`;
    }

    async _select(filter) {
        const params = [];
        const { rows } = await pool.query(`SELECT id, data FROM ${this.table} ${where(filter, params)}`, params);
        return rows.map(toDoc);
    }

    find(filter = {}) {
        const state = { sort: null, projection: null, limit: null };
        const cursor = {
            sort(s) { state.sort = s; return cursor; },
            project(p) { state.projection = p; return cursor; },
            limit(n) { state.limit = n; return cursor; },
            toArray: async () => {
                let docs = sortDocs(await this._select(filter), state.sort);
                if (state.limit) docs = docs.slice(0, state.limit);
                return docs.map((d) => applyProjection(d, state.projection));
            },
        };
        return cursor;
    }

    async findOne(filter = {}, options = {}) {
        const docs = sortDocs(await this._select(filter), options.sort);
        return docs[0] ? applyProjection(docs[0], options.projection) : null;
    }

    async insertOne(doc) {
        const { _id, ...data } = doc;
        const id = _id ? String(plain(_id)) : newId();
        doc._id = id;
        await pool.query(`INSERT INTO ${this.table} (id, data) VALUES ($1, $2::jsonb)`, [id, JSON.stringify(data)]);
        return { acknowledged: true, insertedId: id };
    }

    async updateOne(filter, update, options = {}) {
        const set = update.$set || {};
        const params = [];
        const w = where(filter, params);
        const idx = params.length;
        const { rows } = await pool.query(
            `UPDATE ${this.table} SET data = data || $${idx + 1}::jsonb WHERE id = (SELECT id FROM ${this.table} ${w} LIMIT 1) RETURNING id`,
            [...params, JSON.stringify(set)]
        );
        if (rows.length) return { matchedCount: 1, modifiedCount: 1, upsertedCount: 0 };
        if (options.upsert) {
            const base = {};
            for (const [k, v] of Object.entries(filter)) if (v === null || typeof v !== 'object') base[k] = plain(v);
            const id = await this.insertOne({ ...base, ...set });
            return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1, upsertedId: id.insertedId };
        }
        return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
    }

    async deleteMany(filter = {}) {
        const params = [];
        const r = await pool.query(`DELETE FROM ${this.table} ${where(filter, params)}`, params);
        return { deletedCount: r.rowCount };
    }

    async countDocuments(filter = {}) {
        const params = [];
        const { rows } = await pool.query(`SELECT count(*)::int AS n FROM ${this.table} ${where(filter, params)}`, params);
        return rows[0].n;
    }
}

const database = { collection: (name) => new Collection(name) };
const client = { db: () => database };

export default Promise.resolve(client);
