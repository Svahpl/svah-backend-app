import { Router } from "express";
import { MessegeSubmit, SalseMessegeSubmit } from "../controllers/formsubmission.controllers.js"
export const formRouter = new Router();

formRouter.route("/requirementform").post(MessegeSubmit);
formRouter.route("/salseform").post(SalseMessegeSubmit);
