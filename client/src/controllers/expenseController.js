import axiosInstance from "../utils/axiosConfig";
import { API_BASE } from "../config/config";



// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Authorization token is missing");

  return {
    Authorization: `Bearer ${token}`,
    "ngrok-skip-browser-warning": "true"
  };
};

// Expenses
export const getExpenses = async () => {
  try {
    const cached = localStorage.getItem("expenses");
    if (cached) {
      const parsedCache = JSON.parse(cached);
      // Only use cache if it's less than 5 minutes old
      const cacheTime = localStorage.getItem("expenses_timestamp");
      if (cacheTime && Date.now() - Number(cacheTime) < 300000) {
        return parsedCache;
      }
    }

    const response = await axiosInstance.get(`${API_BASE}/exp/expenses`);

    if (response.data) {
      localStorage.setItem("expenses", JSON.stringify(response.data));
      localStorage.setItem("expenses_timestamp", Date.now().toString());
      return response.data;
    }
    
    throw new Error("No data received from server");
  } catch (error) {
    // If there's cached data and we can't reach the server, use the cache as fallback
    const cached = localStorage.getItem("expenses");
    if (cached) {
      return JSON.parse(cached);
    }
    throw error;
  }
};

// Employees
export const getEmployees = async () => {
  const cached = localStorage.getItem("employees");
  if (cached) return JSON.parse(cached);

  const response = await axiosInstance.get(`${API_BASE}/emp/employees`);

  localStorage.setItem("employees", JSON.stringify(response.data));
  return response.data;
};

// Projects
export const getProjects = async () => {
  const cached = localStorage.getItem("projects");
  if (cached) return JSON.parse(cached);

  const response = await axiosInstance.get(`${API_BASE}/proj/projects`);

  localStorage.setItem("projects", JSON.stringify(response.data));
  return response.data;
};

export const deleteExpense = async (expenseId) => {
  const response = await axiosInstance.delete(`${API_BASE}/exp/expenses/${expenseId}`);

  // Clear local cache
  localStorage.removeItem("expenses");
  return response.data;
};


export const getExpenseById = async (expenseId) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/exp/expenses/${expenseId}`);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update expense
export const updateExpense = async (expenseId, updatedData) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE}/exp/expenses/${expenseId}`,
      updatedData,
    );
    
    // Clear local cache
    localStorage.removeItem('expenses');
    
    return response.data;
  } catch (error) {
    throw error;
  }
};
