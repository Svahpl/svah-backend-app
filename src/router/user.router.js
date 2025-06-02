import { Router } from 'express';
import { Signup, getUserByClerkId } from '../controllers/Signup.controllers.js';

export const userRouter = new Router();

userRouter.route('/signup').post(Signup);
userRouter.route('/map/clerk/:clerkId').get(getUserByClerkId);
