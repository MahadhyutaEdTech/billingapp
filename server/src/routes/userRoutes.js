import express from "express";

import { loginUser, registerUser,getUserDetails,updateUserImageController} from "../controllers/userController.js";
import {authMiddleware} from "../middlewares/authMiddleWare.js";
import upload from "../middlewares/upload.js";

const router = express.Router();
//Routes for login and signup..
router.post("/register",registerUser);
router.post("/login",loginUser);
router.get('/userDetails',getUserDetails);
router.post('/upload-image', upload.single('profile_image'), updateUserImageController);
export default router;