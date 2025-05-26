
import {z} from "zod";

export const ProductSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().positive("Price must be positive").min(0.01, "Price is required"),
    category: z.string().min(1, "Category is required"),
    quantity: z.coerce.number().int("Quantity must be an integer").min(0, "Quantity cannot be negative"),
});