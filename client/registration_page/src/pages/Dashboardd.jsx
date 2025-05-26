import React from "react";
import { useDashboardData } from "../controllers/dashboardController";
import { FaFileInvoice, FaMoneyBillWave } from "react-icons/fa";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import "../css/Dashboard.css";

// 🔹 Chart.js Registration (Fixes "category not registered" error)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const {
    totalInvoices = 10,  // Set static default
    filteredInvoices = [],
    pendingPayment = 5000,
    paidInvoice = 15000,
    invoiceData,
    monthlyRevenue,
    profitTrend,
    highestSaleProduct,
    loading,
  } = useDashboardData();

  // Define status colors with exact status matches
  const statusColors = {
    Paid: "bg-green-500",
    Pending: "bg-yellow-400",
    Overdue: "bg-red-500",
    Unpaid: "bg-orange-500"
  };

  return (
    <div className="dashboard-container">
      <main className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <input type="text" placeholder="Search..." />
          <div className="profile">Admin</div>
        </div>

        {/* Invoice Statistics */}
        <div className="stats-grid">
          <div className="card">
            <FaFileInvoice className="icon" />
            <h3>Total Invoices</h3>
            <p>{totalInvoices}</p> {/* Always shows static value first */}
          </div>

          <div className="card pending">
            <FaMoneyBillWave className="icon" />
            <h3>Pending Payments</h3>
            <p>₹{pendingPayment}</p>
          </div>

          <div className="card paid">
            <FaMoneyBillWave className="icon" />
            <h3>Paid Invoices</h3>
            <p>₹{paidInvoice}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Monthly Revenue Chart */}
          <div className="chart-card small-chart">
            <h3>Monthly Revenue</h3>
            {monthlyRevenue?.datasets?.length ? (
              <Bar data={monthlyRevenue} options={{ maintainAspectRatio: false, responsive: true, aspectRatio: 1.5 }} />
            ) : (
              <p>Loading chart...</p>
            )}
          </div>

          {/* Invoice Status Chart */}
          <div className="chart-card small-chart">
            <h3>Invoice Status</h3>
            {invoiceData?.datasets?.length ? (
              <Doughnut data={invoiceData} options={{ maintainAspectRatio: false, responsive: true, aspectRatio: 1.5 }} />
            ) : (
              <p>Loading chart...</p>
            )}
          </div>
        </div>

        {/* Additional Charts */}
        <div className="charts-grid-2">
          <div className="chart-card small-chart profit-chart">
            <h3>Profit Trend</h3>
            {profitTrend?.datasets?.length ? (
              <Line data={profitTrend} options={{ maintainAspectRatio: false, responsive: true, aspectRatio: 1.5 }} />
            ) : (
              <p>Loading chart...</p>
            )}
          </div>
          <div className="chart-card small-chart">
            <h3>Highest Sale Product</h3>
            {highestSaleProduct?.datasets?.length ? (
              <Pie data={highestSaleProduct} options={{ maintainAspectRatio: false, responsive: true, aspectRatio: 1.5 }} />
            ) : (
              <p>Loading chart...</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="transactions">
          <h3>Recent Transactions</h3>
          <table>
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice, index) => (
                  <tr key={invoice.invoice_id || `invoice-${index}`}>
                    <td>{invoice.invoice_number || "N/A"}</td>
                    <td>{invoice.first_name} {invoice.last_name}</td>
                    <td>₹{invoice.total_amount}</td>
                    <td>
                      <span className={`status-label ${statusColors[invoice.status] || "bg-gray-400"}`}>
                        {invoice.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
