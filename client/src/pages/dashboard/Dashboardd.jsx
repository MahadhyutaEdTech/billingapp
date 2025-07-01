import { useMemo, useEffect } from "react"
import { useDashboardData } from "../../controllers/dashboardController"
import { FaFileInvoice, FaMoneyBillWave, FaUsers, FaChartLine, FaMoon, FaSun } from "react-icons/fa"
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2"
import { Link } from "react-router-dom"
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
} from "chart.js"
import "../../css/modules/common/Dashboard.css"
import "../../css/modules/common/darkMode.css"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        padding: 20,
        font: {
          family: "'Poppins', sans-serif",
        },
        color: "var(--chart-text)",
      },
    },
  },
  scales: {
    x: {
      ticks: {
        font: {
          family: "'Poppins', sans-serif",
        },
        color: "var(--chart-text)",
      },
      grid: {
        color: "var(--chart-grid)",
      },
    },
    y: {
      ticks: {
        font: {
          family: "'Poppins', sans-serif",
        },
        color: "var(--chart-text)",
      },
      grid: {
        color: "var(--chart-grid)",
      },
    },
  },
}

export default function Dashboard() {
  const {
    totalInvoices = 0,
    filteredInvoices = [],
    pendingPayment = 0,
    paidInvoice = 0,
    totalCustomers = 0,
    averageInvoiceValue = 0,
    invoiceData,
    monthlyRevenue,
    profitTrend,
    highestSaleProduct,
    loading,
  } = useDashboardData()

  //console.log("📊 Dashboard Data:", {
    //totalInvoices,
    //pendingPayment,
    //paidInvoice,
   // totalCustomers,
   // averageInvoiceValue,
   // highestSaleProduct
 // });

  // Theme toggle functionality
  const toggleTheme = () => {
    const root = document.documentElement;
    const isDarkMode = !root.classList.contains('dark-mode');
    root.classList.toggle('dark-mode');
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    }
  }, []);

  useEffect(() => {
    console.log("Dashboard filteredInvoices:", filteredInvoices);
  }, [filteredInvoices]);

  const recentTransactions = useMemo(() => filteredInvoices.slice(0, 5), [filteredInvoices])

  const statusColors = {
    Paid: "var(--success-color)",
    Pending: "var(--warning-color)",
    Overdue: "var(--error-color)",
    Unpaid: "var(--info-color)",
  }

  // Format currency values
  const formatCurrency = (value) => {
    if (typeof value !== 'number') {
      value = parseFloat(value) || 0;
    }
    return `₹${value.toFixed(2)}`;
  };

  // Custom chart options for highest sale product
  const highestSaleOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} units sold`;
          }
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            family: "'Poppins', sans-serif",
            size: 12
          },
          color: "var(--chart-text)",
        }
      }
    }
  };

  return (
    <div className="dashboard">
     

      {/* Metrics Cards Row */}
      <div className="metrics-grid">
        {/* Total Invoices Card */}
        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-info">
              <h2 className="metric-value">{totalInvoices}</h2>
              <p className="metric-label">Total Invoices</p>
            </div>
            <div className="metric-icon invoice-icon">
              <FaFileInvoice size={24} />
            </div>
          </div>
        </div>

        {/* Pending Payments Card */}
        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-info">
              <h2 className="metric-value warning">{formatCurrency(pendingPayment)}</h2>
              <p className="metric-label">Pending Payments</p>
            </div>
            <div className="metric-icon payment-icon">
              <FaMoneyBillWave size={24} />
            </div>
          </div>
        </div>

        {/* Paid Invoices Card */}
        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-info">
              <h2 className="metric-value succes">{formatCurrency(paidInvoice)}</h2>
              <p className="metric-label">Paid Invoices</p>
            </div>
            <div className="metric-icon success-icon">
              <FaMoneyBillWave size={24} />
            </div>
          </div>
        </div>

        {/* Total Customers Card */}
        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-info">
              <h2 className="metric-value info">{totalCustomers}</h2>
              <p className="metric-label">Total Customers</p>
            </div>
            <div className="metric-icon customer-icon">
              <FaUsers size={24} />
            </div>
          </div>
        </div>

        {/* Average Invoice Value Card */}
        <div className="metric-card">
          <div className="metric-content">
            <div className="metric-info">
              <h2 className="metric-value secondary">{formatCurrency(averageInvoiceValue)}</h2>
              <p className="metric-label">Avg. Invoice Value</p>
            </div>
            <div className="metric-icon chart-icon">
              <FaChartLine size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Monthly Revenue</h3>
          <div className="chart-container">
            {monthlyRevenue?.datasets?.length ? (
              <Bar data={monthlyRevenue} options={chartOptions} />
            ) : (
              <p className="loading-text">Loading...</p>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Invoice Status</h3>
          <div className="chart-container">
            {invoiceData?.datasets?.length ? (
              <Doughnut data={invoiceData} options={chartOptions} />
            ) : (
              <p className="loading-text">Loading...</p>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Profit Trend</h3>
          <div className="chart-container">
            {profitTrend?.datasets?.length ? (
              <Line data={profitTrend} options={chartOptions} />
            ) : (
              <p className="loading-text">Loading...</p>
            )}
          </div>
        </div>
      </div>

      {/* Product & Transactions Section */}
      <div className="bottom-grid">
        <div className="chart-card large">
          <h3 className="chart-title">Highest Sale Product</h3>
          <div className="chart-container">
            {loading ? (
              <p className="loading-text">Loading...</p>
            ) : highestSaleProduct?.datasets?.[0]?.data?.some(value => value > 0) ? (
              <Pie 
                data={highestSaleProduct} 
                options={highestSaleOptions}
              />
            ) : (
              <div className="no-data-container">
                <p className="no-data-text">No sales data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="transactions-card">
          <div className="transactions-header">
            <h3 className="chart-title">Recent Transactions</h3>
            <Link to="/dashboard/invoices" className="view-all-btn">View All</Link>
          </div>
          <div className="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{transaction.invoice_number || "N/A"}</td>
                    <td>{formatCurrency(transaction.total_amount)}</td>
                    <td>
                      {(() => {
                        // Normalize status to Title Case for color and display
                        const status = transaction.status
                          ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1).toLowerCase()
                          : "Unknown";
                        return (
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: `${statusColors[status] || "#ccc"}20`,
                              color: statusColors[status] || "#333"
                            }}
                          >
                            {status}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="no-data">No recent transactions</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
