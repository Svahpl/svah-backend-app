import { Router } from "express";
import { Signup, getAllUser, deleteUser, EmailByAdmin } from "../controllers/Signup.controllers.js"
import { signup , login } from "../controllers/Admin.controllers.js";
import { AdminVerify } from "../middlewares/Admin.middlewares.js";
export const userRouter = new Router();

userRouter.route("/signup").post(Signup);
userRouter.route("/getalluser").get(AdminVerify,getAllUser);
userRouter.route("/deleteuser/:id").delete(AdminVerify,deleteUser)
userRouter.route("/send-Email").post(AdminVerify,EmailByAdmin)

// admin signup and login part

userRouter.route("/adminSignup").post(signup);
userRouter.route("/login").post(login)