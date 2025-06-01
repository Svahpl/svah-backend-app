import Router from "express";
import { createOrder, getAddress } from "../controllers/Order.controllers.js";


export const OrderRouter = new Router();

OrderRouter.route("/create-order").post(createOrder)
OrderRouter.route("/address/:orderId").get(getAddress);
