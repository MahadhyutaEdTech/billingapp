import axiosInstance from "../utils/axiosConfig";
import { API_BASE } from "../config/config";

// Fetch customers for quotation
export const fetchCustomers = async (setCustomerList) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authorization token is missing");

    const response = await axiosInstance.get(`${API_BASE}/customer/allCustomerData`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    console.log("Customers API response:", response.data);
    setCustomerList(response.data);
  } catch (error) {
    console.error("Error fetching customers:", error);
    setCustomerList([]);
  }
};

// Fetch products for quotation
export const fetchProducts = async (setProductList) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authorization token is missing");

    const response = await axiosInstance.get(`${API_BASE}/products/get`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    console.log("Products API response:", response.data);
    setProductList(response.data);
  } catch (error) {
    console.error("Error fetching products:", error);
    setProductList([]);
  }
};

// Fetch organizations for quotation
export const fetchOrganizations = async (callback) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authorization token is missing");

    const response = await axiosInstance.get(`${API_BASE}/organization/get`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    //console.log("Organizations API response:", response.data);
    callback(response.data);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    callback([]);
  }
};

// Fetch GST type
export const fetchGstType = async (orgGst, customerGst, callback) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authorization token is missing");

    const response = await axiosInstance.get(`${API_BASE}//gst/gstType`, {
      params: {
        org_gst: orgGst,
        customer_gst: customerGst,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

   // console.log("GST Type API response:", response.data);
    callback(response.data.gst_type);
  } catch (error) {
    console.error("Error fetching GST type:", error);
    callback("IGST");
  }
};

// Save quotation
export const saveQuotation = async (quotationData) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authorization token is missing");

    //console.log("Saving quotation with data:", quotationData);

    const response = await axiosInstance.post(
      `${API_BASE}/quotation/create`,
      quotationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    //console.log("Quotation saved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error saving quotation:", error);
    throw error;
  }
};

// Get all quotations
export const getQuotations = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authorization token is missing");

    const response = await axiosInstance.get(`${API_BASE}/quotation/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching quotations:", error);
    throw error;
  }
};

// Search quotations
export const searchQuotations = async (searchQuery) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authorization token is missing");

    const response = await axiosInstance.get(`${API_BASE}/quotation/search`, {
      params: { searchQuery },
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error searching quotations:", error);
    throw error;
  }
};

// Filter quotations by status
export const filterQuotations = async (status) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authorization token is missing");

    const response = await axiosInstance.get(`${API_BASE}/quotation/filter`, {
      params: { status },
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error filtering quotations:", error);
    throw error;
  }
};

// Delete quotation
export const deleteQuotation = async (quotationId) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authorization token is missing");

    const response = await axiosInstance.delete(`${API_BASE}/quotation/delete`, {
      params: { quotation_id: quotationId },
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error deleting quotation:", error);
    throw error;
  }
};

// Convert quotation to invoice
export const convertToInvoice = async (quotationId) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authorization token is missing");

    const response = await axiosInstance.post(
      `${API_BASE}/quotation/convert-to-invoice`,
      {},
      {
        params: { quotation_id: quotationId },
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error converting quotation to invoice:", error);
    throw error;
  }
}; 