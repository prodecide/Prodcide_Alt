import clientPromise from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';
import { sendNewConsultantAlert } from './utils/email.js';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const database = client.db('prodecide');
        const consultants = database.collection('consultants');

        if (req.method === 'GET') {
            const { id } = req.query;
            if (id) {
                let filter;
                if (typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
                    filter = { _id: new ObjectId(id) };
                } else {
                    filter = { _id: id };
                }
                const consultant = await consultants.findOne(filter);
                if (!consultant) {
                    return res.status(404).json({ error: 'Consultant not found' });
                }
                return res.status(200).json(consultant);
            }
            const showAll = req.query.all === 'true';
            const query = showAll ? {} : { status: { $ne: 'pending' } };
            const allConsultants = await consultants.find(query).toArray();
            return res.status(200).json(allConsultants);
        }

        if (req.method === 'POST') {
            const newConsultant = req.body;
            if (!newConsultant.fullName || !newConsultant.email) {
                return res.status(400).json({ error: 'Name and email are required' });
            }

            // Normalize email address to avoid casing mismatch
            newConsultant.email = newConsultant.email.toLowerCase().trim();

            // Default new consultants to pending
            newConsultant.status = 'pending';

            const result = await consultants.insertOne(newConsultant);
            const insertedDoc = { ...newConsultant, _id: result.insertedId };

            // Send email notification (failsafe)
            try {
                const protocol = req.headers['x-forwarded-proto'] || 'http';
                const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3001';
                // Adjust port if it's localhost:3001 (backend API server) to localhost:5173 (Vite dev server)
                let origin = `${protocol}://${host}`;
                if (host.includes('localhost:3001')) {
                    origin = 'http://localhost:5173';
                }
                await sendNewConsultantAlert(insertedDoc, origin);
            } catch (emailErr) {
                console.error('Failed to send application email notification:', emailErr);
            }

            return res.status(201).json(insertedDoc);
        }

        if (req.method === 'PUT') {
            const { 
                id, 
                status, 
                fullName, 
                name, 
                role, 
                profession, 
                organization, 
                location, 
                profileImage, 
                avatar, 
                bio, 
                experienceDetails, 
                educationDetails, 
                expertise 
            } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'ID is required' });
            }

            let filter = { _id: id };
            try {
                if (ObjectId.isValid(id)) {
                    filter = { _id: new ObjectId(id) };
                }
            } catch (e) {
                // Keep string ID filter
            }

            const updateFields = {};
            if (status) updateFields.status = status;
            if (fullName !== undefined) updateFields.fullName = fullName;
            if (name !== undefined) updateFields.name = name;
            if (role !== undefined) updateFields.role = role;
            if (profession !== undefined) updateFields.profession = profession;
            if (organization !== undefined) updateFields.organization = organization;
            if (location !== undefined) updateFields.location = location;
            if (profileImage !== undefined) updateFields.profileImage = profileImage;
            if (avatar !== undefined) updateFields.avatar = avatar;
            if (bio !== undefined) updateFields.bio = bio;
            if (experienceDetails !== undefined) updateFields.experienceDetails = experienceDetails;
            if (educationDetails !== undefined) updateFields.educationDetails = educationDetails;
            if (expertise !== undefined) updateFields.expertise = expertise;

            const result = await consultants.updateOne(
                filter,
                { $set: updateFields }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Consultant not found' });
            }

            return res.status(200).json({ success: true, message: `Consultant updated successfully` });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Database operation failed:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

