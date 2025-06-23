import express from "express";
import multer from "multer";
import {createOrganizations,getOrganizations,updateOrganizations,deleteOrganizations,getOrganizationsById} from "../controllers/organizationController.js";
import {authMiddleware} from "../middlewares/authMiddleWare.js";

const router= express.Router();

// Configure multer for both logo and signature
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});

// Update route handlers to use multiple file fields
router.post("/create", authMiddleware, upload.fields([
  { name: 'logo_image', maxCount: 1 },
  { name: 'signature_image', maxCount: 1 }
]), createOrganizations);

router.get("/get",authMiddleware,getOrganizations);
router.put("/update", authMiddleware, upload.fields([
  { name: 'logo_image', maxCount: 1 },
  { name: 'signature_image', maxCount: 1 }
]), updateOrganizations);
router.delete("/delete",authMiddleware,deleteOrganizations);
router.get("/getById",authMiddleware,getOrganizationsById);

export default router;