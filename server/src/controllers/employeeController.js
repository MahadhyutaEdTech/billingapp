import { createEmployee,getAllEmployees } from "../models/employeeModel.js";
export const handleCreateEmployee = async (req, res) => {
  try {
    await createEmployee(req.body);
    res.status(201).json({ message: "Employee created successfully" });
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(500).json({ error: "Failed to create employee" });
  }
};

export const handleGetEmployees = async (req, res) => {
  try {
    const employees = await getAllEmployees();
    res.status(200).json(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};