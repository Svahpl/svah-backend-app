import Router from 'express';
import {
    createOrder,
    getAddress,
    getOrders,
    getAllOrder,
    updateOrderStatus,
} from '../controllers/Order.controllers.js';
import { AdminVerify } from '../middlewares/Admin.middlewares.js';
import { createCartOrder } from '../controllers/Cart.controllers.js';

export const OrderRouter = new Router();

OrderRouter.route('/create-order').post(createOrder);
OrderRouter.route('/create-cart-order').post(createCartOrder);
OrderRouter.route('/get-order/:userId').get(getOrders);
OrderRouter.route('/address/:orderId').get(getAddress);
OrderRouter.route('/getOrders').get(AdminVerify, getAllOrder);
OrderRouter.route('/orderstatus/:orderId').put(AdminVerify, updateOrderStatus);
