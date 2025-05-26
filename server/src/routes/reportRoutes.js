import express from "express";
import { fetchReports } from "../controllers/reportsController.js";
import {authMiddleware} from "../middlewares/authMiddleWare.js";
const router= express.Router();
router.get("/reports",fetchReports);
export default router;