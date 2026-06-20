import dns from 'dns';
if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
}

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;
// Connection references will be initialized below

import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'mock_db_data.json');

const defaultConsultants = [
    {
        _id: 'mock-jenkins',
        name: "Dr. Sarah Jenkins",
        fullName: "Dr. Sarah Jenkins",
        title: "Strategic Management Consultant",
        role: "Strategic Management Consultant",
        bio: "Former McKinsey Partner with 15+ years experience in global market disruption strategies.",
        domains: ["Strategic Management", "Market Entry", "M&A", "Scale-up"],
        expertise: ["Strategic Management", "Market Entry", "M&A", "Scale-up"],
        rating: 5.0,
        experience_years: 15,
        price: "15,000",
        organization: "Jenkins & Co",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCylS986vA0nB65M7pYitZt7O-S6-Y2SPhK49S0W5FjT0oP9w0m4o6M-Z-Y-vE8F-M",
        email: "sarah.jenkins@example.com",
        contact_email: "sarah.jenkins@example.com",
        suitable_for: ["corporate", "startup"],
        engagement_styles: ["flexible", "advisory"],
        student_level: "all",
        trust_building: true,
        beginner_friendly: true,
        status: "approved"
    },
    {
        _id: 'mock-thorne',
        name: "Marcus Thorne",
        fullName: "Marcus Thorne",
        title: "AI Implementation Architect",
        role: "AI Implementation Architect",
        bio: "Technical lead for Fortune 500 digital transformations with focus on regenerative AI.",
        domains: ["Software Engineering", "Data Science & AI", "LLM Ops", "Automation"],
        expertise: ["Software Engineering", "Data Science & AI", "LLM Ops", "Automation"],
        rating: 4.9,
        experience_years: 12,
        price: "12,500",
        organization: "Thorne Dynamics",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDn7_K9_iS5o6n9_m-pX-L-6_v9O-M6Z-Y",
        email: "marcus.thorne@example.com",
        contact_email: "marcus.thorne@example.com",
        suitable_for: ["individual", "startup"],
        engagement_styles: ["technical", "hands-on"],
        student_level: "all",
        beginner_friendly: true,
        status: "approved"
    },
    {
        _id: 'mock-rodriguez',
        name: "Elena Rodriguez",
        fullName: "Elena Rodriguez",
        title: "Financial Risk Specialist",
        role: "Financial Risk Specialist",
        bio: "Quantitative analyst specializing in high-volatility market navigations and risk mitigation.",
        domains: ["Finance & Banking", "Business Strategy", "Hedge Funds", "Crypto"],
        expertise: ["Finance & Banking", "Business Strategy", "Hedge Funds", "Crypto"],
        rating: 5.0,
        experience_years: 10,
        price: "18,000",
        organization: "Rodriguez Capital",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9_vE-6-z-L-6-Y2SPhK49S0W5FjT0oP9w-M6Z-Y",
        email: "elena.rodriguez@example.com",
        contact_email: "elena.rodriguez@example.com",
        suitable_for: ["corporate"],
        engagement_styles: ["advisory"],
        student_level: "all",
        status: "approved"
    }
];

const inMemoryStore = {
    assessments: new Map(),
    consultants: new Map(),
    otps: new Map(),
    user_profiles: new Map()
};

// Helper to save store to file
function saveStore() {
    try {
        const data = {};
        for (const [key, map] of Object.entries(inMemoryStore)) {
            data[key] = Array.from(map.entries());
        }
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error('Failed to save mock DB to file:', err);
    }
}

// Helper to load store from file
function loadStore() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, 'utf-8');
            const data = JSON.parse(raw);
            for (const [key, entries] of Object.entries(data)) {
                inMemoryStore[key] = new Map(entries);
            }
            console.log(`💾 Mock DB loaded successfully from ${DB_FILE}`);
        } else {
            defaultConsultants.forEach(c => inMemoryStore.consultants.set(c._id, c));
            saveStore();
        }
    } catch (err) {
        console.error('Failed to load mock DB from file:', err);
        defaultConsultants.forEach(c => inMemoryStore.consultants.set(c._id, c));
    }
}

loadStore();

const mockClient = {
    isMock: true,
    db: () => ({
        collection: (collectionName) => {
            if (!inMemoryStore[collectionName]) {
                inMemoryStore[collectionName] = new Map();
            }
            const store = inMemoryStore[collectionName];
            return {
                find: (query) => ({
                    toArray: async () => {
                        const all = Array.from(store.values());
                        if (!query || Object.keys(query).length === 0) {
                            return all;
                        }
                        return all.filter(doc => {
                            for (const key in query) {
                                const filterVal = query[key];
                                if (filterVal && typeof filterVal === 'object' && !Array.isArray(filterVal)) {
                                    if ('$ne' in filterVal) {
                                        if (doc[key] === filterVal.$ne) return false;
                                    }
                                    if ('$eq' in filterVal) {
                                        if (doc[key] !== filterVal.$eq) return false;
                                    }
                                } else {
                                    if (doc[key] !== filterVal) return false;
                                }
                            }
                            return true;
                        });
                    }
                }),
                insertOne: async (doc) => {
                    const id = doc._id || 'mock-id-' + Math.random().toString(36).substr(2, 9);
                    const newDoc = { ...doc, _id: id };
                    store.set(id.toString(), newDoc);
                    console.log(`[Mock DB ${collectionName}] Inserted:`, newDoc);
                    saveStore();
                    return { insertedId: id };
                },
                insertMany: async (docs) => {
                    docs.forEach(doc => {
                        const id = doc._id || 'mock-id-' + Math.random().toString(36).substr(2, 9);
                        store.set(id.toString(), { ...doc, _id: id });
                    });
                    console.log(`[Mock DB ${collectionName}] Inserted ${docs.length} documents.`);
                    saveStore();
                    return { insertedCount: docs.length };
                },
                updateOne: async (filter, update) => {
                    console.log(`[Mock DB ${collectionName}] updateOne filter:`, filter, "update:", update);
                    let targetId = filter._id;
                    if (targetId && typeof targetId !== 'string') {
                        targetId = targetId.toString();
                    }
                    const doc = store.get(targetId);
                    if (doc) {
                        if (update.$set) {
                            Object.assign(doc, update.$set);
                        }
                        store.set(targetId, doc);
                        saveStore();
                        return { matchedCount: 1, modifiedCount: 1 };
                    }
                    for (const [key, value] of store.entries()) {
                        let match = true;
                        for (const fKey in filter) {
                            let filterVal = filter[fKey];
                            if (filterVal && typeof filterVal !== 'string' && fKey === '_id') {
                                filterVal = filterVal.toString();
                            }
                            if (value[fKey] !== filterVal) {
                                match = false;
                                break;
                            }
                        }
                        if (match) {
                            if (update.$set) {
                                Object.assign(value, update.$set);
                            }
                            store.set(key, value);
                            saveStore();
                            return { matchedCount: 1, modifiedCount: 1 };
                        }
                    }
                    return { matchedCount: 0, modifiedCount: 0 };
                },
                findOne: async (query) => {
                    console.log(`[Mock DB ${collectionName}] findOne query:`, query);
                    if (query && query._id) {
                        return store.get(query._id.toString()) || null;
                    }
                    for (const doc of store.values()) {
                        let match = true;
                        for (const key in query) {
                            if (doc[key] !== query[key]) {
                                match = false;
                                break;
                            }
                        }
                        if (match) return doc;
                    }
                    return null;
                }
            };
        }
    })
};

if (!uri) {
    console.warn("⚠️ MONGODB_URI is not set. Falling back to Mock In-Memory Database.");
    mockClient.connectionError = "MONGODB_URI environment variable is not defined in environment.";
    clientPromise = Promise.resolve(mockClient);
} else if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect()
            .then(clientInstance => {
                console.log("✅ Successfully connected to MongoDB Atlas in development mode.");
                return clientInstance;
            })
            .catch(error => {
                console.warn("⚠️ MongoDB Atlas connection failed. Falling back to Mock In-Memory Database.");
                console.warn("Error details:", error.message);
                mockClient.connectionError = error.message;
                return mockClient;
            });
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect()
        .then(clientInstance => {
            console.log("✅ Successfully connected to MongoDB Atlas.");
            return clientInstance;
        })
        .catch(error => {
            console.warn("⚠️ MongoDB Atlas connection failed. Falling back to Mock In-Memory Database.");
            console.warn("Error details:", error.message);
            mockClient.connectionError = error.message;
            return mockClient;
        });
}

export default clientPromise;
