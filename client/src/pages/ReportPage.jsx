import React, { useState, useEffect } from "react";
import { Button } from 'react-bootstrap';
import { fetchReports } from "../controllers/reportController";
import Spinner from "../components/Spinner";
import * as XLSX from 'xlsx';
import { FaSearch } from 'react-icons/fa';

import "../css/ReportPage.css";

export default function ReportPage() {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('yearly');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchReports(reportType);
        setReportData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [reportType]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', dateStr);
      return 'Invalid Date';
    }
  };

  const formatMonth = (monthStr) => {
    if (!monthStr) return 'N/A';
    try {
      const [year, month] = monthStr.split('-');
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    } catch (error) {
      console.error('Error formatting month:', monthStr);
      return 'Invalid Month';
    }
  };

  const formatQuarter = (quarterStr) => {
    if (!quarterStr) return 'N/A';
    try {
      const [year, quarter] = quarterStr.split('-Q');
      return `Q${quarter} ${year}`;
    } catch (error) {
      console.error('Error formatting quarter:', quarterStr);
      return 'Invalid Quarter';
    }
  };

  const formatCurrency = (amount) => {
    // Handle string values from API
    const value = typeof amount === 'string' ? amount : amount?.toString();
    if (!value) return '₹0.00';
    return `₹${parseFloat(value).toFixed(2)}`;
  };

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Modify currentItems calculation to include search filter
  const filteredItems = reportData.filter(item => {
    const searchLower = search.toLowerCase();
    return Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchLower)
    );
  });

  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Add pagination controls handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const renderTableContent = () => {
    if (!reportData || reportData.length === 0) {
      return <div>No data available for the selected report type</div>;
    }

    if (reportType === 'organizationwise') {
      return (
        <table className="report-table">
          <thead>
            <tr>
              <th>Organization ID</th>
              <th>Total Invoices</th>
              <th>Total Invoiced Amount</th>
              <th>Total Tax Collected</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row, index) => (
              <tr key={index}>
                <td>{row.org_id}</td>
                <td>{row.total_invoices || 0}</td>
                <td>{formatCurrency(row.total_invoiced_amount)}</td>
                <td>{formatCurrency(row.total_tax_collected)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (reportType === 'customerwise') {
      return (
        <table className="report-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Total Invoices</th>
              <th>Total Invoiced Amount</th>
              <th>Total Due Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row, index) => (
              <tr key={index}>
                <td>{row.customer_id}</td>
                <td>{row.total_invoices || 0}</td>
                <td>{formatCurrency(row.total_invoiced_amount)}</td>
                <td>{formatCurrency(row.total_due_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (reportType === 'outstanding') {
      return (
        <table className="report-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer ID</th>
              <th>Total Amount</th>
              <th>Due Amount</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row, index) => (
              <tr key={index}>
                <td>{row.invoice_id}</td>
                <td>{row.customer_id}</td>
                <td>{formatCurrency(row.total_amount)}</td>
                <td>{formatCurrency(row.due_amount)}</td>
                <td>{formatDate(row.due_date)}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (reportType === 'quarterly') {
      return (
        <table className="report-table">
          <thead>
            <tr>
              <th>Quarter</th>
              <th>Total Invoices</th>
              <th>Total Sales</th>
              <th>Total Tax</th>
              <th>Total Due</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row, index) => (
              <tr key={index}>
                <td>{formatQuarter(row.quarter)}</td>
                <td>{row.total_invoices || 0}</td>
                <td>{formatCurrency(row.total_sales)}</td>
                <td>{formatCurrency(row.total_tax)}</td>
                <td>{formatCurrency(row.total_due)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (reportType === 'monthly') {
      return (
        <table className="report-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Total Invoices</th>
              <th>Total Sales</th>
              <th>Total Tax</th>
              <th>Total Due</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row, index) => (
              <tr key={index}>
                <td>{formatMonth(row.month)}</td>
                <td>{row.total_invoices}</td>
                <td>{formatCurrency(row.total_sales)}</td>
                <td>{formatCurrency(row.total_tax)}</td>
                <td>{formatCurrency(row.total_due)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (reportType === 'yearly') {
      return (
        <table className="report-table">
          <thead>
          <tr>
            <th>Year</th>
            <th>Total Invoices</th>
            <th>Total Sales</th>
            <th>Total Tax</th>
            <th>Total Due</th>
            <th>Discount Given</th>
            <th>Advance Received</th>
          </tr></thead>
          <tbody>
            {currentItems.map((row, index) => {
              console.log('Row data:', row); // Debug log
              return (
                <tr key={index}>
                  <td>{row.year}</td>
                  <td>{row.total_invoices}</td>
                  <td>{formatCurrency(row.total_sales)}</td>
                  <td>{formatCurrency(row.total_tax)}</td>
                  <td>{formatCurrency(row.total_due)}</td>
                  <td>{formatCurrency(row.total_discount_given)}</td>
                  <td>{formatCurrency(row.total_advance_received)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    if (reportType === 'gstreport') {
      return (
        <table className="report-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>GST Type</th>
              <th>GST Number</th>
              <th>Total Tax Collected</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row, index) => (
              <tr key={index}>
                <td>{formatMonth(row.month)}</td>
                <td>{row.gst_type || 'N/A'}</td>
                <td>{row.gst_number || 'N/A'}</td>
                <td>{formatCurrency(row.total_tax_collected)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (reportType === 'statuswise') {
      return (
        <table className="report-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Total Invoices</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row, index) => (
              <tr key={index}>
                <td>{row.status}</td>
                <td>{row.total_invoices}</td>
                <td>{formatCurrency(row.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (reportType === 'overdue') {
      return (
        <table className="report-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer ID</th>
              <th>Due Date</th>
              <th>Total Amount</th>
              <th>Due Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row, index) => (
              <tr key={index}>
                <td>{row.invoice_id}</td>
                <td>{row.customer_id}</td>
                <td>{formatDate(row.due_date)}</td>
                <td>{formatCurrency(row.total_amount)}</td>
                <td>{formatCurrency(row.due_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <table className="report-table">
        <thead><tr>
          <th>Year</th>
          <th>Total Invoices</th>
          <th>Total Sales</th>
          <th>Total Tax</th>
          <th>Total Due</th>
          <th>Discount Given</th>
          <th>Advance Received</th>
        </tr></thead>
        <tbody>
          {currentItems.map((row, index) => (
            <tr key={index}>
              <td>{row.year}</td>
              <td>{row.total_invoices || 0}</td>
              <td>{formatCurrency(row.total_sales)}</td>
              <td>{formatCurrency(row.total_tax)}</td>
              <td>{formatCurrency(row.total_due)}</td>
              <td>{formatCurrency(row.total_discount_given)}</td>
              <td>{formatCurrency(row.total_advance_received)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const downloadTableData = () => {
    if (!reportData || reportData.length === 0) {
      alert('No data available to download');
      return;
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Save workbook as XLS
    XLSX.writeFile(wb, `${reportType}_report_${new Date().toLocaleDateString()}.xls`);
  };

  return (
    <div className="reports-container">
      <section className="report-section">
        <div className="fix-header">
          <div className="header-content">
            <h2 className="reports-title">📊 Reports</h2>
          </div>
          <div className="report-controls">
            <div className="report-search-bar">
              <input
                type="text"
                placeholder="Search report"
                value={search}
                onChange={handleSearchChange}
              />
              <span className="report-search-icon"><FaSearch /></span>
            </div>
            <div className="report-actions">
              <div className="report-type-selector">
                <select 
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="report-type-select"
                >
                  <option value="yearly">Yearly Report</option>
                  <option value="quarterly">Quarterly Report</option>
                  <option value="monthly">Monthly Report</option>
                  <option value="gstreport">GST Report</option>
                  <option value="organizationwise">Organization-wise Report</option>
                  <option value="customerwise">Customer-wise Report</option>
                  <option value="statuswise">Status-wise Report</option>
                  <option value="outstanding">Outstanding Reports</option>
                  <option value="overdue">Overdue Report</option>
                </select>
              </div>
              <Button variant="outline-primary" onClick={downloadTableData}>Download XLS</Button>
            </div>
          </div>
        </div>
        <div className="report-section">
          <h3 className="report-heading">
            {reportType === 'yearly' && 'Yearly Financial Report'}
            {reportType === 'monthly' && 'Monthly Financial Report'}
            {reportType === 'quarterly' && 'Quarterly Financial Report'}
            {reportType === 'outstanding' && 'Outstanding Invoices Report'}
            {reportType === 'customerwise' && 'Customer-wise Financial Report'}
            {reportType === 'organizationwise' && 'Organization-wise Financial Report'}
            {reportType === 'gstreport' && 'GST Collection Report'}
            {reportType === 'statuswise' && 'Status-wise Invoice Report'}
            {reportType === 'overdue' && 'Overdue Invoices Report'}
          </h3>
          <div className="report-table-container">
            {isLoading ? (
              <div className="spinner-overlay">
                <Spinner />
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
                {renderTableContent()}
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                    >
                      {number}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
