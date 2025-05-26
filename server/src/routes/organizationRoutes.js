import express from "express";
import {createOrganizations,getOrganizations,updateOrganizations,deleteOrganizations,getOrganizationsById} from "../controllers/organizationController.js";
import {authMiddleware} from "../middlewares/authMiddleWare.js";
import upload from "../middlewares/upload.js";
const router= express.Router();
router.post("/create",upload.single('logo_image'),createOrganizations);
router.get("/get",authMiddleware,getOrganizations);
router.put("/update",authMiddleware,updateOrganizations);
router.delete("/delete",authMiddleware,deleteOrganizations);
router.get("/getById",authMiddleware,getOrganizationsById);

export default router;