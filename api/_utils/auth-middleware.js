import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'prodecide-fallback-secret-key-123';

/**
 * Generate a JWT token for a user or admin
 * @param {Object} payload - Data to encode in the token (e.g. { email, role })
 * @param {string} expiresIn - Expiration time (e.g. '24h', '7d')
 * @returns {string} Signed JWT token
 */
export function generateToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT token from the request headers
 * Expects header: "Authorization: Bearer <token>"
 * 
 * @param {Object} req - The incoming request
 * @returns {Object|null} Decoded token payload if valid, null if invalid/missing
 */
export function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (err) {
        return null; // Token expired or invalid
    }
}
