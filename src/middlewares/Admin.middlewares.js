// middlewares/AdminVerify.js
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { User } from "../models/user.models.js";

// This combines Clerk auth + DB admin check
export const AdminVerify = [
    ClerkExpressRequireAuth(), // First, verify the user is logged in via Clerk

    async (req, res, next) => {
        try {
            const userId = req.auth.userId;
            console.log(userId)
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized: No Clerk userId" });
            }

            // Look up the user in your DB by Clerk userId
            const user = await User.findOne({ ClerkUserId: userId });

            if (!user || !user.isAdmin) {
                return res.status(403).json({ message: "Access denied: Admins only" });
            }

            // Attach user data for future use
            req.user = user;
            next();
        } catch (error) {
            console.error("AdminVerify middleware error:", error);
            res.status(500).json({ message: "Admin verification failed", error });
        }
    }
];
