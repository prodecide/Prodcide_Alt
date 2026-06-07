import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
}

// Resilient in-memory database fallback
const inMemoryStore = {
    assessments: new Map(),
    consultants: new Map()
};

const defaultConsultants = [
    {
        _id: 'mock-jenkins',
        name: "Dr. Sarah Jenkins",
        title: "Strategic Management Consultant",
        bio: "Former McKinsey Partner with 15+ years experience in global market disruption strategies.",
        domains: ["Strategic Management", "Market Entry", "M&A", "Scale-up"],
        rating: 5.0,
        experience_years: 15,
        price: "15,000",
        organization: "Jenkins & Co",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCylS986vA0nB65M7pYitZt7O-S6-Y2SPhK49S0W5FjT0oP9w0m4o6M-Z-Y-vE8F-M",
        contact_email: "sarah.jenkins@example.com",
        suitable_for: ["corporate", "startup"],
        engagement_styles: ["flexible", "advisory"],
        student_level: "all",
        trust_building: true,
        beginner_friendly: true
    },
    {
        _id: 'mock-thorne',
        name: "Marcus Thorne",
        title: "AI Implementation Architect",
        bio: "Technical lead for Fortune 500 digital transformations with focus on regenerative AI.",
        domains: ["Software Engineering", "Data Science & AI", "LLM Ops", "Automation"],
        rating: 4.9,
        experience_years: 12,
        price: "12,500",
        organization: "Thorne Dynamics",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDn7_K9_iS5o6n9_m-pX-L-6_v9O-M6Z-Y",
        contact_email: "marcus.thorne@example.com",
        suitable_for: ["individual", "startup"],
        engagement_styles: ["technical", "hands-on"],
        student_level: "all",
        beginner_friendly: true
    },
    {
        _id: 'mock-rodriguez',
        name: "Elena Rodriguez",
        title: "Financial Risk Specialist",
        bio: "Quantitative analyst specializing in high-volatility market navigations and risk mitigation.",
        domains: ["Finance & Banking", "Business Strategy", "Hedge Funds", "Crypto"],
        rating: 5.0,
        experience_years: 10,
        price: "18,000",
        organization: "Rodriguez Capital",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9_vE-6-z-L-6-Y2SPhK49S0W5FjT0oP9w-M6Z-Y",
        contact_email: "elena.rodriguez@example.com",
        suitable_for: ["corporate"],
        engagement_styles: ["advisory"],
        student_level: "all"
    }
];

defaultConsultants.forEach(c => inMemoryStore.consultants.set(c._id, c));

const mockClient = {
    db: () => ({
        collection: (collectionName) => {
            if (!inMemoryStore[collectionName]) {
                inMemoryStore[collectionName] = new Map();
            }
            const store = inMemoryStore[collectionName];
            return {
                find: () => ({
                    toArray: async () => Array.from(store.values())
                }),
                insertOne: async (doc) => {
                    const id = doc._id || 'mock-id-' + Math.random().toString(36).substr(2, 9);
                    const newDoc = { ...doc, _id: id };
                    store.set(id.toString(), newDoc);
                    console.log(`[Mock DB ${collectionName}] Inserted:`, newDoc);
                    return { insertedId: id };
                },
                insertMany: async (docs) => {
                    docs.forEach(doc => {
                        const id = doc._id || 'mock-id-' + Math.random().toString(36).substr(2, 9);
                        store.set(id.toString(), { ...doc, _id: id });
                    });
                    console.log(`[Mock DB ${collectionName}] Inserted ${docs.length} documents.`);
                    return { insertedCount: docs.length };
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

if (process.env.NODE_ENV === 'development') {
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
            return mockClient;
        });
}

export default clientPromise;
