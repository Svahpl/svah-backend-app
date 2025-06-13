import Router from "express";
import { createOrder, getAddress, getOrders, getAllOrder, updateOrderStatus } from "../controllers/Order.controllers.js";
import { AdminVerify} from "../middlewares/Admin.middlewares.js"

export const OrderRouter = new Router();

OrderRouter.route("/create-order").post(createOrder);
OrderRouter.route("/get-order/:userId").get(getOrders)
OrderRouter.route("/address/:orderId").get(getAddress);
OrderRouter.route("/getOrders").get(AdminVerify , getAllOrder);
OrderRouter.route("/orderstatus/:orderId").put(AdminVerify, updateOrderStatus);