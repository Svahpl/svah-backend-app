import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
const UserSchema = new mongoose.Schema(
    {
        clerkUserId: {
            type: String,
            required: false,
        },
        clerkUserName: {
            type: String,
            required: false,
        },
        FullName: {
            type: String,
            required: true,
        },
        Email: {
            type: String,
            required: true,
        },
        Password: {
            type: String,
            required: false,
        },
        Token: {
            type: String,
            required: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        ProfileImage: {
            type: String,
            default: false,
        },
        orders: [
            {
                orderId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Order',
                    required: false,
                },
            },
        ],
        cart: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
            },
        ],
        phoneNumber: {
            type: String,
        },
        address: [
            {
                addressLine1: { type: String },
                addressLine2: String,
                city: { type: String },
                state: { type: String },
                pinCode: { type: String },
            },
        ],
        isGuest: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);




export const User = new mongoose.model('User', UserSchema);
