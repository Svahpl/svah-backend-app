import { Router } from "express";
import { Signup } from "../controllers/Signup.controllers.js"
export const userRouter = new Router();

userRouter.route("/signup").post(Signup);