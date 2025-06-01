
import { Product } from "../models/product.models.js";
import { Order } from "../models/order.models.js";


export const createOrder = async (req, res) => {
    try {
        let {
            userId,
            phoneNumber,
            shippingaddress,
            items,
            shipThrough,
        } = req.body;

        if (!Array.isArray(items)) {
            if (typeof items === 'object' && items !== null) {
                items = [items];
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Items should be an array or a valid object.",
                });
            }
        }

        // ❗Validate required fields
        if (!userId || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: userId or items",
            });
        }


        // Determine shipping rate
        let shippingRatePerKg;
        if (shipThrough === "ship") {
            shippingRatePerKg = 700;
        } else if (shipThrough === "airline") {
            shippingRatePerKg = 1000;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid shipping method",
            });
        }

        let totalShippingCharge = 0;
        const allowedWeights = [1,5,10,25,50,100]
        const orderItems = await Promise.all(
            items.map(async (item) => {
                const product = await Product.findById(item.product);
                if (!product) {
                    throw new Error(`Product not found: ${item.product}`);
                }

                const quantity = item.quantity || 1;
                const price = item.price ?? product.price;
                const weight = Number(item.weight);

                if (!allowedWeights.includes(weight)) {
                    throw new Error(`Invalid weight selected for product ${product.title}. Choose from ${allowedWeights.join(", ")}`);
                }


                if (typeof price !== "number") {
                    throw new Error(`Invalid price for product: ${product.title}`);
                }

                totalShippingCharge += shippingRatePerKg * weight * quantity;

                return {
                    product: product._id,
                    title: product.title,
                    quantity,
                    price,
                    weight
                };
            })
        );

        const totalProductPrice = orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const totalAmount = totalProductPrice + totalShippingCharge;

        const order = await Order.create({
            user: userId,
            phoneNumber,
            shippingAddress: shippingaddress,
            shipThrough,
            items: orderItems,
            totalAmount,
        });

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order,
        });

    } catch (error) {
        console.error("🔥 Order Creation Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error creating order",
        });
    }
};


export const getAddress = async(req,res) => {
    const {orderId} = req.params;
    try {
        const order = await Order.findById(orderId);
        const address = order.shippingAddress;

        res.status(200).json({msg : "address fetched" , address})
    } catch (error) {
        console.log(error)
        res.status(403).json({msg : "somthing went wrong :" , error})
    }
}


export const generateFeatureProducts = async (req, res) => {
    try {
        const products = await Product.find();
        const getRandomProducts = (arr) =>
            arr.sort(() => 0.5 - Math.random()).slice(0, 4);
        const featuredProducts = getRandomProducts(products);
        return res.status(200).json({ success: true, featuredProducts });
    } catch (error) {
        console.log(`Error generating featured products: ${error}`);
        return res.status(500).json({ error });
    }
  };

