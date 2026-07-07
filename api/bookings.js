import clientPromise from '../lib/mongodb.js';
import { sendBookingAlertToConsultant } from './utils/email.js';
import { checkRateLimit } from './utils/rate-limiter.js';


export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const database = client.db('prodecide');
        const bookings = database.collection('bookings');
        const availability = database.collection('availability');

        // ─── GET: Fetch bookings for a consultant (for dashboard) ──────────
        if (req.method === 'GET') {
            const { consultantId, consultantEmail } = req.query;
            let query = {};
            if (consultantId) query.consultantId = consultantId;
            else if (consultantEmail) query.consultantEmail = consultantEmail;
            else return res.status(400).json({ error: 'consultantId or consultantEmail is required' });

            const result = await bookings
                .find(query)
                .sort({ createdAt: -1 })
                .toArray();

            return res.status(200).json(result);
        }

        // ─── POST: Create a new booking ─────────────────────────────────────
        if (req.method === 'POST') {
            const {
                consultantId,
                consultantEmail,
                consultantName,
                date,        // "2026-06-25"
                slot,        // "09:00"
                clientName,
                clientEmail,
                context,
                meetLink
            } = req.body;

            if (!consultantId || !date || !slot || !clientEmail) {
                return res.status(400).json({ error: 'Missing required booking fields' });
            }

            // Rate limit: Max 5 bookings per hour per IP
            const limitCheck = await checkRateLimit(req, 'booking_create', 5, 60 * 60 * 1000);
            if (limitCheck.limited) {
                return res.status(429).json({ error: `Too many booking attempts. Try again in ${limitCheck.retryAfter} seconds.` });
            }

            // Check slot is still available (prevent double-booking)
            const conflict = await bookings.findOne({
                consultantId,
                date,
                slot,
                status: { $ne: 'cancelled' }
            });

            if (conflict) {
                return res.status(409).json({ error: 'This slot has just been booked. Please choose another.' });
            }

            // Check that slot exists in consultant's availability
            const avail = await availability.findOne({ consultantId });
            if (avail && avail.schedule) {
                const daySlots = avail.schedule[date] || [];
                if (daySlots.length > 0 && !daySlots.includes(slot)) {
                    return res.status(400).json({ error: 'Selected slot is not in consultant availability.' });
                }
            }

            const bookingId = 'PD-' + Math.floor(100000 + Math.random() * 900000);

            const newBooking = {
                bookingId,
                consultantId,
                consultantEmail,
                consultantName,
                date,
                slot,
                clientName,
                clientEmail,
                context,
                meetLink: meetLink || `https://meet.google.com/pd-${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 5)}`,
                status: 'pending',   // pending → accepted / declined by consultant
                createdAt: new Date()
            };

            const result = await bookings.insertOne(newBooking);

            // Send email notification to the consultant (failsafe)
            try {
                const protocol = req.headers['x-forwarded-proto'] || 'http';
                const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3001';
                let origin = `${protocol}://${host}`;
                if (host.includes('localhost:3001')) {
                    origin = 'http://localhost:5173';
                }
                const insertedBooking = { ...newBooking, _id: result.insertedId };
                await sendBookingAlertToConsultant(insertedBooking, origin);
            } catch (emailErr) {
                console.error('Failed to send booking alert email to consultant:', emailErr);
            }

            return res.status(201).json({ ...newBooking, _id: result.insertedId });
        }

        // ─── PUT: Update booking status (consultant accepts/declines) ────────
        if (req.method === 'PUT') {
            const { bookingId, status } = req.body;
            if (!bookingId || !status) {
                return res.status(400).json({ error: 'bookingId and status are required' });
            }

            const result = await bookings.updateOne(
                { bookingId },
                { $set: { status, updatedAt: new Date() } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Booking not found' });
            }

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Bookings handler error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
