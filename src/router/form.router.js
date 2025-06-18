import { Router } from "express";
import { MessegeSubmit, SalseMessegeSubmit, getrequirement, getsalse } from "../controllers/formsubmission.controllers.js"
export const formRouter = new Router();

formRouter.route("/requirementform").post(MessegeSubmit);
formRouter.route("/salseform").post(SalseMessegeSubmit);
formRouter.route("/getrequirement").get(getrequirement);
formRouter.route("/getsalse").get(getsalse);
