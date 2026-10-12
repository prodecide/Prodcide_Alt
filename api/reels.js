import clientPromise from '../lib/db.js';
import { verifyToken } from './_utils/auth-middleware.js';

// Reel references: one page per Instagram reel, listing the useful links shared with people who comment on it.
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TYPES = ['article', 'video', 'pdf', 'tool', 'course', 'book', 'other'];

const text = (v, max) => String(v ?? '').trim().slice(0, max);

function safeUrl(v) {
    try {
        const u = new URL(String(v).trim());
        return ['http:', 'https:'].includes(u.protocol) ? u.toString() : null;
    } catch {
        return null;
    }
}

function validate(body) {
    const slug = text(body.slug, 60).toLowerCase();
    const title = text(body.title, 140);
    if (!title) return { error: 'Title is required' };
    if (!SLUG_RE.test(slug)) return { error: 'Link name can only use lowercase letters, numbers and hyphens' };

    let reelUrl = '';
    if (body.reelUrl) {
        reelUrl = safeUrl(body.reelUrl);
        if (!reelUrl) return { error: 'Reel link must start with http:// or https://' };
    }

    const rows = Array.isArray(body.resources) ? body.resources.slice(0, 50) : [];
    const resources = [];
    for (const [i, r] of rows.entries()) {
        const url = safeUrl(r?.url);
        const title = text(r?.title, 140);
        if (!title || !url) return { error: `Reference ${i + 1} needs a title and a valid link (http:// or https://)` };
        resources.push({
            title,
            url,
            description: text(r?.description, 300),
            type: TYPES.includes(r?.type) ? r.type : 'other',
        });
    }

    return {
        value: {
            slug,
            title,
            keyword: text(body.keyword, 40),
            summary: text(body.summary, 400),
            reelUrl,
            published: body.published === true,
            resources,
        },
    };
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    try {
        const client = await clientPromise;
        const reels = client.db('prodecide').collection('reels');
        const admin = verifyToken(req)?.role === 'admin';

        if (req.method === 'GET') {
            const { slug, all } = req.query;
            if (slug) {
                const reel = await reels.findOne({ slug: String(slug).toLowerCase() });
                if (!reel || (!reel.published && !admin)) return res.status(404).json({ error: 'Reference page not found' });
                return res.status(200).json(reel);
            }
            if (all === 'true') {
                if (!admin) return res.status(401).json({ error: 'Unauthorized' });
                const list = await reels.find({}).toArray();
                return res.status(200).json(list.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))));
            }
            const list = await reels.find({ published: true }).toArray();
            return res.status(200).json(
                list
                    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
                    .map(({ _id, slug, title, summary, resources }) => ({ _id, slug, title, summary, resourceCount: (resources || []).length }))
            );
        }

        if (!admin) return res.status(401).json({ error: 'Unauthorized: admin login required' });

        if (req.method === 'POST') {
            const { value, error } = validate(req.body || {});
            if (error) return res.status(400).json({ error });
            if (await reels.findOne({ slug: value.slug })) return res.status(409).json({ error: 'That link name is already used by another reel' });
            const now = new Date().toISOString();
            const doc = { ...value, createdAt: now, updatedAt: now };
            await reels.insertOne(doc);
            return res.status(201).json(doc);
        }

        if (req.method === 'PUT') {
            const { id } = req.body || {};
            if (!id) return res.status(400).json({ error: 'ID is required' });
            const existing = await reels.findOne({ _id: id });
            if (!existing) return res.status(404).json({ error: 'Reel not found' });
            const { value, error } = validate(req.body);
            if (error) return res.status(400).json({ error });
            const clash = await reels.findOne({ slug: value.slug });
            if (clash && clash._id !== existing._id) return res.status(409).json({ error: 'That link name is already used by another reel' });
            await reels.updateOne({ _id: id }, { $set: { ...value, updatedAt: new Date().toISOString() } });
            return res.status(200).json({ success: true });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID is required' });
            const r = await reels.deleteMany({ _id: String(id) });
            return res.status(r.deletedCount ? 200 : 404).json({ success: r.deletedCount > 0 });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Reels API error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
