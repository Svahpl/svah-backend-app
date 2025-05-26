import { Router } from "express";
import {upload }from "../middlewares/multer-middlewares.js"

import {
    productController,
    getAllProducts,
    updateProduct,
    deleteProduct
} from "../controllers/Product.controllers.js"

const productRouter = new Router();


productRouter.route("/add").post(
    upload.array("images", 5),
    productController
  );


  productRouter.delete("/delete-product/:id", verifyAdmin, deleteProduct);
  productRouter.get("/get-all",getAllProducts);
  productRouter.put("/update-product:id",upload.array(ImageTrackList,5),updateProduct);