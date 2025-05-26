import axios from "axios";
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

    const response = await axios.get(`${API_BASE}/exp/expenses`, {
      headers: getAuthHeaders()
    });

    if (response.data) {
      localStorage.setItem("expenses", JSON.stringify(response.data));
      localStorage.setItem("expenses_timestamp", Date.now().toString());
      return response.data;
    }
    
    throw new Error("No data received from server");
  } catch (error) {
    console.error("Error fetching expenses:", error);
    // If there's cached data and we can't reach the server, use the cache as fallback
    const cached = localStorage.getItem("expenses");
    if (cached) {
      console.log("Using cached expense data as fallback");
      return JSON.parse(cached);
    }
    throw error;
  }
};

// Employees
export const getEmployees = async () => {
  const cached = localStorage.getItem("employees");
  if (cached) return JSON.parse(cached);

  const response = await axios.get(`${API_BASE}/emp/employees`, {
    headers: getAuthHeaders()
  });

  localStorage.setItem("employees", JSON.stringify(response.data));
  return response.data;
};

// Projects
export const getProjects = async () => {
  const cached = localStorage.getItem("projects");
  if (cached) return JSON.parse(cached);

  const response = await axios.get(`${API_BASE}/proj/projects`, {
    headers: getAuthHeaders()
  });

  localStorage.setItem("projects", JSON.stringify(response.data));
  return response.data;
};

export const deleteExpense = async (expenseId) => {
  const response = await axios.delete(`${API_BASE}/exp/expenses/${expenseId}`, {
    headers: getAuthHeaders(),
  });

  // Clear local cache
  localStorage.removeItem("expenses");
  return response.data;
};


const getExpenseById = async (id) => {
  try {
    const response = await fetch(`/exp/expenses/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch expense: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching expense:', error);
    throw error;
  }
};

// Update expense
export const updateExpense = async (expenseId, updatedData) => {
  try {
    console.log(`Updating expense with ID: ${expenseId}`);
    console.log(`API URL: ${API_BASE}/exp/expenses/${expenseId}`);
    console.log('Update data:', updatedData);
    
    const response = await axios.put(
      `${API_BASE}/exp/expenses/${expenseId}`,
      updatedData,
      {
        headers: getAuthHeaders(),
      }
    );
    
    // Clear local cache
    localStorage.removeItem('expenses');
    
    return response.data;
  } catch (error) {
    console.error(`Error updating expense with ID ${expenseId}:`, error);
    if (error.response) {
      console.error('Server response:', error.response.data);
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};
