import clientPromise from '../lib/mongodb.js';
import { verifyToken } from './utils/auth-middleware.js';

export default async function handler(req, res) {
    // JWT Authentication
    const decoded = verifyToken(req);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    try {
        const client = await clientPromise;
        const database = client.db('prodecide');
        const userProfiles = database.collection('user_profiles');

        // GET — Fetch user profile by email
        if (req.method === 'GET') {
            const { email } = req.query;
            if (!email) {
                return res.status(400).json({ error: 'Email parameter is required' });
            }
            const normalizedEmail = email.toLowerCase().trim();
            const profile = await userProfiles.findOne({ email: normalizedEmail });

            if (!profile) {
                // Try to migrate from legacy 'users' collection
                const usersCollection = database.collection('users');
                const legacyUser = await usersCollection.findOne({ email: normalizedEmail });
                if (legacyUser) {
                    const migratedProfile = {
                        email: normalizedEmail,
                        name: legacyUser.name || '',
                        age: legacyUser.age || '',
                        college: legacyUser.college || '',
                        major: legacyUser.major || '',
                        phone: '',
                        location: '',
                        bio: '',
                        linkedIn: '',
                        avatar: legacyUser.avatar || '',
                        originalAvatar: legacyUser.originalAvatar || '',
                        aiAvatar: legacyUser.aiAvatar || '',
                        class10: legacyUser.class10 || '',
                        class12: legacyUser.class12 || '',
                        undergrad: legacyUser.undergrad || '',
                        postgrad: legacyUser.postgrad || '',
                        interests: legacyUser.interests || [],
                        customInterests: legacyUser.customInterests || [],
                        gaps: legacyUser.gaps || [],
                        gapCategory: legacyUser.gapCategory || '',
                        gapDescription: legacyUser.gapDescription || '',
                        suggestedPaths: legacyUser.suggestedPaths || [],
                        currentSkills: legacyUser.currentSkills || [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    await userProfiles.insertOne(migratedProfile);
                    return res.status(200).json(migratedProfile);
                }
                return res.status(404).json({ error: 'User profile not found' });
            }

            return res.status(200).json(profile);
        }

        // POST — Create or smart-merge (upsert) user profile
        if (req.method === 'POST') {
            const data = req.body;
            if (!data.email) {
                return res.status(400).json({ error: 'Email is required' });
            }
            const normalizedEmail = data.email.toLowerCase().trim();

            const existing = await userProfiles.findOne({ email: normalizedEmail });

            if (existing) {
                // Smart merge: only update fields that are explicitly provided and non-empty
                const updateFields = { updatedAt: new Date() };
                const stringFields = [
                    'name', 'age', 'college', 'major', 'phone', 'location',
                    'bio', 'linkedIn', 'avatar', 'originalAvatar', 'aiAvatar',
                    'class10', 'class12', 'undergrad', 'postgrad',
                    'gapCategory', 'gapDescription'
                ];
                const arrayFields = [
                    'interests', 'customInterests', 'gaps',
                    'suggestedPaths', 'currentSkills'
                ];

                for (const field of stringFields) {
                    if (data[field] !== undefined && data[field] !== '') {
                        updateFields[field] = data[field];
                    }
                }
                for (const field of arrayFields) {
                    if (data[field] !== undefined && Array.isArray(data[field]) && data[field].length > 0) {
                        updateFields[field] = data[field];
                    }
                }

                await userProfiles.updateOne(
                    { email: normalizedEmail },
                    { $set: updateFields }
                );
            } else {
                // New profile: use all provided fields with defaults
                const profileFields = {
                    email: normalizedEmail,
                    name: data.name || '',
                    age: data.age || '',
                    college: data.college || '',
                    major: data.major || '',
                    phone: data.phone || '',
                    location: data.location || '',
                    bio: data.bio || '',
                    linkedIn: data.linkedIn || '',
                    avatar: data.avatar || '',
                    originalAvatar: data.originalAvatar || '',
                    aiAvatar: data.aiAvatar || '',
                    class10: data.class10 || '',
                    class12: data.class12 || '',
                    undergrad: data.undergrad || '',
                    postgrad: data.postgrad || '',
                    interests: data.interests || [],
                    customInterests: data.customInterests || [],
                    gaps: data.gaps || [],
                    gapCategory: data.gapCategory || '',
                    gapDescription: data.gapDescription || '',
                    suggestedPaths: data.suggestedPaths || [],
                    currentSkills: data.currentSkills || [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await userProfiles.insertOne(profileFields);
            }

            const updatedProfile = await userProfiles.findOne({ email: normalizedEmail });
            return res.status(200).json({ success: true, profile: updatedProfile });
        }

        // PUT — Partial field update
        if (req.method === 'PUT') {
            const data = req.body;
            if (!data.email) {
                return res.status(400).json({ error: 'Email is required' });
            }
            const normalizedEmail = data.email.toLowerCase().trim();

            // Only update the fields that were explicitly sent
            const updateFields = { updatedAt: new Date() };
            const allowedFields = [
                'name', 'age', 'college', 'major', 'phone', 'location',
                'bio', 'linkedIn', 'avatar', 'originalAvatar', 'aiAvatar', 'class10', 'class12', 'undergrad', 'postgrad',
                'interests', 'customInterests', 'gaps', 'gapCategory', 'gapDescription',
                'suggestedPaths', 'currentSkills'
            ];

            for (const field of allowedFields) {
                if (data[field] !== undefined) {
                    updateFields[field] = data[field];
                }
            }

            const existing = await userProfiles.findOne({ email: normalizedEmail });
            if (!existing) {
                // Auto-create if not found
                updateFields.email = normalizedEmail;
                updateFields.createdAt = new Date();
                await userProfiles.insertOne(updateFields);
            } else {
                await userProfiles.updateOne(
                    { email: normalizedEmail },
                    { $set: updateFields }
                );
            }

            const updatedProfile = await userProfiles.findOne({ email: normalizedEmail });
            return res.status(200).json({ success: true, profile: updatedProfile });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('User Profiles API error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
