import Router from "express";
import { createOrder } from "../controllers/Order.controllers.js";


export const OrderRouter = new Router();

OrderRouter.route("/create-order").post(createOrder)

