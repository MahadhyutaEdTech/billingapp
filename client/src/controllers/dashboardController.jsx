// src/controllers/dashboardController.js
import { useEffect, useState } from "react";
import {
  fetchTotalInvoices,
  fetchFilteredInvoices,
  fetchPendingPayments,
  fetchPaidInvoices,
  fetchInvoiceStatus,
  fetchMonthlyRevenue,
  fetchProfitTrend,
  fetchHighestProductSale,
} from "../models/dashboardModel";

export const useDashboardData = () => {
  const [totalInvoices, setTotalInvoices] = useState(10); // Static default
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [pendingPayment, setPendingPayment] = useState(5000);
  const [paidInvoice, setPaidInvoices] = useState(15000);
  const [invoiceData, setInvoiceData] = useState({
    labels: ["Paid", "Pending"],
    datasets: [{ data: [70, 30], backgroundColor: ["#4CAF50", "#FFC107"] }],
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ label: "Revenue", data: [5000, 7000, 8000, 6500, 9000, 10000], backgroundColor: "#4CAF50" }],
  });
  const [profitTrend, setProfitTrend] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ label: "Profit", data: [2000, 4000, 3000, 5000, 4500, 6000], borderColor: "#FF5733", backgroundColor: "rgba(255, 87, 51, 0.2)", fill: true }],
  });
  const [highestSaleProduct, setHighestSaleProduct] = useState({
    labels: ["Keyboard", "Laptop", "Phone"],
    datasets: [{ data: [70, 20, 10], backgroundColor: ["#4CAF50", "#FFC107", "#F44336"] }],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [
          total,
          pending,
          paid,
          invoices,
          statusData,
          revenueData,
          profitData,
          highestSaleData,
        ] = await Promise.all([
          fetchTotalInvoices(),
          fetchPendingPayments(),
          fetchPaidInvoices(),
          fetchFilteredInvoices("Paid"),
          fetchInvoiceStatus(),
          fetchMonthlyRevenue(),
          fetchProfitTrend(),
          fetchHighestProductSale(),
        ]);

        setTotalInvoices(total);
        setPendingPayment(pending);
        setPaidInvoices(paid);
        setFilteredInvoices(invoices);
        setInvoiceData(statusData);
        setMonthlyRevenue(revenueData);
        setProfitTrend(profitData);
        setHighestSaleProduct(highestSaleData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    totalInvoices,
    filteredInvoices,
    pendingPayment,
    paidInvoice,
    invoiceData,
    monthlyRevenue,
    profitTrend,
    highestSaleProduct,
    loading,
  };
};


