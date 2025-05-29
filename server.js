import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import { connectToDatabase } from './config/db.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { userRouter } from './src/router/user.router.js';
import { productRouter } from './src/router/product.router.js';
import { webhookRouter } from './src/router/webhook.router.js';
import paypalRouter from './src/router/paypal.router.js';
import { User } from './src/models/user.models.js';

dotenv.config();
const app = express();
const port = process.env.PORT;

// ========================== CORS Setup =========================== //

const corsOptions = {
    origin: 'https://www.svahpl.com',
    credentials: true,
    methods: 'GET, POST, DELETE, PATCH, HEAD, PUT, OPTIONS',
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Access-Control-Allow-Credentials',
        'cache-control',
        'svix-id',
        'svix-timestamp',
        'svix-signature',
    ],
    exposedHeaders: ['Authorization'],
};

// ====== Development CORS Options ======= //

const devCorsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: 'GET, POST, DELETE, PATCH, HEAD, PUT, OPTIONS',
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Access-Control-Allow-Credentials',
        'cache-control',
        'svix-id',
        'svix-timestamp',
        'svix-signature',
    ],
    exposedHeaders: ['Authorization'],
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors(corsOptions));

// ========================== IMPORTANT: Webhook Route =========================== //

app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRouter);

// ========================== Other Middlewares =========================== //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('/tmp', { index: false }));
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// ========================== API Routes =========================== //

app.get('/', (req, res) => {
    return res.send(`This is Svah's Backend Server!`);
});

app.use('/api/auth', userRouter);
app.use('/api/product', productRouter);
app.use('/api/paypal', paypalRouter);

app.get('/api/protected', ClerkExpressRequireAuth(), async (req, res) => {
    const userId = req.auth.userId;

    // Get the raw JWT token from the Authorization header
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    console.log('User ID:', userId);
    console.log('JWT Token:', token);

    const user = await User.findOne({ clerkUserId: userId });

    if (user && user.isAdmin) {
        return res.status(200).json({ msg: 'User Is Admin' });
    } else {
        return res.status(403).json({ msg: 'Access denied. Not an admin.' });
    }

    res.json({ message: `Hello user ${userId}` });
});

// ========================== DB and Server Start =========================== //

connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});

export default app;
