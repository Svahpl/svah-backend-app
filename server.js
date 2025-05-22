import dotenv from 'dotenv';
import express from 'express';
import { connectToDatabase } from './config/db.js';

dotenv.config();

const app = express();

const port = process.env.PORT;

app.get('/', (req, res) => {
    return res.send(`This is Svah's Backend Server!`);
});

connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});

export default app;
