import { generateToken } from './_utils/auth-middleware.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, passcode } = req.body;

    if (!username || !passcode) {
        return res.status(400).json({ error: 'Username and passcode are required' });
    }

    // Credentials are read from server-side env vars (NOT VITE_ prefixed, so never exposed to client)
    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const expectedPasscode = process.env.ADMIN_PASSCODE;

    if (!expectedPasscode) {
        console.error('ADMIN_PASSCODE environment variable is not set');
        return res.status(503).json({ error: 'Admin authentication is not configured on the server.' });
    }

    if (username === expectedUsername && passcode === expectedPasscode) {
        const token = generateToken({ role: 'admin', username }, '24h');
        return res.status(200).json({ success: true, authenticated: true, token });
    }

    return res.status(401).json({ error: 'Invalid admin username or password.' });
}
