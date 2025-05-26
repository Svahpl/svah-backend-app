// code by weborium

// ========================== Imports =========================== //

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import { connectToDatabase } from './config/db.js';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";

import { userRouter } from "../backend/src/router/user.router.js"; // ⬅ Import routes up top

dotenv.config();
const app = express();
const port = process.env.PORT;

// ========================== Default Middlewares =========================== //

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: "GET, POST, DELETE, PATCH, HEAD, PUT, OPTIONS",
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Access-Control-Allow-Credentials",
        "cache-control",
    ],
    exposedHeaders: ["Authorization"],
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json()); 
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('/tmp', { index: false }));
app.use(express.static(path.join(__dirname, "public"), { index: false }));

// ========================== API Routes =========================== //

app.get('/', (req, res) => {
    return res.send(`This is Svah's Backend Server!`);
});

app.use("/api/auth", userRouter);

// ========================== DB and Server Start =========================== //

connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});

export default app;
