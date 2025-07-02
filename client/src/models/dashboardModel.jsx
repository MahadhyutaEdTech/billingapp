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
    console.log("📤 Fetching pending payments...");
    
    const response = await axiosInstance.get(`${API_BASE}/invoice/amountStatuses`, {
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

    console.log("✅ Pending payments response:", response.data);

    if (!Array.isArray(response.data)) {
      console.error("🚨 Unexpected response format:", response.data);
      return 0;
    }

    const pendingPayment = response.data.find(item => 
      item.status.toLowerCase() === "pending"
    );
    
    console.log("💰 Pending Payment Data:", pendingPayment);
    
    // Convert string total to number
    return pendingPayment ? parseFloat(pendingPayment.total) || 0 : 0;
  } catch (error) {
    console.error("❌ Error fetching pending payments:", error);
    if (error.response) {
      console.error("🛑 Server responded with:", error.response.status, error.response.data);
    }
    return 0;
  }
};

// Function to fetch paid invoices
export const fetchPaidInvoices = async () => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      console.warn("⚠️ Warning: No auth token found!");
      return 0;
    }
    
   // console.log("📤 Fetching paid invoices...");
    //console.log("🔗 API Endpoint:", `${API_BASE}/invoice/amountStatuses`);

    const response = await axiosInstance.get(`${API_BASE}/invoice/amountStatuses`, {
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

    //console.log("✅ Response received:", response.data);

    if (!Array.isArray(response.data)) {
      console.error("🚨 Unexpected response format:", response.data);
      return 0;
    }

    const paidInvoice = response.data.find(item => 
      item.status.toLowerCase() === "paid"
    );
    
    //console.log("💰 Paid Invoice Data:", paidInvoice);
    
    // Convert string total to number
    return paidInvoice ? parseFloat(paidInvoice.total) || 0 : 0;
  } catch (error) {
    console.error("❌ Error fetching paid invoices:", error);
    if (error.response) {
      console.error("🛑 Server responded with:", error.response.status, error.response.data);
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

    // Convert status to lowercase for robust matching
    const dataMap = response.data.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = parseFloat(item.total) || 0;
      return acc;
    }, {});

    const paid = dataMap.paid || 0;
    const pending = dataMap.pending || 0;
    const overdue = dataMap.overdue || 0;

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
    const response = await axiosInstance.get(`${API_BASE}/dashboard/profitTrend`, {
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      }
    });

    if (Array.isArray(response.data)) {
      const labels = response.data.map(item => item.month);
      const data = response.data.map(item => parseFloat(item.profit) || 0);

      return {
        labels,
        datasets: [{
          label: "Profit",
          data,
          borderColor: "#FF5733",
          backgroundColor: "rgba(255, 87, 51, 0.2)",
          fill: true
        }]
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching profit trend:", error);
    return null;
  }
};


// Function to fetch highest sale product data
export const fetchHighestProductSale = async () => {
  try {
    const token = getAuthToken();
    console.log("📤 Fetching highest sale products...");
    
    const response = await axiosInstance.get(`${API_BASE}/dashboard/highestSale`, {
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

   // console.log("✅ Highest sale products response:", response.data);

    if (Array.isArray(response.data) && response.data.length > 0) {
      const labels = response.data.map(item => item.product_name);
      const data = response.data.map(item => parseInt(item.total_sold, 10) || 0);
      
      // Generate colors for the pie chart
      const backgroundColors = [
        '#4CAF50', // Green
        '#2196F3', // Blue
        '#FFC107', // Amber
        '#F44336', // Red
        '#9C27B0', // Purple
      ];

      return {
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors.slice(0, data.length),
          borderWidth: 1
        }]
      };
    }
    
   // console.log("⚠️ No highest sale products data available");
    return {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: []
      }]
    };
  } catch (error) {
    console.error("❌ Error fetching highest sale products:", error);
    return {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: []
      }]
    };
  }
};

// Function to fetch revenue by product category
/*
export const fetchRevenueByCategory = async () => {
  try {
    const token = getAuthToken();
    const response = await axiosInstance.get(`${API_BASE}/dashboard/revenueByCategory`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

    if (Array.isArray(response.data) && response.data.length > 0) {
      const labels = response.data.map(item => item.category_name);
      const data = response.data.map(item => parseFloat(item.total_revenue) || 0);

      const backgroundColors = [
        '#4CAF50', // Green
        '#2196F3', // Blue
        '#FFC107', // Amber
        '#F44336', // Red
        '#9C27B0', // Purple
        '#00BCD4', // Cyan
        '#FFEB3B', // Yellow
        '#795548', // Brown
        '#E91E63', // Pink
        '#607D8B', // Blue Grey
      ];

      return {
        labels,
        datasets: [{
          label: "Revenue by Category",
          data,
          backgroundColor: backgroundColors.slice(0, labels.length),
        }],
      };
    } else {
      console.error("Unexpected revenue by category response format:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching revenue by category:", error);
    return null;
  }
};
*/

// Function to fetch total customers
export const fetchTotalCustomers = async () => {
  try {
    const token = getAuthToken();
    //console.log("📤 Fetching total customers...");
    
    const response = await axiosInstance.get(`${API_BASE}/invoice/customers`, {
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

    //console.log("✅ Total customers response:", response.data);
    return response.data.total_customers || 0;
  } catch (error) {
    console.error("❌ Error fetching total customers:", error);
    if (error.response) {
      console.error("🛑 Server responded with:", error.response.status, error.response.data);
    }
    return 0;
  }
};

// Function to fetch average invoice value
export const fetchAverageInvoiceValue = async () => {
  try {
    const token = getAuthToken();
    //console.log("📤 Fetching average invoice value...");
    
    const response = await axiosInstance.get(`${API_BASE}/invoice/average`, {
      headers: { 
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

    //console.log("✅ Average invoice response:", response.data);
    return response.data.average_value || 0;
  } catch (error) {
    console.error("❌ Error fetching average invoice value:", error);
    if (error.response) {
      console.error("🛑 Server responded with:", error.response.status, error.response.data);
    }
    return 0;
  }
};
