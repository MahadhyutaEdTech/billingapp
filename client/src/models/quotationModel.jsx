import axiosInstance from "../utils/axiosConfig";
import { API_BASE } from "../config/config";
import { getAuthToken } from "../utils/authUtils";

export const initialQuotationData = {
  customer_id: "",
  client: "",
  clientEmail: "",
  clientPhone: "",
  clientAddress: "",
  clientCity: "",
  clientPincode: "",
  clientGst: "",
  clientCountry: "",
  quotationStatus: "Draft",
  quotationDate: "",
  validUntil: "",
  products: [],
  discountType: "percent",
  discountValue: 0,
  notes: "",
  termsConditions: "",
  gst_number: "",
  gst_type: null,
};

export const initialQuotationOrganizationData = {
  org_id: null,
};

/// Debug version of fetchQuotationById function

export const fetchQuotationById = async (quotationId) => {
  //console.log("=== DEBUG: fetchQuotationById START ===");
 // console.log("1. Quotation ID received:", quotationId);
 // console.log("2. Type of quotationId:", typeof quotationId);
  //console.log("3. Is quotationId truthy?", !!quotationId);
  
  const token = getAuthToken();
  //console.log("4. Token exists?", !!token);
  
  if (!token) {
    //console.log("❌ No token found, returning null");
    return null;
  }

  if (!quotationId) {
    //console.log("❌ No quotationId provided, returning null");
    return null;
  }

  try {
   // console.log("5. Making API call...");
   // console.log("   - URL:", `${API_BASE}/quotation/get`);
    //console.log("   - Params:", { quotation_id: quotationId });
    
    const response = await axiosInstance.get(`${API_BASE}/quotation/get`, {
      params: { quotation_id: quotationId },
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    //console.log("6. API Response received:");
    //console.log("   - Status:", response.status);
   // console.log("   - Data length:", response.data?.length);
    //console.log("   - Raw data:", response.data);

    if (!response.data || response.data.length === 0) {
      console.warn(`❌ Quotation with ID ${quotationId} not found.`);
      return null;
    }

    const firstItem = response.data[0];
    //console.log("7. First item from response:", firstItem);

    const quotationData = {
      quotation_id: firstItem.quotation_id,
      quotation_number: firstItem.quotation_number,
      quotation_date: firstItem.quotation_date || "Unknown Date",
      valid_until: firstItem.valid_until || "Unknown Date",
      total_amount: Number(firstItem.total_amount) || 0,
      tax_amount: Number(firstItem.tax_amount) || 0,
      discount: Number(firstItem.discount) || 0,
      gst_type: firstItem.gst_type || "IGST",
      notes: firstItem.notes || "",
      terms_conditions: firstItem.terms_conditions || "",
      status: firstItem.status || "Draft",
      customer_details: {
        first_name: firstItem.first_name || "Unknown",
        last_name: firstItem.last_name || "",
        email: firstItem.customer_email || "N/A",
        phone: firstItem.customer_phone || "N/A",
        address: firstItem.shipping_addresses?.address || "",
      },
      organization_details: {
        name: firstItem.name || "",
        email: firstItem.email || "",
        phone: firstItem.phone || "",
        address: firstItem.gst_details?.address || "",
        logo_image: firstItem.logo_image || "",
        signature_image: firstItem.signature_image || "",
      },
      products: response.data.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        hsn_sac: item.hsn_sac,
        tax: Number(item.tax) || 0,
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
      })),
    };

   // console.log("8. Processed quotation data:", quotationData);
    //console.log("=== DEBUG: fetchQuotationById SUCCESS ===");
    
    return quotationData;
  } catch (error) {
    console.log("=== DEBUG: fetchQuotationById ERROR ===");
    console.error("Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
      }
    });
    console.error("Full error object:", error);
    return null;
  }
};
// Save quotation
export const saveQuotation = async (quotationData) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token");

  try {
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

    return response.data;
  } catch (error) {
    console.error("Error saving quotation:", error);
    throw error;
  }
};

// Update quotation
export const updateQuotation = async (quotationId, updateData) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token");

  try {
    const response = await axiosInstance.put(
      `${API_BASE}/quotation/update`,
      updateData,
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
    console.error("Error updating quotation:", error);
    throw error;
  }
};

// Delete quotation
export const deleteQuotation = async (quotationId) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token");

  try {
    const response = await axiosInstance.delete(
      `${API_BASE}/quotation/delete`,
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
    console.error("Error deleting quotation:", error);
    throw error;
  }
};

// Get all quotations
export const getAllQuotations = async (limit = 10, offset = 0) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token");

  try {
    const response = await axiosInstance.get(`${API_BASE}/quotation/all`, {
      params: { limit, offset },
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
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token");

  try {
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
export const filterQuotationsByStatus = async (status) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token");

  try {
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

// Convert quotation to invoice
export const convertQuotationToInvoice = async (quotationId) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token");

  try {
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

// Get quotation statistics
export const getQuotationStats = async () => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token");

  try {
    const [countRes, statusRes, amountRes, customersRes, averageRes] = await Promise.all([
      axiosInstance.get(`${API_BASE}/quotation/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }),
      axiosInstance.get(`${API_BASE}/quotation/status-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }),
      axiosInstance.get(`${API_BASE}/quotation/amount-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }),
      axiosInstance.get(`${API_BASE}/quotation/total-customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }),
      axiosInstance.get(`${API_BASE}/quotation/average-value`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }),
    ]);

    return {
      totalQuotations: countRes.data[0]?.TotalQuotations || 0,
      statusCounts: statusRes.data,
      amountStatuses: amountRes.data,
      totalCustomers: customersRes.data.total_customers || 0,
      averageValue: averageRes.data.average_value || 0,
    };
  } catch (error) {
    console.error("Error fetching quotation statistics:", error);
    throw error;
  }
}; 