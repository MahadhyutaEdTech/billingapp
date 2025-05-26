import express from "express";
import {getPayments,createPaymets} from "../controllers/paymentController.js";
import {authMiddleware} from "../middlewares/authMiddleWare.js";
const router= express.Router();

router.get("/get",authMiddleware,getPayments);
router.post("/create",authMiddleware,createPaymets);



export default router;