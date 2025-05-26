import express from "express";
import {createInvoices, getInvoices, updateInvoices, deleteInvoices,getAllInvoice,getfilerInvoice,searchInvoicesAPI,countInvoices,statusCounts,amountStatuses} from "../controllers/invoiceController.js";
import {authMiddleware} from "../middlewares/authMiddleWare.js";
const router= express.Router();
router.post("/create",createInvoices);
router.get("/get",getInvoices);
router.put("/update",authMiddleware,updateInvoices);
router.delete("/delete",authMiddleware,deleteInvoices);
router.get("/all",authMiddleware,getAllInvoice);
router.get("/filter",authMiddleware,getfilerInvoice);
router.get("/search",authMiddleware,searchInvoicesAPI);
router.get("/count",authMiddleware,countInvoices)
router.get("/statusCount",authMiddleware,statusCounts);
router.get("/amountStatuses",authMiddleware,amountStatuses);


export default router;