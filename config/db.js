import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongo_uri = process.env.MONGODB_URI;

const connectToDatabase = async () => {
    try {
    console.log(`Connecting to Database...`)
        await mongoose.connect(mongo_uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Database connection successful 🎉`);
    } catch (error) {
        console.log(`Database connection error : ${error}`);
        process.exit(0);
    }
};

export { connectToDatabase };
