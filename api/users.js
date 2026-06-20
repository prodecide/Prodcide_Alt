import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const database = client.db('prodecide');
        const users = database.collection('users');

        if (req.method === 'GET') {
            const { email } = req.query;
            if (!email) {
                return res.status(400).json({ error: 'Email parameter is required' });
            }
            const normalizedEmail = email.toLowerCase().trim();
            const user = await users.findOne({ email: normalizedEmail });
            if (!user) {
                return res.status(404).json({ error: 'User profile not found' });
            }
            return res.status(200).json(user);
        }

        if (req.method === 'POST') {
            const profileData = req.body;
            if (!profileData.email) {
                return res.status(400).json({ error: 'Email is required' });
            }
            const normalizedEmail = profileData.email.toLowerCase().trim();

            const existingUser = await users.findOne({ email: normalizedEmail });
            
            const updateFields = {
                email: normalizedEmail,
                name: profileData.name || profileData.fullName,
                age: profileData.age,
                college: profileData.college,
                major: profileData.major,
                class10: profileData.class10,
                class12: profileData.class12,
                undergrad: profileData.undergrad,
                postgrad: profileData.postgrad,
                interests: profileData.interests || [],
                customInterests: profileData.customInterests || [],
                gaps: profileData.gaps || [],
                gapCategory: profileData.gapCategory || 'Human Capital Strategy',
                gapDescription: profileData.gapDescription || '',
                suggestedPaths: profileData.suggestedPaths || [],
                currentSkills: profileData.currentSkills || [],
                updatedAt: new Date()
            };

            if (existingUser) {
                // Ensure we filter safely (the mock client matches by exact filter properties)
                await users.updateOne({ email: normalizedEmail }, { $set: updateFields });
            } else {
                await users.insertOne(updateFields);
            }

            const updatedUser = await users.findOne({ email: normalizedEmail });
            return res.status(200).json({ success: true, user: updatedUser });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Users API error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
