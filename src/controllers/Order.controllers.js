import { User } from '../models/user.models.js';
import { Product } from '../models/product.models.js';
import { Order } from '../models/order.models.js';
import axios from 'axios';
import got from 'got';

const getCurrentDollarinInr = async () => {
    try {
        const res = await axios.get(`https://open.er-api.com/v6/latest/USD`);
        const inr = res.data.rates.INR;
        return inr;
    } catch (error) {
        console.log(error);
    }
};

const getAccessToken = async (req, res) => {
    try {
        const response = await got.post(`${process.env.PAYPAL_BASEURL}/v1/oauth2/token`, {
            form: {
                grant_type: 'client_credentials',
            },
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET,
        });
        const data = JSON.parse(response.body);
        const newAccessToken = data.access_token;
        return newAccessToken;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

const getPaymentStatus = async orderId => {
    const accessToken = await getAccessToken();
    try {
        const res = await axios.get(`${process.env.PAYPAL_BASEURL}/v2/checkout/orders/${orderId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log('----- PAYMENT STATUS RESPONSE ----', res.data.status);
        return res.data.status;
    } catch (error) {
        console.log(`Error during fetching Payment Status: ${error}`);
    }
};

export const getOrders = () => {};

export const createOrder = async (req, res) => {
    const {
        user,
        phoneNumber,
        shippingAddress,
        shipThrough,
        totalAmount,
        items,
        expectedDelivery,
        paypalOid,
    } = req.body;

    try {
        if (
            !user ||
            !phoneNumber ||
            !shippingAddress ||
            !shipThrough ||
            !items ||
            !expectedDelivery
        ) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required!',
            });
        }

        const userFound = await User.findById(user);
        if (!userFound) {
            return res.status(404).json({
                success: false,
                message: 'User not found in DB.',
            });
        }

        let totalCalc = 0;
        let totalWeight = 0;
        const enrichedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${item.product} not found`,
                });
            }

            const subtotal = product.price * item.quantity * item.weight;
            totalCalc += subtotal;
            totalWeight += item.weight;

            enrichedItems.push({
                product: item.product,
                title: product.title,
                images: product.images,
                quantity: item.quantity,
                price: product.price,
                weight: item.weight,
            });
        }

        const dollar = await getCurrentDollarinInr();
        let shippingCalc;
        if (shipThrough === 'air') {
            shippingCalc = totalWeight * (1000 / dollar);
        } else if (shipThrough === 'ship') {
            shippingCalc = totalWeight * (700 / dollar);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid Shipping Method',
            });
        }

        const backendTotal = totalCalc + shippingCalc;

        if (Math.round(backendTotal) !== Math.round(totalAmount)) {
            return res.status(400).json({
                success: false,
                message: 'Price mismatch between frontend and backend',
            });
        }

        const newOrder = await Order.create({
            user: userFound._id,
            userName: userFound.fullname,
            userEmail: userFound.email,
            phoneNumber,
            shippingAddress,
            totalAmount,
            shipThrough,
            items: enrichedItems,
            orderStatus: 'Pending',
            paymentStatus: 'Pending',
            expectedDelivery,
        });

        const paymentStatus = getPaymentStatus(paypalOid);
        if (paymentStatus === 'APPROVED') {
            newOrder.paymentStatus = 'Success';
            await newOrder.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Order Placed Successfully!',
            order: newOrder,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while creating order',
            error: error.message,
        });
    }
};

export const getAddress = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                msg: 'Order not found',
            });
        }
        const address = order.shippingAddress;
        res.status(200).json({
            success: true,
            msg: 'Address fetched successfully',
            address,
        });
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({
            success: false,
            msg: 'Something went wrong while fetching address',
            error: error.message,
        });
    }
};

export const generateFeatureProducts = async (req, res) => {
    try {
        const products = await Product.find();
        const getRandomProducts = arr => arr.sort(() => 0.5 - Math.random()).slice(0, 4);
        const featuredProducts = getRandomProducts(products);
        return res.status(200).json({ success: true, featuredProducts });
    } catch (error) {
        console.error(`Error generating featured products: ${error}`);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const getAllOrder = async (req,res) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ msg : "all order fetched" , orders})
    } catch (error) {
        console.log(error)
        res.status(402).json({ msg: "error in fetching product" , error})
    }
}


export const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status value provided.",
        });
    }

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        order.paymentStatus = status; // Or use order.status if you store a separate field
        await order.save();

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order,
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating status",
            error: error.message,
        });
    }
};
