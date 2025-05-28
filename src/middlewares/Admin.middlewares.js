import { verifyToken } from "@clerk/backend";
import { User } from "../models/user.models.js"; // Make sure to add .js if needed
import dotenv from "dotenv";
dotenv.config({
    path : ".env"
})
export const AdminVerify = async (req, res, next) => {
    const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        console.log(process.env.CLERK_SECRET_KEY)
        const { payload } = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        req.user = payload;
        console.log(payload);
        const email =
            payload.email ||
            payload.email_address ||
            payload.primary_email_address ||
            (payload.email_addresses && payload.email_addresses[0]?.email_address);

        if (!email) {
            return res.status(400).json({ message: "Could not determine email from token." });
        }
        const user = await User.findOne({ Email: email });

        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }

        next(); // ✅ Let them proceed
    } catch (error) {
        console.error("Admin verification error:", error);
        return res.status(400).json({ message: "Something went wrong in admin verification", error });
    }
};

export default AdminVerify;
