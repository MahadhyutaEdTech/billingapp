import express from "express";
import {
  handleCreateProject,
  handleGetProjects
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/projects", handleCreateProject);
router.get("/projects", handleGetProjects);

export default router;
