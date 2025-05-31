import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
      //  rzpId: { type: String, required: false },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
                weight: {
                    type: Number,
                    required: true,
                    enum: [1, 5, 10, 25, 50, 100]
                }
            },
        ],
        phoneNumber: {
            type: String,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        shippingAddress: {
            type: String,
            required: true,
        },
        shipThrough : {
            type : String,
            enum : ["ship" , "airline"],
            
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Success", "Failed"],
            default: "Pending",
        },
        orderStatus: {
            type: String,
            enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
            default: "Pending",
        },
        placedAt: {
            type: Date,
            default: Date.now,
        },
        expectedDelivery: {
            type: Date,
        },
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
