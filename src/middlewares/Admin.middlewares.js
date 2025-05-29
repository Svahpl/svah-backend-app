import { verifyToken } from "@clerk/backend";
import { User } from "../models/user.models.js";
import dotenv from "dotenv";
dotenv.config();

export const AdminVerify = async (req, res, next) => {
    const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log(token)
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        console.log("🔐 Verifying token...");
        const verified = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        console.log(verified)

        const payload = verified;
        console.log("✅ Token payload keys:", Object.keys(payload));
        console.log("📦 Full Payload:", JSON.stringify(payload, null, 2));

        const userId =
            payload.sub || payload.id || payload.clerk_user_id || payload.userId;

        console.log("user :",userId)

        const user = await User.findOne({ clerkUserId: userId });
        console.log("user new one :" , user)
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("🛑 AdminVerify error:", error?.stack || error);
        return res.status(400).json({
            message: "Something went wrong in admin verification",
            error: error?.message || error,
        });
    }
};
