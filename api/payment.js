import Razorpay from 'razorpay';
import crypto from 'crypto';
import clientPromise from '../lib/mongodb.js';

const KEY_ID     = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action } = req.query;

    // ─── CREATE ORDER ────────────────────────────────────────────────────────
    if (action === 'create-order') {
        if (!KEY_ID || !KEY_SECRET) {
            return res.status(503).json({
                error: 'Payment gateway not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.',
                unconfigured: true
            });
        }

        const { amount, currency = 'INR', consultantId, consultantName, date, slot, clientEmail } = req.body;

        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        try {
            const razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

            const order = await razorpay.orders.create({
                amount: Math.round(amount * 100), // paise
                currency,
                receipt: `pd_${Date.now()}`,
                notes: {
                    consultantId: consultantId || '',
                    consultantName: consultantName || '',
                    date: date || '',
                    slot: slot || '',
                    clientEmail: clientEmail || ''
                }
            });

            return res.status(200).json({
                orderId:  order.id,
                amount:   order.amount,
                currency: order.currency,
                keyId:    KEY_ID
            });
        } catch (err) {
            console.error('Razorpay order creation failed:', err);
            return res.status(500).json({ error: 'Failed to create payment order', details: err.message });
        }
    }

    // ─── VERIFY PAYMENT & SAVE BOOKING ──────────────────────────────────────
    if (action === 'verify') {
        if (!KEY_SECRET) {
            return res.status(503).json({ error: 'Payment gateway not configured.', unconfigured: true });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            // Booking payload
            consultantId,
            consultantEmail,
            consultantName,
            date,
            slot,
            clientName,
            clientEmail,
            context,
            amountPaid
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment verification fields' });
        }

        // Verify HMAC-SHA256 signature
        const generated = crypto
            .createHmac('sha256', KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generated !== razorpay_signature) {
            return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
        }

        // Signature is valid — save booking to DB
        try {
            const client = await clientPromise;
            const db = client.db('prodecide');
            const bookings = db.collection('bookings');
            const availability = db.collection('availability');

            // Double-booking guard
            const conflict = await bookings.findOne({
                consultantId, date, slot, status: { $ne: 'cancelled' }
            });
            if (conflict) {
                return res.status(409).json({ error: 'Slot just taken. Please select another.' });
            }

            const bookingId = 'PD-' + Math.floor(100000 + Math.random() * 900000);
            const meetLink  = `https://meet.google.com/pd-${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 5)}`;

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
                meetLink,
                status: 'pending',
                payment: {
                    orderId:   razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    amount:    amountPaid,
                    currency:  'INR',
                    status:    'paid'
                },
                createdAt: new Date()
            };

            const result = await bookings.insertOne(newBooking);

            return res.status(201).json({ ...newBooking, _id: result.insertedId });
        } catch (err) {
            console.error('Booking save after payment failed:', err);
            return res.status(500).json({ error: 'Payment received but booking save failed. Contact support.', details: err.message });
        }
    }

    return res.status(400).json({ error: 'Unknown action' });
}
