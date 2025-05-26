import axiosInstance from '../utils/axiosConfig';
import { API_BASE } from "../config/config";
import { toast } from "react-toastify";

// Function to get the token dynamically
const getAuthToken = () => localStorage.getItem("authToken");

// 🔹 Fetch All Customers with Pagination
export const fetchAllCustomers = async (page = 1, limit = 10) => {
  const token = getAuthToken();
  if (!token) {
    toast.error("User not authenticated. Please log in.");
    return [];
  }

  try {
    const response = await axiosInstance.get(`${API_BASE}/customer/allCustomerData`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    toast.error("Error fetching customers.");
    return [];
  }
};

// 🔹 Search Customers by Query
export const fetchSearchedCustomers = async (search) => {
  const token = getAuthToken();
  if (!token) {
    toast.error("User not authenticated. Please log in.");
    return [];
  }

  try {
    const response = await axiosInstance.get(`${API_BASE}/customer/search`, {
      params: { query: search },
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error searching customers:", error);
    toast.error("Error searching for customers.");
    return [];
  }
};

// 🔹 Delete a Customer by ID
export const deleteCustomer = async (customerId) => {
  const token = getAuthToken();
  if (!token) {
    toast.error("User not authenticated. Please log in.");
    return false;
  }

  try {
    const confirmDelete = window.confirm(`Are you sure you want to delete Customer ID: ${customerId}?`);
    if (!confirmDelete) return false;

    await axiosInstance.delete(`${API_BASE}/customer/deleteData?customer_id=${customerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    toast.success("✅ Customer deleted successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error deleting customer:", error);
    toast.error("Error deleting customer. Please try again.");
    return false;
  }
};
