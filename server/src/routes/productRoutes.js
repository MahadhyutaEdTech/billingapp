import express from "express";
import {registerProducts,allProducts,updatedProducts,deleteProducts,getProductsById} from "../controllers/productController.js";
import {authMiddleware} from "../middlewares/authMiddleWare.js";
const router= express.Router();
router.post("/create",authMiddleware,registerProducts);
router.get("/get",authMiddleware,allProducts);
router.put("/update",authMiddleware,updatedProducts);
router.delete("/delete",authMiddleware,deleteProducts);
router.get("/byId",authMiddleware,getProductsById);


export default router;