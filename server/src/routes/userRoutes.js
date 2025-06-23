import express from "express";
import { loginUser, registerUser, getUserDetails, updateUserImageController, changePassword } from "../controllers/userController.js";
import { refreshToken, verifyEmail, requestPasswordReset, resetPassword } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";
import upload from "../middlewares/upload.js";
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many attempts, please try again after 15 minutes'
});

// Basic auth routes
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.get('/userDetails', authMiddleware, getUserDetails);
router.post('/upload-image', authMiddleware, upload.single('profile_image'), updateUserImageController);
router.post('/change-password', authMiddleware, changePassword);

// Enhanced auth routes
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/request-password-reset', authLimiter, requestPasswordReset);
router.post('/reset-password', authLimiter, resetPassword);

export default router;