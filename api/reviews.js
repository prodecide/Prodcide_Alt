import clientPromise from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const database = client.db('prodecide');
        const reviews = database.collection('reviews');
        const consultants = database.collection('consultants');

        if (req.method === 'GET') {
            const { consultantId } = req.query;
            if (!consultantId) {
                return res.status(400).json({ error: 'consultantId parameter is required' });
            }

            // Fetch reviews matching the consultantId
            const consultantReviews = await reviews.find({ consultantId }).toArray();
            
            // Calculate average rating
            let averageRating = 5.0;
            if (consultantReviews.length > 0) {
                const total = consultantReviews.reduce((sum, r) => sum + parseFloat(r.rating || 0), 0);
                averageRating = parseFloat((total / consultantReviews.length).toFixed(1));
            }

            return res.status(200).json({ reviews: consultantReviews, averageRating });
        }

        if (req.method === 'POST') {
            const { consultantId, userName, userEmail, rating, comment } = req.body;
            if (!consultantId || !rating || !userName) {
                return res.status(400).json({ error: 'consultantId, rating, and userName are required' });
            }

            const parsedRating = parseFloat(rating);
            if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
                return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
            }

            const newReview = {
                consultantId,
                userName: userName.trim(),
                userEmail: (userEmail || '').toLowerCase().trim(),
                rating: parsedRating,
                comment: (comment || '').trim(),
                createdAt: new Date()
            };

            await reviews.insertOne(newReview);

            // Re-calculate the average rating for the consultant
            const consultantReviews = await reviews.find({ consultantId }).toArray();
            const total = consultantReviews.reduce((sum, r) => sum + parseFloat(r.rating || 0), 0);
            const averageRating = parseFloat((total / consultantReviews.length).toFixed(1)).toString(); // Keep it as string or float depending on DB schema

            // Update the consultant's rating in the consultants collection
            let filter = { _id: consultantId };
            try {
                if (ObjectId.isValid(consultantId)) {
                    filter = { _id: new ObjectId(consultantId) };
                }
            } catch (e) {
                // Keep string ID filter
            }

            await consultants.updateOne(
                filter,
                { $set: { rating: averageRating } }
            );

            return res.status(201).json({ success: true, review: newReview, newAverageRating: averageRating });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Reviews API error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
