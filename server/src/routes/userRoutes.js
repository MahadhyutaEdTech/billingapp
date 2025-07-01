import express from "express";
import { loginUser, registerUser, getUserDetails, updateUserImageController, changePassword } from "../controllers/userController.js";
import { refreshToken, verifyEmail, requestPasswordReset, resetPassword } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";
import upload from "../middlewares/upload.js";


const router = express.Router();

// Rate limiting for auth routes


// Basic auth routes
router.post("/register",  registerUser);
router.post("/login",  loginUser);
router.get('/userDetails', authMiddleware, getUserDetails);
router.post('/upload-image', authMiddleware, upload.single('profile_image'), updateUserImageController);
router.post('/change-password', authMiddleware, changePassword);

// Enhanced auth routes
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/request-password-reset',  requestPasswordReset);
router.post('/reset-password',  resetPassword);

export default router;