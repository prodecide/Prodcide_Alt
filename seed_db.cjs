require('dotenv').config({ path: './.env.local' });
const { MongoClient } = require('mongodb');

const consultants = [
  {
    fullName: "Dr. Sarah Jenkins",
    role: "Strategic Management Consultant",
    expertise: ["Strategic Management", "Market Entry", "M&A", "Scale-up"],
    rating: "5.0",
    price: "15,000",
    bio: "Former McKinsey Partner with 15+ years experience in global market disruption strategies.",
    organization: "Jenkins & Co",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCylS986vA0nB65M7pYitZt7O-S6-Y2SPhK49S0W5FjT0oP9w0m4o6M-Z-Y-vE8F-M"
  },
  {
    fullName: "Marcus Thorne",
    role: "AI Implementation Architect",
    expertise: ["Software Engineering", "Data Science & AI", "LLM Ops", "Automation"],
    rating: "4.9",
    price: "12,500",
    bio: "Technical lead for Fortune 500 digital transformations with focus on regenerative AI.",
    organization: "Thorne Dynamics",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDn7_K9_iS5o6n9_m-pX-L-6_v9O-M6Z-Y"
  },
  {
    fullName: "Elena Rodriguez",
    role: "Financial Risk Specialist",
    expertise: ["Finance & Banking", "Business Strategy", "Hedge Funds", "Crypto"],
    rating: "5.0",
    price: "18,000",
    bio: "Quantitative analyst specializing in high-volatility market navigations and risk mitigation.",
    organization: "Rodriguez Capital",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9_vE-6-z-L-6-Y2SPhK49S0W5FjT0oP9w-M6Z-Y"
  }
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('prodecide');
    const collection = db.collection('consultants');

    // Clear existing data (optional, but good for seeding)
    // await collection.deleteMany({});

    const result = await collection.insertMany(consultants);
    console.log(`${result.insertedCount} consultants inserted successfully!`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seed();
