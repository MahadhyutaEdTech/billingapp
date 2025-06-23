import express from "express";
import {
  handleCreateEmployee,
  handleGetEmployees,
  handleGetEmployeesById,
  handleUpdateEmployee,  // Changed from handleUpdateEmployees
  handleDeleteEmployees
} from "../controllers/employeeController.js";

const router = express.Router();

router.post("/employees", handleCreateEmployee);
router.get("/employees", handleGetEmployees);
router.get("/employees/:id", handleGetEmployeesById);
router.put("/employees/:id", handleUpdateEmployee);  // Changed to match controller
router.delete("/employees/:id", handleDeleteEmployees);


export default router;
