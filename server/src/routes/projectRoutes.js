import express from "express";
import {
  handleCreateProject,
  handleGetProjects,
  handleGetProjectById,
  handleUpdateProject,
  handleDeleteProject,
} from "../controllers/projectController.js";
import {authMiddleware} from "../middlewares/authMiddleWare.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/projects", handleCreateProject);
router.get("/projects", handleGetProjects);
router.get("/projects/:id", handleGetProjectById);
router.put("/projects/:id", handleUpdateProject);
router.delete("/projects/:id", handleDeleteProject);

export default router;
