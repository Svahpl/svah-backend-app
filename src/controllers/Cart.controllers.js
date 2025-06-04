import { User } from "../models/user.models.js";
import { Product } from "../models/product.models.js";
import mongoose from "mongoose";

export const addCart = async(req,res) => {
    const { userId, productId , quantity } = req.body;

    try {        
        const productToAdd = await Product.findById(productId);
        if (!productToAdd) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
          }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
          }
        // Check if the product already exists in the cart
        const existingCartItemIndex = user.cart.findIndex(
            (item) => item.productId.toString() === productId
          );


        if (existingCartItemIndex !== -1) {
            // Product exists in cart, increment quantity
            user.cart[existingCartItemIndex].quantity += quantity;
        } else {
            // Product doesn't exist in cart, add it
            user.cart.push({ productId: productToAdd._id, quantity });
      }

        // Save the updated user
        await user.save();

        return res.status(200).json({
            message:
                existingCartItemIndex !== -1
                    ? "Item quantity updated in cart"
                    : "Item added to cart successfully",
            success: true,
            product: productToAdd,
        });


    } catch (error) {
        console.log(error)
        res.status(403).json({ msg : "some error occure in addCart" , error})
    }
}

export const deleteCartItem = async (req, res) => {
    try {
        // get user and product id
        const { userId, productId } = req.query;
        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "User ID and Product ID are required",
            });
        }
        // search product inside cart and delete it
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    cart: { productId: productId },
                },
            },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product removed from cart successfully",
            cart: updatedUser.cart, // Return updated cart
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: "false",
            message: "Error deleting item from user's cart",
        });
    }
  };


export const getUserCart = async (req, res) => {
    const { userId } = req.params;

    try {
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID required",
            });
        }

        // Fetch user with cart only
        const user = await User.findById(userId).select("cart");
        if (!user || user.cart.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No items in cart",
                items: [],
            });
        }

        // Create map of productId => { quantity, cartItemId }
        const cartItemsMap = {};
        user.cart.forEach((item) => {
            cartItemsMap[item.productId.toString()] = {
                quantity: item.quantity,
                cartItemId: item._id, // This is the _id of the cart item in user's cart
            };
        });

        // Fetch full product info for each product in the cart
        const products = await Product.find({
            _id: { $in: Object.keys(cartItemsMap) },
        });

        // Attach quantity and cart item ID to each product
        const itemsWithQuantity = products.map((product) => {
            const productIdStr = product._id.toString();
            const { quantity, cartItemId } = cartItemsMap[productIdStr];

            return {
                ...product.toObject(), // Spread full product details
                quantity,
                cartItemId, // This is the cart item _id from user's cart
            };
        });

        // Send response
        return res.status(200).json({
            success: true,
            message: "Cart items fetched successfully",
            cartId: user._id, // still user's ID
            items: itemsWithQuantity,
        });

    } catch (error) {
        console.error("Error fetching cart:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching cart items",
            error: error.message,
        });
    }
};
  

export const updateCartItemQuantity = async (req, res) => {
    try {
        const { userId, cartItemId } = req.params;
        const { action, newQuantity } = req.body;

        console.log("userId:", userId);
        console.log("cartItemId:", cartItemId);
        console.log("Action:", action);

        // Convert cartItemId to ObjectId
        const objectIdCartItemId = new mongoose.Types.ObjectId(cartItemId);

        // Fetch the user document
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Find the cart item by its _id
        const itemFound = user.cart.find(
            (item) => item._id.toString() === objectIdCartItemId.toString()
        );

        if (!itemFound) {
            return res.status(404).json({ success: false, message: "Cart item not found" });
        }

        // Now fetch the product using itemFound.productId
        const product = await Product.findById(itemFound.productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Handle Increase Action
        if (action === "increase") {
            if (itemFound.quantity + 1 > product.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.quantity} items left in stock`,
                });
            }
            itemFound.quantity += 1;
        }

        // Handle Decrease Action
        else if (action === "decrease") {
            if (itemFound.quantity - 1 < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity cannot be less than 1",
                });
            }
            itemFound.quantity -= 1;
        }

        // Handle Direct Quantity Update
        else if (newQuantity) {
            if (newQuantity > product.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.quantity} items left in stock`,
                });
            }
            if (newQuantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity cannot be less than 1",
                });
            }
            itemFound.quantity = newQuantity;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid action or newQuantity",
            });
        }

        // Mark cart as modified
        user.markModified("cart");

        // Save the updated user document
        await user.save();

        return res.status(200).json({ success: true, itemFound });
    } catch (error) {
        console.log(`Error updating cart item quantity: ${error}`);
        return res.status(500).json({ success: false, error });
    }
};
