import clientPromise from '../../lib/mongodb.js';

/**
 * Basic MongoDB-backed IP rate limiter for serverless environments.
 * 
 * @param {Object} req - The incoming request object (to extract IP)
 * @param {string} action - The action being limited (e.g., 'otp_generate', 'chat')
 * @param {number} limit - Maximum number of allowed requests in the window
 * @param {number} windowMs - The time window in milliseconds
 * @returns {Promise<{limited: boolean, remaining: number, retryAfter: number}>}
 */
export async function checkRateLimit(req, action, limit, windowMs) {
    try {
        // Extract IP address (works with Vercel and standard Express/Node setups)
        const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown-ip';
        const clientIP = typeof ip === 'string' ? ip.split(',')[0].trim() : ip;

        const client = await clientPromise;
        const db = client.db('prodecide');
        const rateLimits = db.collection('rate_limits');

        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean up old records for this IP & action to prevent infinite growth
        // In a real prod environment, a MongoDB TTL index on `createdAt` is better.
        await rateLimits.deleteMany({
            ip: clientIP,
            action,
            timestamp: { $lt: windowStart }
        });

        // Count existing requests in the current window
        const requestCount = await rateLimits.countDocuments({
            ip: clientIP,
            action,
            timestamp: { $gte: windowStart }
        });

        if (requestCount >= limit) {
            // Find the oldest record in this window to calculate when they can retry
            const oldestRecord = await rateLimits.findOne(
                { ip: clientIP, action, timestamp: { $gte: windowStart } },
                { sort: { timestamp: 1 } }
            );
            
            const retryAfterMs = oldestRecord ? (oldestRecord.timestamp + windowMs - now) : windowMs;
            
            return {
                limited: true,
                remaining: 0,
                retryAfter: Math.ceil(retryAfterMs / 1000) // in seconds
            };
        }

        // Add the current request
        await rateLimits.insertOne({
            ip: clientIP,
            action,
            timestamp: now,
            createdAt: new Date() // Useful if they set up a TTL index
        });

        return {
            limited: false,
            remaining: limit - (requestCount + 1),
            retryAfter: 0
        };

    } catch (error) {
        console.error('Rate limiter error:', error);
        // Fail open: If the DB is down, don't block the user
        return { limited: false, remaining: limit, retryAfter: 0 };
    }
}
