import express from "express";
import {
  handleCreateEmployee,
  handleGetEmployees
} from "../controllers/employeeController.js";

const router = express.Router();

router.post("/employees", handleCreateEmployee);
router.get("/employees", handleGetEmployees);

export default router;
