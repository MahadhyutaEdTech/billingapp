import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getExpenseById,
} from "../models/expenseModel.js";

/**
 * Create a new expense
 */
export const handleCreateExpense = async (req, res) => {
  try {
    const {
      expenseId,
      project,
      employee,
      paidby,
      natureOfFund,
      debit,
      credit,
      date,
      updatedDate,
      remarks,
      createdDate,
    } = req.body;

    await createExpense(
      expenseId,
      project,
      employee,
      paidby,
      natureOfFund,
      debit,
      credit,
      date,
      updatedDate,
      remarks,
      createdDate
    );

    res.status(201).json({ message: "Expense created successfully" });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ error: "Failed to create expense" });
  }
};

/**
 * Get all expenses with pagination
 */
export const handleGetExpenses = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const expenses = await getExpenses(limit, offset);
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

/**
 * Update an expense by expenseId
 */
export const handleUpdateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;

    const result = await updateExpense(id, updatedFields);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Expense not found or no changes made" });
    }

    res.status(200).json({ message: "Expense updated successfully" });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Failed to update expense" });
  }
};

/**
 * Delete an expense by expenseId
 */
export const handleDeleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteExpense(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

/**
 * Get single expense by ID
 */
export const handleGetExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await getExpenseById(id);

    if (!expense) {
      return res.status(404).json({ 
        message: `Expense with ID ${id} not found`,
        success: false 
      });
    }

    const formattedExpense = {
      ...expense,
      natureOfFund: Array.isArray(expense.natureOfFund) 
        ? expense.natureOfFund.map(nf => typeof nf === 'object' ? nf : { type: nf })
        : [{ type: expense.natureOfFund }]
    };

    res.status(200).json(formattedExpense);
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch expense details",
      message: error.message,
      success: false
    });
  }
};
