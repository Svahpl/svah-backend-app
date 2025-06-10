
import {z} from "zod";

export const ProductSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().positive("Price must be positive").min(0.01, "Price is required"),
    category: z.string().min(1, "Category is required"),
    quantity: z.coerce.number().int("Quantity must be an integer").min(0, "Quantity cannot be negative"),
    subcategory : z.string(),
    KeyIngredients : z.string()
});

export const UserSchema = z.object({

    Password: z.string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(20, { message: "password must be at least 20 characters long" }),


    Email: z.string()
        .email(),

})

export const LoginUser = z.object({
    Email: z.string()
        .email({ message: "Invalid email format" }),

    Password: z.string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(20, { message: "password must be at least 20 characters long" }),
})

