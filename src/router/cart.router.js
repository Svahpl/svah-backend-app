import Router from "express";
import { getUserCart, addCart , deleteCartItem } from "../controllers/Cart.controllers.js";

export const CartRouter = new Router();

CartRouter.get("/getcart/:userId", getUserCart);
CartRouter.post("/add-to-cart", addCart);
CartRouter.delete("/delete-cart-item", deleteCartItem);