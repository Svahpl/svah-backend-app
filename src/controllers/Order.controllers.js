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

export const createOrder = async (req, res) => {
    try {
        const dollar = await getCurrentDollarinInr();
        const {
            userId,
            phoneNumber,
            shippingaddress,
            finalAmount,
            shipThrough,
            items,
            qty,
            userSelectedWeight,
            paypalOrderId,
        } = req.body;

        // Calculate product price
        console.log(items);
        const productPrices = items.map(item => item.price * item.weight * item.qty);
        console.log('PRODUCT PRICES ARRAY', productPrices);
        const totalPrice = productPrices.reduce((currentTotal, item) => item + currentTotal, 0);
        console.log('TOTAL PRICE CALCULATED BACKEND:', totalPrice);

        // Calculate total weight from items
        const totalWeight = items.reduce((acc, item) => acc + item.weight * item.qty, 0);

        // Shipping method validation
        if (totalWeight < 100 && shipThrough === 'ship') {
            console.log('--- Shipping method should be Air. Weight under 100kg ---');
            return res.status(400).json({
                error: 'Weight is below 100 Kg. Shipping method mandatorily AIR required. Order Rejected.',
            });
        }

        // Get product references
        const orderItems = await Promise.all(
            items.map(async item => {
                const product = await Product.findById(item._id);
                if (!product) {
                    console.log(`Product not found: ${item._id}`);
                    throw new Error(`Product not found: ${item._id}`);
                }
                return {
                    product: product._id,
                    weight: item.weight,
                    quantity: item.qty,
                    price: product.price,
                };
            }),
        );

        // Calculate shipping cost
        let shippingCost;
        let shippingMethod;
        const shipCost = 700 / dollar;
        const airCost = 1000 / dollar;

        if (shipThrough === 'air') {
            shippingCost = totalWeight * airCost;
            shippingMethod = 'airline';
        } else if (shipThrough === 'ship') {
            shippingCost = totalWeight * shipCost;
            shippingMethod = 'ship';
        }

        const totalBill = totalPrice + shippingCost;

        if (Math.trunc(totalBill) !== Math.trunc(finalAmount)) {
            console.log('--- PRICE MISMATCH DETECTED ---');
            console.log('Items:', items);
            console.log('Dollar Rate:', dollar);
            console.log('Shipping:', shipThrough);
            console.log('Shipping Cost:', shippingCost);
            console.log('Total Product Price:', totalPrice);
            console.log('Total Bill (calculated):', totalBill);
            console.log('Final Amount (from frontend):', finalAmount);
            return res
                .status(409)
                .json({ success: false, error: 'PRICING MISMATCH IN BACKEND AND FRONTEND' });
        }

        const finalTotalBill = finalAmount.toFixed(2);

        // Create order
        const order = await Order.create({
            user: userId,
            items: orderItems,
            phoneNumber: phoneNumber,
            totalAmount: finalTotalBill,
            shippingAddress: shippingaddress,
            shipThrough: shippingMethod,
        });

        // Check payment status
        const payStatus = await getPaymentStatus(paypalOrderId);
        if (payStatus === 'APPROVED') {
            await Order.updateOne({ _id: order._id }, { paymentStatus: 'Success' });
        }

        return res.status(200).json({ success: true, message: 'Order placed successfully!' });
    } catch (error) {
        console.log('--- ERROR ---', error);
        return res.status(500).json({ error: error.message });
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
