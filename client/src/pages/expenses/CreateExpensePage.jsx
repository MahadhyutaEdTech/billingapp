import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig"; // Your configured axios instance
import { API_BASE } from "../../config/config";
import "../../css/modules/expense/CreateExpensePage.css";

const CreateExpensePage = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dark mode detection
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark-mode');
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Initial check
    setIsDarkMode(document.documentElement.classList.contains('dark-mode'));

    return () => observer.disconnect();
  }, []);

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

       // console.log("Projects API response:", projRes.data);
        //console.log("Employees API response:", empRes.data);

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

  //console.log("🚀 Submitting Expense Form with:", expense);

  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authorization token is missing");
    //console.log("🛡️ Auth Token:", token);

    const cleanedExpense = {
      ...expense,
      natureOfFund: [{ type: expense.natureOfFund }]
    };

    //console.log("📦 Payload being sent to backend:", cleanedExpense);

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

    //console.log("📥 Server response:", response);

    if (response.status === 200 || response.status === 201) {
      //console.log("✅ Expense created successfully:", response.data);
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
    <div className={`create-expense-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="create-expense-header">
        <h2>Create New Expense</h2>
        <p className="subtitle">Fill in the details below to create a new expense record</p>
      </div>

      <form onSubmit={handleSubmit} className="create-expense-form">
        <div className="form-sections">
          <div className="form-section main-info">
            <div className="form-grid">
              <div className="form-group">
                <label>Expense ID</label>
                <input
                  type="text"
                  name="expenseId"
                  value={expense.expenseId}
                  readOnly
                  className="readonly-input"
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

              <div className="form-group">
                <label>Project</label>
                <select
                  name="project"
                  value={expense.project}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map((proj) => (
                    <option
                      key={proj.projectId || proj.id || proj._id}
                      value={proj.projectName || proj.name}
                    >
                      {proj.projectName || proj.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Employee</label>
                <select
                  name="employee"
                  value={expense.employee}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option
                      key={emp.employeeId || emp.id || emp._id}
                      value={`${emp.firstName} ${emp.lastName}`}
                    >
                      {`${emp.firstName} ${emp.lastName}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section financial-info">
            <div className="form-grid">
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
            </div>
          </div>

          <div className="form-section fund-info">
            <div className="fund-section-header">
              <label className="section-label">Nature of Fund</label>
              <p className="section-description">Select the type of expense</p>
            </div>
            <div className="fund-types-grid">
              {fundTypes.map((type) => (
                <label key={type} className="fund-type-option">
                  <input
                    type="radio"
                    name="natureOfFund"
                    value={type}
                    checked={expense.natureOfFund === type}
                    onChange={() => handleNatureOfFundChange(type)}
                  />
                  <span className="fund-type-label">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section remarks-info">
            <div className="form-group">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={expense.remarks}
                onChange={handleChange}
                rows="2"
                placeholder="Enter any additional notes..."
              />
            </div>
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
