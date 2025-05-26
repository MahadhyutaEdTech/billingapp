import express from "express";
import {createTax,getTax,updateTax,deleteTax} from "../controllers/taxController.js";
import {authMiddleware} from "../middlewares/authMiddleWare.js";
const router=express.Router();

router.post("/create",authMiddleware,createTax);
router.get("/get",authMiddleware,getTax);
router.put("/update",authMiddleware,updateTax);
router.delete("/delete",authMiddleware,deleteTax);

export default router;
