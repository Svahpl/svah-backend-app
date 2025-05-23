// code by weborium

// ========================== Imports =========================== //

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import { connectToDatabase } from './config/db.js';
import cors from 'cors'
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => {
    return res.send(`This is Svah's Backend Server!`);
});

// ========================== db health check route =========================== //
connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});

// ========================== defualt Middlewares =========================== //

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: "GET, POST, DELETE, PATCH, HEAD, PUT, OPTIONS",
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Credentials",
        "cache-control"
    ],
    exposedHeaders: ["Authorization"],
};

app.use(cors(corsOptions))
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('/tmp', { index: false }));
app.use(express.static(path.join(__dirname, "public"), { index: false }));
app.use(cookieParser());




export default app;
