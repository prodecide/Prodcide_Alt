import clientPromise from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';
import { sendOtpEmail } from './utils/email.js';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const isMock = !!client.isMock;
        const connectionError = client.connectionError || null;
        const database = client.db('prodecide');
        const consultants = database.collection('consultants');
        const otps = database.collection('otps');

        const { action } = req.query;

        if (req.method === 'POST') {
            if (action === 'send-otp') {
                const { email } = req.body;
                if (!email) {
                    return res.status(400).json({ error: 'Email is required' });
                }

                const normalizedEmail = email.toLowerCase().trim();

                // Verify the consultant is registered before sending the OTP code
                const consultant = await consultants.findOne({ email: normalizedEmail });
                if (!consultant) {
                    return res.status(404).json({ error: 'This email is not registered as a consultant. Please register first.' });
                }

                // Generate a 6-digit OTP code
                const code = Math.floor(100000 + Math.random() * 900000).toString();

                // Save to OTP collection
                await otps.insertOne({
                    email: normalizedEmail,
                    code,
                    createdAt: new Date()
                });

                // Send email
                await sendOtpEmail(email, code);

                return res.status(200).json({ success: true, message: 'OTP sent successfully', isMock, connectionError });
            }

            if (action === 'verify-otp') {
                const { email, code } = req.body;
                if (!email || !code) {
                    return res.status(400).json({ error: 'Email and OTP code are required' });
                }

                // Verify the OTP code
                const record = await otps.findOne({
                    email: email.toLowerCase().trim(),
                    code: code.trim()
                });

                if (!record) {
                    return res.status(400).json({ error: 'Invalid or expired OTP code' });
                }

                // Check expiration (10 minutes)
                const now = new Date();
                const otpTime = new Date(record.createdAt);
                if (now - otpTime > 10 * 60 * 1000) {
                    return res.status(400).json({ error: 'OTP code has expired' });
                }

                return res.status(200).json({ success: true, verified: true, isMock });
            }

            if (action === 'google-link') {
                const { email, googleId, name, profileImage } = req.body;
                if (!email || !googleId) {
                    return res.status(400).json({ error: 'Email and Google ID are required' });
                }

                // Find consultant by email and update it with googleId
                const consultant = await consultants.findOne({ email: email.toLowerCase().trim() });
                if (!consultant) {
                    return res.status(404).json({ error: 'Consultant application not found. Please submit details first.' });
                }

                let filter = { _id: consultant._id };
                try {
                    if (ObjectId.isValid(consultant._id)) {
                        filter = { _id: new ObjectId(consultant._id) };
                    }
                } catch (e) {
                    // Keep string ID filter
                }

                await consultants.updateOne(
                    filter,
                    { 
                        $set: { 
                            googleId,
                            status: consultant.status || 'pending',
                            profileImage: consultant.profileImage || profileImage
                         } 
                    }
                );

                const updated = await consultants.findOne({ email: email.toLowerCase().trim() });
                return res.status(200).json({ success: true, consultant: updated, isMock });
            }

            if (action === 'login') {
                const { email, googleId } = req.body;
                
                let consultant = null;
                if (googleId) {
                    consultant = await consultants.findOne({ googleId });
                } else if (email) {
                    consultant = await consultants.findOne({ email: email.toLowerCase().trim() });
                }

                if (!consultant) {
                    return res.status(404).json({ error: 'No consultant profile found. Please register first.' });
                }

                return res.status(200).json({ success: true, consultant, isMock });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Auth handler error:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
}
