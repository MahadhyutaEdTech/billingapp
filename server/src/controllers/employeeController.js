import { 
  createEmployee, 
  getAllEmployees, 
  getEmployeeById,
  updateEmployee,
  deleteEmployee 
} from "../models/employeeModel.js";

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

export const handleGetEmployeesById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching employee with ID:', id);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "Invalid employee ID format" });
    }

    const employee = await getEmployeeById(id);
    console.log('Employee data:', employee);

    if (!employee) {
      console.log('Employee not found for ID:', id);
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (err) {
    console.error("Error in handleGetEmployeesById:", err);
    res.status(500).json({ 
      error: "Failed to fetch employee",
      details: err.message 
    });
  }
};

export const handleUpdateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating employee:', id, req.body);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "Invalid employee ID format" });
    }

    // Update required fields to match actual employee data structure
    const requiredFields = ['firstName', 'lastName', 'email', 'position'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        fields: missingFields 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate date format if provided
    if (req.body.joinDate) {
      const date = new Date(req.body.joinDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid join date format" });
      }
    }

    // Validate salary if provided
    if (req.body.salary && isNaN(parseFloat(req.body.salary))) {
      return res.status(400).json({ error: "Invalid salary format" });
    }

    const updated = await updateEmployee(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({ 
      message: "Employee updated successfully",
      data: updated
    });
  } catch (err) {
    console.error("Error in handleUpdateEmployee:", err);
    res.status(500).json({ 
      error: "Failed to update employee",
      details: err.message 
    });
  }
};

export const handleDeleteEmployees = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "Invalid employee ID format" });
    }

    const deleted = await deleteEmployee(id);
    if (!deleted) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({ 
      message: "Employee deleted successfully",
      id: id
    });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ 
      error: "Failed to delete employee",
      details: err.message 
    });
  }
};