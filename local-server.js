import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Now import the handler after config is loaded
const { default: consultantsHandler } = await import('./api/consultants.js');
const { default: authHandler } = await import('./api/auth.js');
const { default: generateBioHandler } = await import('./api/generate-bio.js');
const { default: discoveryChatHandler } = await import('./api/discovery-chat.js');
const { default: usersHandler } = await import('./api/users.js');
const { default: reviewsHandler } = await import('./api/reviews.js');
const { default: userProfilesHandler } = await import('./api/user-profiles.js');
const { default: processAvatarHandler } = await import('./api/process-avatar.js');
const { default: availabilityHandler } = await import('./api/availability.js');
const { default: bookingsHandler } = await import('./api/bookings.js');
const { default: paymentHandler } = await import('./api/payment.js');

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
app.all('/api/auth', vercelToExpress(authHandler));
app.all('/api/generate-bio', vercelToExpress(generateBioHandler));
app.all('/api/discovery-chat', vercelToExpress(discoveryChatHandler));
app.all('/api/users', vercelToExpress(usersHandler));
app.all('/api/reviews', vercelToExpress(reviewsHandler));
app.all('/api/user-profiles', vercelToExpress(userProfilesHandler));
app.all('/api/process-avatar', vercelToExpress(processAvatarHandler));
app.all('/api/availability', vercelToExpress(availabilityHandler));
app.all('/api/bookings', vercelToExpress(bookingsHandler));
app.all('/api/payment', vercelToExpress(paymentHandler));

app.listen(port, () => {
    console.log(`Local API server running at http://localhost:${port}`);
});

