import Router from "express";
import { createOrder, getAddress , getOrders } from "../controllers/Order.controllers.js";


export const OrderRouter = new Router();

OrderRouter.route("/create-order").post(createOrder);
OrderRouter.route("/get-order/:userId").get(getOrders)
OrderRouter.route("/address/:orderId").get(getAddress);
