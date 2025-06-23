import express from "express";
import {
  createQuotations, 
  getQuotations, 
  updateQuotations, 
  deleteQuotations,
  getAllQuotation,
  getfilerQuotation,
  searchQuotationsAPI,
  countQuotationsAPI,
  statusCounts,
  amountStatuses,
  getTotalCustomersCount,
  getAverageQuotation,
  convertQuotationToInvoice
} from "../controllers/quotationController.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// CRUD operations
router.post("/create", createQuotations);
router.get("/get", getQuotations);
router.put("/update", updateQuotations);
router.delete("/delete", deleteQuotations);

// List and search operations
router.get("/all", getAllQuotation);
router.get("/filter", getfilerQuotation);
router.get("/search", searchQuotationsAPI);

// Analytics and statistics
router.get("/count", countQuotationsAPI);
router.get("/status-count", statusCounts);
router.get("/amount-status", amountStatuses);
router.get("/total-customers", getTotalCustomersCount);
router.get("/average-value", getAverageQuotation);

// Convert quotation to invoice
router.post("/convert-to-invoice", convertQuotationToInvoice);

export default router; 