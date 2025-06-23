import React, { useState, useEffect } from "react";
import { Button } from 'react-bootstrap';
import { fetchReports } from "../../controllers/reportController";
import Spinner from "../../components/Spinner";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { FaSearch, FaFileAlt, FaDownload } from 'react-icons/fa';

import "@/css/modules/report/ReportPage.css";

export default function ReportPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('yearly');
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const itemsPerPage = 10;

  // Dark mode detection
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark-mode');
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Initial check
    setIsDarkMode(document.documentElement.classList.contains('dark-mode'));

    return () => observer.disconnect();
  }, []);

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
              
              <th>Organization Name</th>
              <th>Total Invoices</th>
              <th>Total Invoiced Amount</th>
              <th>Total Tax Collected</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row, index) => (
              <tr key={index}>
               
                <td>{row.org_name}</td>
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
             // console.log('Row data:', row); // Debug log
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



const downloadTableData = async () => {
  if (!reportData || reportData.length === 0) {
    alert('No data available to download');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  // Define headers based on reportType
  let headers = [];
  if (reportType === 'yearly') {
    headers = [
      { header: 'Year', key: 'year' },
      { header: 'Total Invoices', key: 'total_invoices' },
      { header: 'Total Sales', key: 'total_sales' },
      { header: 'Total Tax', key: 'total_tax' },
      { header: 'Total Due', key: 'total_due' },
      { header: 'Discount Given', key: 'total_discount_given' },
      { header: 'Advance Received', key: 'total_advance_received' }
    ];
  } else if (reportType === 'monthly') {
    headers = [
      { header: 'Month', key: 'month' },
      { header: 'Total Invoices', key: 'total_invoices' },
      { header: 'Total Sales', key: 'total_sales' },
      { header: 'Total Tax', key: 'total_tax' },
      { header: 'Total Due', key: 'total_due' }
    ];
  } else {
    // fallback for dynamic object keys
    headers = Object.keys(reportData[0]).map(key => ({ header: key, key }));
  }

  worksheet.columns = headers;

  // Format and add rows
  reportData.forEach(row => {
    const formattedRow = { ...row };

    // Currency formatting (example: only for fields ending with "_amount", "_sales", etc.)
    for (const key in formattedRow) {
      if (/_amount|_sales|_tax|_due|_received|_given/.test(key) && formattedRow[key] != null) {
        formattedRow[key] = parseFloat(formattedRow[key]).toFixed(2);
      }
    }

    worksheet.addRow(formattedRow);
  });

  // Style header
  worksheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true };
  });

  // Generate file and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${reportType}_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
};


  return (
    <div className={`reports-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="report-header">
        <div className="report-header-content">
          <div className="report-header-left">
            <h2 className="reports-title">
              <FaFileAlt /> Reports
            </h2>
            <div className="report-search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search reports..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="report-actions">
            <div className="report-type-selector">
              <select
                className="report-type-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="organizationwise">Organization Wise</option>
                <option value="customerwise">Customer Wise</option>
                <option value="outstanding">Outstanding</option>
                <option value="gstreport">GST Report</option>
              </select>
            </div>
            <button className="report-create-button" onClick={downloadTableData}>
              <FaDownload /> Download Report
            </button>
          </div>
        </div>
      </div>

      <section className="report-section">
        {isLoading ? (
          <div className="loading-spinner-container">
            <Spinner />
          </div>
        ) : error ? (
          <p className="error-message">❌ Error: {error}</p>
        ) : (
          <div className="report-table-container">
            <div className="table-scroll-wrapper">
              {renderTableContent()}
            </div>
            {console.log('Pagination debug:', { filteredItems, itemsPerPage, totalPages, currentPage })}
            {totalPages > 1 && (
              <div className="report-pagination">
                <div className="page-info">
                  Showing {filteredItems.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} entries
                </div>
                <div className="pagination-controls">
                  <button 
                    className="control-btn" 
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </button>
                  <button 
                    className="control-btn" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const newPage = parseInt(e.target.value);
                      if (newPage >= 1 && newPage <= totalPages) {
                        handlePageChange(newPage);
                      }
                    }}
                  />
                  <button 
                    className="control-btn" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                  <button 
                    className="control-btn" 
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
