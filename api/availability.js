import clientPromise from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const database = client.db('prodecide');
        const availability = database.collection('availability');
        const bookings = database.collection('bookings');

        // ─── GET: Fetch availability for a consultant ───────────────────────
        if (req.method === 'GET') {
            const { consultantId } = req.query;
            if (!consultantId) {
                return res.status(400).json({ error: 'consultantId is required' });
            }

            const record = await availability.findOne({ consultantId });
            if (!record) {
                return res.status(200).json({ consultantId, schedule: {} });
            }

            // Also fetch booked slots so the client can mask them
            const confirmedBookings = await bookings
                .find({ consultantId, status: { $ne: 'cancelled' } })
                .toArray();

            // Build a bookedSlots map: { "2026-06-25": ["09:00", "09:45"] }
            const bookedSlots = {};
            for (const b of confirmedBookings) {
                if (!bookedSlots[b.date]) bookedSlots[b.date] = [];
                bookedSlots[b.date].push(b.slot);
            }

            return res.status(200).json({
                consultantId: record.consultantId,
                schedule: record.schedule || {},
                bookedSlots,
                updatedAt: record.updatedAt
            });
        }

        // ─── PUT: Save / update consultant's availability schedule ──────────
        if (req.method === 'PUT') {
            const { consultantId, schedule } = req.body;
            if (!consultantId || !schedule) {
                return res.status(400).json({ error: 'consultantId and schedule are required' });
            }

            await availability.updateOne(
                { consultantId },
                {
                    $set: {
                        consultantId,
                        schedule,
                        updatedAt: new Date()
                    }
                },
                { upsert: true }
            );

            return res.status(200).json({ success: true, message: 'Availability saved' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Availability handler error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
