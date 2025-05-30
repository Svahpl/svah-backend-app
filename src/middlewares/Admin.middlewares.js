import { createClerkClient } from "@clerk/backend";

import { User } from "../models/user.models.js";
import dotenv from "dotenv";
dotenv.config();

export const AdminVerify = async (req, res, next) => {
    try {
        const { sessionClaims, isSignedIn } = await clerkClient.authenticateRequest(req, {
            jwtKey: process.env.CLERK_JWT_KEY,
            authorizedParties: ['https://example.com'], // optional based on your use
        });

        if (!isSignedIn) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = sessionClaims?.sub;

        const user = await User.findOne({ clerkUserId: userId });

        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("🛑 AdminVerify error:", error);
        return res.status(500).json({
            message: "Internal server error during admin verification",
            error: error?.message || error,
        });
    }
};
