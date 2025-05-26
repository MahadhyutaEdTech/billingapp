import axiosInstance from '../utils/axiosConfig';
import { API_BASE } from "../config/config";
import { toast } from "react-toastify";

// Function to get the token from localStorage
const getAuthToken = () => localStorage.getItem("authToken");

// Fetch customers
export const fetchCustomers = async (setCustomerList) => {
  const token = getAuthToken();
  if (!token) {
    toast.error("User not authenticated. Please log in.");
    return;
  }

  try {
    const response = await axiosInstance.get(`${API_BASE}/customer/allCustomerData`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    const customers = response.data.map((cust) => {
      // Keep original GST details string
      return {
        customer_id: cust.customer_id,
        first_name: cust.first_name,
        last_name: cust.last_name,
        name: `${cust.first_name} ${cust.last_name}`,
        email: cust.email,
        phone: cust.phone,
        cust_gst_details: cust.cust_gst_details // Keep as original string
      };
    });

    console.log("Mapped customers:", customers); // Debug log
    setCustomerList(customers);
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    toast.error("Error fetching customers. Please try again.");
  }
};

// Fetch products
export const fetchProducts = async (setProductList) => {
  const token = getAuthToken();
  if (!token) {
    toast.error("User not authenticated. Please log in.");
    return;
  }

  try {
    const response = await axiosInstance.get(`${API_BASE}/products/get`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    setProductList(response.data);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    toast.error("Error fetching products. Please try again.");
  }
};

// Update the fetchGstType function
export const fetchGstType = async (orgGst, customerGst, callback) => {
  const token = getAuthToken();
  if (!token) {
    toast.error("User not authenticated. Please log in.");
    return;
  }

  console.log("Sending GST Numbers to API:", { orgGst, customerGst });

  try {
    const response = await axiosInstance.post(
      `${API_BASE}/gst/gstType`,
      {
        orgGst: orgGst.trim(),
        customerGst: customerGst.trim()
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': "true",
        }
      }
    );

    console.log("GST API Response:", response.data);
    
    if (response.data && response.data.gstType) {
      callback(response.data.gstType);
    } else {
      console.warn("No GST type in response, defaulting to CGST+SGST");
      callback("CGST + SGST");
    }
  } catch (error) {
    console.error("GST API Error:", error);
    callback("CGST + SGST");
  }
};

export const saveInvoice = async (invoiceData) => {
  const token = getAuthToken();
  if (!token) {
    toast.error("User not authenticated. Please log in.");
    return;
  }

  if (!invoiceData.org_id) {
    toast.error("Organization is required");
    return;
  }

  console.log("Sending invoice data:", invoiceData);

  try {
    const response = await axiosInstance.post(
      `${API_BASE}/invoice/create`,
      invoiceData,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        }
      }
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    }

    throw new Error(response.data?.message || "Failed to save invoice");
  } catch (error) {
    console.error("❌ Error saving invoice:", error.response?.data || error);
    throw error;
  }
};

// Fetch all invoices
export const fetchInvoices = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    toast.error("User not authenticated. Please log in.");
    return [];
  }

  try {
    const response = await axiosInstance.get(`${API_BASE}/invoice/all`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    console.log("📥 Fetched Invoices:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    toast.error("Error fetching invoices. Please try again.");
    return [];
  }
};

// Fetch list of organizations with token authentication
export const fetchOrganizations = async (setOrganizationList) => {
  try {
    console.log("Fetching organizations...");

    // Retrieve token (Assuming it's stored in localStorage)
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const response = await axiosInstance.get(`${API_BASE}/organization/get`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`, // Attach token in the request header
      },
    });

    console.log("Response received:", response);

    // Check if response contains valid data
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid data format received from API");
    }

    console.log("Organizations fetched successfully:", response.data);
    setOrganizationList(response.data);
  } catch (error) {
    console.error("Error fetching organizations:", error.message);

    if (error.response) {
      console.error("Server responded with:", error.response.status, error.response.data);

      // Handle unauthorized errors (Token expired or invalid)
      if (error.response.status === 401) {
        console.error("Unauthorized: Token may be invalid or expired.");
        // Optional: Redirect to login page or refresh token logic
      }
    } else if (error.request) {
      console.error("No response received from server. Possible network issue.");
    } else {
      console.error("Request setup error:", error.message);
    }
  }
};
