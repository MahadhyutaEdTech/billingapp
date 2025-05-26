import express from "express";
import {
  handleCreateExpense,
  handleGetExpenses,
  handleUpdateExpense,
  handleDeleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

// Create a new expense
router.post("/expenses", handleCreateExpense);

// Get all expenses (with optional pagination)
router.get("/expenses", handleGetExpenses);

// Update a specific expense by ID
router.put("/expenses/:id", handleUpdateExpense);

// Delete a specific expense by ID
router.delete("/expenses/:id", handleDeleteExpense);

export default router;
