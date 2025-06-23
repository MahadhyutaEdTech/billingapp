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

    //console.log("✅ Raw API Response:", response.data); // Debugging log

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

// ✅ Fetch single invoice by ID with full details
export const fetchInvoiceById = async (invoiceId) => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await axiosInstance.get(`${API_BASE}/invoice/get`, {
      params: { invoice_id: invoiceId },
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.data || response.data.length === 0) {
      console.warn(`Invoice with ID ${invoiceId} not found.`);
      return null;
    }

    // Assuming the API returns an array of objects, and we need the first one
    const firstItem = response.data[0];

    // Reconstruct the invoice object with nested details
    const invoiceData = {
      invoice_id: `${firstItem.invoice_prefix || ""}${firstItem.invoice_number}`,
      invoice_date: firstItem.invoice_date || "Unknown Date",
      total_amount: Number(firstItem.total_amount) || 0,
      tax_amount: Number(firstItem.tax_amount) || 0,
      advance: Number(firstItem.advance) || 0,
      due_amount: Number(firstItem.due_amount) || 0,
      gst_type: firstItem.gst_type || "IGST",
      discount: Number(firstItem.discount) || 0,
      notes: firstItem.notes || "",
      customer_details: { // Map customer fields
        first_name: firstItem.first_name || "Unknown",
        last_name: firstItem.last_name || "",
        email: firstItem.customer_email || "N/A",
        phone: firstItem.customer_phone || "N/A",
        address: firstItem.shipping_addresses?.address || "", // Assuming address might be in shipping_addresses
      },
      products: response.data.map((item, index) => ({ // Map all items as products
        product_id: item.product_id || `N/A-${index}`,
        product_name: item.product_name || "Unknown Product",
        quantity: Number(item.quantity) || 1,
        unit_price: item.unit_price !== null ? Number(item.unit_price) : 0,
        hsn_sac: item.hsn_sac || "N/A",
        tax_percentage: Number(item.tax) || 0,
        total_amount: Number(item.total_amount) || 0,
        discount: Number(item.discount) || 0,
      })),
    };

    return invoiceData;
  } catch (error) {
    console.error("❌ Error fetching single invoice by ID:", error);
    return null;
  }
};

// ✅ Delete invoice
export const deleteInvoice = async (id) => {
  const token = getAuthToken();
  if (!token) return false;

  const confirmDelete = window.confirm(`Are you sure you want to delete Invoice ID: ${id}?`);
  if (!confirmDelete) return false;

  const url = `${API_BASE}/invoice/delete?invoice_id=${id}`; // ✅ Ensure the correct query format

  //console.log(`🛠 Sending DELETE request to:`, url);

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

    //console.log("✅ Search Invoices:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching searched invoices:", error.response?.data || error.message);
    return [];
  }
};

// ✅ Invoice Status Colors
export const statusColors = {
  Pending: "status-pending",
  pending: "status-pending",
  Overdue: "status-overdue",
  Unpaid: "status-unpaid",
  Paid: "status-paid",
  paid: "status-paid",
};

