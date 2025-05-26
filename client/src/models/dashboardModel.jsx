import axiosInstance from '../utils/axiosConfig';
import {API_BASE }from "../config/config";

// Function to get token dynamically
const getAuthToken = () => localStorage.getItem("authToken"); // Adjust as needed

// Function to fetch total invoices
export const fetchTotalInvoices = async () => {
  try {
    const token = getAuthToken();
    const response = await axiosInstance.get(`${API_BASE}/invoice/count`, {
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });
    return response.data[0]?.TotalInvoices || 0;
  } catch (error) {
    console.error("Error fetching total invoices:", error);
    return 0;
  }
};

// Function to fetch filtered invoices by status
export const fetchFilteredInvoices = async (status) => {
  try {
    const token = getAuthToken();
    const response = await axiosInstance.get(`${API_BASE}/invoice/filter`, {
      params: { status },
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching filtered invoices:", error);
    return [];
  }
};

// Function to fetch pending payments
export const fetchPendingPayments = async () => {
  try {
    const token = getAuthToken();
    const response = await axiosInstance.get(`${API_BASE}/invoice/amountStatuses`, {
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });
    return response.data.find(item => item.status === "Pending")?.total || 0;
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    return 0;
  }
};

// Function to fetch paid invoices
export const fetchPaidInvoices = async () => {
  try {
    const token = getAuthToken();
    
    // Debugging: Check if token exists
    if (!token) {
      console.warn("⚠️ Warning: No auth token found!");
      return 0;
    }
    
    console.log("📤 Fetching paid invoices...");
    console.log("🔗 API Endpoint:", `${API_BASE}/invoice/amountStatuses`);

    const response = await axiosInstance.get(`${API_BASE}/invoice/amountStatuses`, {
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

    console.log("✅ Response received:", response.data);

    // Debugging: Check the structure of response data
    if (!Array.isArray(response.data)) {
      console.error("🚨 Unexpected response format:", response.data);
      return 0;
    }

    const paidInvoice = response.data.find(item => item.status.toLowerCase() === "paid");
    
    console.log("💰 Paid Invoice Data:", paidInvoice);
    
    return paidInvoice?.total || 0;
  } catch (error) {
    console.error("❌ Error fetching paid invoices:", error);
    
    // Debugging: Log detailed error response if available
    if (error.response) {
      console.error("🛑 Server responded with:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("⏳ No response received. Request details:", error.request);
    } else {
      console.error("🔍 Request setup error:", error.message);
    }

    return 0;
  }
};


// Function to fetch invoice status data
export const fetchInvoiceStatus = async () => {
  try {
    const token = getAuthToken();
    const response = await axiosInstance.get(`${API_BASE}/invoice/amountStatuses`, {
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

    const paid = response.data.find(item => item.status === "paid")?.total || 0;
    const pending = response.data.find(item => item.status === "Pending")?.total || 0;
    const overdue = response.data.find(item => item.status === "overdue")?.total || 0;

    return {
      labels: ["Paid", "Pending", "Overdue"],
      datasets: [{
        data: [paid, pending, overdue],
        backgroundColor: ["#2196F3", "#FFC107", "#F44336"],
      }],
    };
  } catch (error) {
    console.error("Error fetching invoice status:", error);
    return null;
  }
};

// Function to fetch monthly revenue data
export const fetchMonthlyRevenue = async () => {
  try {
    const token = getAuthToken();
    const response = await axiosInstance.get(`${API_BASE}/dashboard/monthlyRevenue`, {
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

    if (Array.isArray(response.data)) {
      const labels = response.data.map(item => item.month);
      const data = response.data.map(item => parseFloat(item.revenue) || 0);

      return {
        labels,
        datasets: [{ label: "Revenue", data, backgroundColor: "#4CAF50" }],
      };
    } else {
      console.error("Unexpected revenue response format:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    return null;
  }
};

// Function to fetch profit trend data
export const fetchProfitTrend = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      console.warn("⚠️ Warning: No auth token found!");
      return null;
    }

    console.log("📤 Fetching profit trend data...");
    console.log("🔗 API Endpoint:", `${API_BASE}/dashboard/profitTrend`);

    const response = await axiosInstance.get(`${API_BASE}/dashboard/profitTrend`, {
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

    console.log("✅ Response received:", response.data);

    if (!Array.isArray(response.data)) {
      console.error("🚨 Unexpected response format:", response.data);
      return null;
    }

    // 🔍 Debugging response structure
    console.log("📊 Raw Profit Data:", response.data);

    const labels = response.data.map(item => item.month);
    const data = response.data.map(item => {
      const profitValue = parseFloat(item.profit);
      if (isNaN(profitValue)) {
        console.warn(`⚠️ Warning: Invalid profit value for month ${item.month}:`, item.profit);
        return 0;
      }
      return profitValue;
    });

    console.log("📅 Labels (Months):", labels);
    console.log("💰 Profit Values:", data);

    return {
      labels,
      datasets: [
        {
          label: "Profit Margin",
          data,
          borderColor: "#FF5733",
          backgroundColor: "rgba(255, 87, 51, 0.2)",
          fill: true,
        },
      ],
    };
  } catch (error) {
    console.error("❌ Error fetching profit trend:", error);

    if (error.response) {
      console.error("🛑 Server responded with:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("⏳ No response received. Request details:", error.request);
    } else {
      console.error("🔍 Request setup error:", error.message);
    }

    return null;
  }
};


// Function to fetch highest sale product data
export const fetchHighestProductSale = async () => {
  try {
    const token = getAuthToken();
    const response = await axiosInstance.get(`${API_BASE}/dashboard/highestSale`, {
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

    if (Array.isArray(response.data) && response.data.length > 0) {
      const labels = response.data.map(item => item.product_name);
      const data = response.data.map(item => parseInt(item.total_sold, 10) || 0);

      return {
        labels,
        datasets: [{
          label: "Total Sold",
          data,
          backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
        }],
      };
    } else {
      console.error("Unexpected highest product sale response format:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching highest product sale:", error);
    return null;
  }
};
