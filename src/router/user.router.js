
import { Router } from "express";
import { Signup , getUserByClerkId , getAllUser, deleteUser, EmailByAdmin } from "../controllers/Signup.controllers.js"


export const userRouter = new Router();

userRouter.route("/signup").post(Signup);
userRouter.route("/getalluser").get(getAllUser);
userRouter.route("/deleteuser/:id").delete(deleteUser)
userRouter.route("/send-Email").post(EmailByAdmin)
userRouter.route('/map/clerk/:clerkId').get(getUserByClerkId);

