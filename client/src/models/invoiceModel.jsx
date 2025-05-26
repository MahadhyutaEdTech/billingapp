import axiosInstance from '../utils/axiosConfig';
import { API_BASE } from "../config/config";

// 🔹 Get Token from Local Storage
const getAuthToken = () => localStorage.getItem("authToken");

// ✅ Fetch all invoices
export const fetchInvoices = async (page = 1, limit = 10) => {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const response = await axiosInstance.get(`${API_BASE}/invoice/all`, {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` ,"ngrok-skip-browser-warning": "true"},
    });

    console.log("✅ Raw API Response:", response.data); // Debugging log

    if (Array.isArray(response.data)) {
      return response.data; // Directly return the array if API response is an array
    } else if (response.data.invoices) {
      return response.data.invoices; // Handle API response with `invoices` key
    } else {
      console.error("❌ Unexpected API response:", response.data);
      return [];
    }
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    return [];
  }
};

// ✅ Delete invoice
export const deleteInvoice = async (id) => {
  const token = getAuthToken();
  if (!token) return false;

  const confirmDelete = window.confirm(`Are you sure you want to delete Invoice ID: ${id}?`);
  if (!confirmDelete) return false;

  const url = `${API_BASE}/invoice/delete?invoice_id=${id}`; // ✅ Ensure the correct query format

  console.log(`🛠 Sending DELETE request to:`, url);

  try {
    await axiosInstance.delete(url, {
      headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" },
    });

    alert("✅ Invoice deleted successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error deleting invoice:", error);
    alert("Error deleting invoice.");
    return false;
  }
};

// ✅ Get filtered invoices
export const filterInvoice = async (status) => {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const response = await axiosInstance.get(`${API_BASE}/invoice/filter`, {
      params: { status },
      headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" },
    });

    console.log("✅ Filtered Invoices:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching filtered invoices:", error.response?.data || error.message);
    return [];
  }
};

// ✅ Search invoices
export const searchInvoice = async (searchQuery) => {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const response = await axiosInstance.get(`${API_BASE}/invoice/search`, {
      params: { query: searchQuery },
      headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning": "true" },
    });

    console.log("✅ Search Invoices:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching searched invoices:", error.response?.data || error.message);
    return [];
  }
};

// ✅ Invoice Status Colors
export const statusColors = {
  Pending: "bg-yellow-400",  // Yellow for Pending
  Overdue: "bg-red-500",     // Red for Overdue
  Unpaid: "bg-orange-500",   // Orange for Unpaid
  Paid : "bg-green-500",      // Green for Paid
  paid : "bg-green-500",      // Green for Paid

};


