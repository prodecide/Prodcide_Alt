import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Now import the handler after config is loaded
const { default: consultantsHandler } = await import('./api/consultants.js');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const vercelToExpress = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (error) {
        console.error('Error in handler:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

app.all('/api/consultants', vercelToExpress(consultantsHandler));

app.listen(port, () => {
    console.log(`Local API server running at http://localhost:${port}`);
});
