import express from "express";
import {monthlyRevenues,highestSales,profitTrends} from "../controllers/dashboardController.js";
import {authMiddleware} from "../middlewares/authMiddleWare.js";
const router= express.Router();
router.get("/monthlyRevenue",authMiddleware,monthlyRevenues);
router.get("/highestSale",authMiddleware,highestSales);
router.get("/profitTrend",authMiddleware,profitTrends);

export default router;