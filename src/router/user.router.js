import { Router } from 'express';
import {
    Signup,
    getAllUser,
    deleteUser,
    EmailByAdmin,
    getUser,
    getUserByClerkId,
    storeAddress,
    getUserAddress,
    deleteAddress,
} from '../controllers/Signup.controllers.js';
import { signup, login } from '../controllers/Admin.controllers.js';
import { AdminVerify } from '../middlewares/Admin.middlewares.js';
import { passwordOtp, verifyEmail, resetPassword } from '../controllers/Admin.controllers.js';
export const userRouter = new Router();

userRouter.route('/signup').post(Signup);
userRouter.route('/getalluser').get(AdminVerify, getAllUser);
userRouter.route('/deleteuser/:id').delete(AdminVerify, deleteUser);
userRouter.route('/send-Email').post(AdminVerify, EmailByAdmin);
userRouter.route('/user/:userId').get(getUser);
userRouter.route('/map/clerk/:clerkId').get(getUserByClerkId);
userRouter.route('/add/address').post(storeAddress);
userRouter.route('/get-user-address/:userId').get(getUserAddress);
userRouter.route('/delete/address/:addressId').delete(deleteAddress);

// admin signup and login part

userRouter.route('/adminSignup').post(signup);
userRouter.route('/login').post(login);
userRouter.post('/otp-for-password', passwordOtp);
userRouter.post('/verify-email', verifyEmail);
userRouter.post('/reset-password', resetPassword);
