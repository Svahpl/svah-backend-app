import { User } from "../models/user.models.js";
import { Product } from "../models/product.models.js";
import {uploadoncloudinary} from "../utils/cloudinary.js"
import { v2 as cloudinary } from "cloudinary";
import {ProductSchema} from "../utils/auth.validation.js"


export const productController = async (req, res) => {
    try {
        console.log(req.body)
        const { data, error } = ProductSchema.safeParse(req.body);
        console.log(data)
        if (error) {
            return res.status(400).json({ message: error.errors[0].message });
        }

        const { title, description, price, category, quantity, subcategory, KeyIngredients} = data;

        if (!title || !description || !price || !category || !quantity ) {
            return res
                .status(400)
                .json({ error: "Please provide all required fields." });
        }

        if (!req.files || req.files.length === 0) {
            return res
                .status(400)
                .json({ error: "At least one image file is required." });
        }

        // Upload images sequentially
        let imageUrls = [];
        for (const file of req.files) {
            const uploadedImage = await uploadoncloudinary(file.path);
            if (uploadedImage.url) {
                imageUrls.push(uploadedImage.url);
            }
        }

        if (imageUrls.length === 0) {
            return res
                .status(500)
                .json({ error: "Image upload to Cloudinary failed." });
        }

        const newProduct = await Product.create({
            title,
            description,
            price,
            quantity,
            category,
            subcategory,
            KeyIngredients,
            images: imageUrls,
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully.",
            product: newProduct,
        });
    } catch (error) {
        console.error("Error:", error);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json({ success: true, products });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
};

export const updateProduct = async (req, res) => {
    
    const { id } = req.params;
    const { data, error } = ProductSchema.safeParse(req.body);
    if (error) {
        return res.status(400).json({ message: error.errors[0].message });
    }

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let imageUrls = product.images; 

        // ✅ Handle new image uploads
        if (req.files && req.files.length > 0) {
            // Delete old images from Cloudinary
            for (const imgUrl of product.images) {
                const publicId = imgUrl.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }

            // Upload new images to Cloudinary
            imageUrls = [];
            for (const file of req.files) {
                const uploadedImage = await uploadoncloudinary(file.path);
                if (uploadedImage.url) {
                    imageUrls.push(uploadedImage.url);
                }
            }
        }

        // ✅ Create dynamic update object
        const updateObject = {};
        if (data.title) updateObject.title = data.title;
        if (data.description) updateObject.description = data.description;
        if (data.price) updateObject.price = data.price;
        if (data.category) updateObject.category = data.category;
        if (data.subcategory) updateObject.subcategory = data.subcategory
        if (data.KeyIngredients) updateObject.KeyIngredients = data.KeyIngredients
        if (data.hasOwnProperty("quantity")) updateObject.quantity = data.quantity;
        if (data.size) updateObject.size = data.size;
        if (imageUrls.length > 0) updateObject.images = imageUrls; // Only update images if new ones exist

        // ✅ Update product with new values
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateObject },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (error) {
        console.error("Error in product update:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {
        const product = await Product.findByIdAndDelete(id);
        if (product.images && product.images.public_id) {
            await cloudinary.uploader.destroy(product.images);
        }
        res.status(200).json({ messege: "product deleted", product });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error });
    }
};