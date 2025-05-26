import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig"; // Your configured axios instance
import { API_BASE } from "../config/config";
import "../css/CreateExpensePage.css";

const CreateExpensePage = () => {
  const navigate = useNavigate();

  const [expense, setExpense] = useState({
    expenseId: `EXP${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`,
    project: "",
    employee: "",
    paidby: "",
    natureOfFund: "",
    debit: 0,
    credit: 0,
    date: new Date().toISOString().split("T")[0],
    updatedDate: new Date().toISOString().split("T")[0],
    remarks: "",
    createdDate: new Date().toISOString().split("T")[0],
  });

  // State for dropdown data
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Fetch projects and employees on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Authorization token is missing");

        const [projRes, empRes] = await Promise.all([
          axiosInstance.get(`${API_BASE}/proj/projects`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }),
          axiosInstance.get(`${API_BASE}/emp/employees`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }),
        ]);

        console.log("Projects API response:", projRes.data);
        console.log("Employees API response:", empRes.data);

        // Adjust these lines if your API response structure differs:
        // If projRes.data is an object with a projects array, use projRes.data.projects
        const projectsArray = Array.isArray(projRes.data)
          ? projRes.data
          : projRes.data.projects || [];
        setProjects(projectsArray);

        const employeesArray = Array.isArray(empRes.data)
          ? empRes.data
          : empRes.data.employees || [];
        setEmployees(employeesArray);
      } catch (error) {
        console.error("Error fetching projects/employees:", error);
      }
    };

    fetchData();
  }, []);

  // Form input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExpense((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Modified handler for natureOfFund radio buttons
  const handleNatureOfFundChange = (type) => {
    setExpense((prev) => ({
      ...prev,
      natureOfFund: type
    }));
  };

  // Submit handler
 const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("🚀 Submitting Expense Form with:", expense);

  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authorization token is missing");
    console.log("🛡️ Auth Token:", token);

    const cleanedExpense = {
      ...expense,
      natureOfFund: [{ type: expense.natureOfFund }]
    };

    console.log("📦 Payload being sent to backend:", cleanedExpense);

    const response = await axiosInstance.post(
      `${API_BASE}/exp/expenses`,
      cleanedExpense,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    console.log("📥 Server response:", response);

    if (response.status === 200 || response.status === 201) {
      console.log("✅ Expense created successfully:", response.data);
      navigate("/dashboard/expenses-page");
    } else {
      console.warn("⚠️ Unexpected server response:", response);
    }
  } catch (error) {
    console.error("🚫 Error creating expense:");
    console.error("📄 Error message:", error.message);
    if (error.response) {
      console.error("🔍 Response data:", error.response.data);
      console.error("📊 Status:", error.response.status);
    } else {
      console.error("❌ Error:", error);
    }
  }
};


  const fundTypes = [
    "Salary",
    "Travel",
    "Equipment",
    "Office Supplies",
    "Misc",
    "Local Travel & Accommodation",
  ];

  return (
    <div className="create-expense-container">
      <div className="create-expense-header">
        <h2>Create New Expense</h2>
      </div>

      <form onSubmit={handleSubmit} className="create-expense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Expense ID</label>
            <input
              type="text"
              name="expenseId"
              value={expense.expenseId}
              onChange={handleChange}
              required
              readOnly
            />
          </div>

          {/* Project Dropdown */}
          <div className="form-group">
            <label>Project</label>
            <select
              name="project"
              value={expense.project}
              onChange={handleChange}
              required
            >
              <option value="">Select Project</option>
              {Array.isArray(projects) && projects.length > 0 ? (
                projects.map((proj) => (
                  <option
                    key={proj.projectId || proj.id || proj._id}
                    value={proj.projectName || proj.name}
                  >
                    {proj.projectName || proj.name}
                  </option>
                ))
              ) : (
                <option disabled>Loading projects...</option>
              )}
            </select>
          </div>

          {/* Employee Dropdown */}
          <div className="form-group">
            <label>Employee</label>
            <select
              name="employee"
              value={expense.employee}
              onChange={handleChange}
              required
            >
              <option value="">Select Employee</option>
              {Array.isArray(employees) && employees.length > 0 ? (
                employees.map((emp) => (
                  <option
                    key={emp.employeeId || emp.id || emp._id}
                    value={`${emp.firstName} ${emp.lastName}`}
                  >
                    {`${emp.firstName} ${emp.lastName}`}
                  </option>
                ))
              ) : (
                <option disabled>Loading employees...</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="paidby"
              value={expense.paidby}
              onChange={handleChange}
              required
            >
              <option value="">Select Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Check">Check</option>
              <option value="Bill/Voucher">Bill/Voucher</option>
            </select>
          </div>

          <div className="form-group">
            <label>Debit Amount (₹)</label>
            <input
              type="number"
              name="debit"
              value={expense.debit}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Credit Amount (₹)</label>
            <input
              type="number"
              name="credit"
              value={expense.credit}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={expense.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Nature of Fund</label>
            <div className="radio-group">
              {fundTypes.map((type) => (
                <label key={type}>
                  <input
                    type="radio"
                    name="natureOfFund"
                    value={type}
                    checked={expense.natureOfFund === type}
                    onChange={() => handleNatureOfFundChange(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group full-width">
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={expense.remarks}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/dashboard/expenses-page")}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Create Expense
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExpensePage;
