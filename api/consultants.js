import clientPromise from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';
import { sendNewConsultantAlert } from './utils/email.js';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const database = client.db('prodecide');
        const consultants = database.collection('consultants');

        if (req.method === 'GET') {
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
            const { id, status } = req.body;
            if (!id || !status) {
                return res.status(400).json({ error: 'ID and status are required' });
            }

            let filter = { _id: id };
            try {
                if (ObjectId.isValid(id)) {
                    filter = { _id: new ObjectId(id) };
                }
            } catch (e) {
                // Keep string ID filter
            }

            const result = await consultants.updateOne(
                filter,
                { $set: { status } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Consultant not found' });
            }

            return res.status(200).json({ success: true, message: `Consultant ${status} successfully` });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Database operation failed:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

