import express from "express";
import { determineGstType } from "../controllers/gstTypeController.js";
import {authMiddleware} from "../middlewares/authMiddleWare.js";
const router= express.Router();
router.post("/gstType",authMiddleware,determineGstType);
export default router;