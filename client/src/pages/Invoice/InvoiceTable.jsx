import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useInvoices from "../../controllers/invoiceController";
import {
  statusColors,
  deleteInvoice,
  filterInvoice,
  fetchInvoices
} from "../../models/invoiceModel";
import InvoiceUpdateDialogbox from "./InvoiceUpdateDialogbox";
import InvoiceDetailsPage from "./InvoiceDetailsPage";
import { FaFilePdf, FaTrash, FaEdit, FaSearch, FaFileInvoiceDollar, FaPlus } from "react-icons/fa";
import "../../css/modules/invoice/InvoiceTable.css";

export default function InvoiceTable() {
  const {
    search,
    setSearch,
    filteredInvoices,
    loading: controllerLoading,
    error,
    setInvoices,
    page,
    setPage,
    totalPages,
    getInvoiceDetailsForDisplay,
    invoiceDetailsLoading,
    invoiceDetailsError,
    fetchInvoices,
    setFilteredInvoices
  } = useInvoices();

  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Set items per page, consistent with ProductPage
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);

  // Calculate pagination for current view
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPagesLocal = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Handle page change for local pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Fetch all invoices when component mounts or filter changes
  useEffect(() => {
    handleFilter("All");
  }, []);

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

  const viewInvoice = async (invoiceSummary) => {
    if (!invoiceSummary || typeof invoiceSummary !== "object") {
      console.error("Invalid invoice summary object:", invoiceSummary);
      alert("Error: Invoice data is missing or invalid!");
      return;
    }
    
    // Fetch full details of the invoice
    const fullInvoiceDetails = await getInvoiceDetailsForDisplay(invoiceSummary.invoice_id);
    if (fullInvoiceDetails) {
      setSelectedInvoice(fullInvoiceDetails);
      setShowInvoiceDetails(true);
    } else if (invoiceDetailsError) {
      alert(invoiceDetailsError);
    }
  };

  const closeInvoiceDetails = () => {
    setShowInvoiceDetails(false);
    setSelectedInvoice(null);
  };

  const handleDelete = async (id) => {
    const success = await deleteInvoice(id);
    if (success) {
      setInvoices((prevInvoices) =>
        prevInvoices.filter((invoice) => invoice.invoice_id !== id)
      );
    }
  };

  const handleUpdate = (invoice) => {
    setSelectedInvoice(invoice);
    setShowUpdateForm(true);
  };

  const handleFilter = async (status) => {
    setSelectedStatus(status);
    setPage(1);
    setCurrentPage(1);

    if (status === "All") {
      // Fetch all invoices
      const allInvoices = await fetchInvoices();
      setInvoices(allInvoices);
      setFilteredInvoices(allInvoices);
    } else {
      // Fetch filtered invoices from API
      const filtered = await filterInvoice(status);
      setInvoices(filtered);
      setFilteredInvoices(filtered);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
    setCurrentPage(1);
  };

  const closeUpdateForm = () => {
    setShowUpdateForm(false);
    setSelectedInvoice(null);
  };

  const handlePdf = (invoiceId) => {
    const savedTemplate = localStorage.getItem(`invoice_template_${invoiceId}`);
  
    if (savedTemplate) {
      // Redirect directly to the saved template's PDF
      navigate(`/dashboard/${savedTemplate}-invoice-pdf/${invoiceId}`);
    } else {
      // Redirect to template chooser if not selected yet
      navigate(`/dashboard/invoice-template-chooser/${invoiceId}`);
    }
  };

  const handleUpdateAfter = async (updatedInvoice, changes) => {
    if (setInvoices) {
      setInvoices((prevInvoices) =>
        prevInvoices.map((inv) =>
          inv.invoice_id === updatedInvoice.invoice_id ? { ...inv, ...changes } : inv
        )
      );
    }

    if (fetchInvoices) {
      await fetchInvoices();
    }
  };

  return (
    <div className={`invoice-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <section className="invoice-section">
        <div className="invoice-header">
          <div className="invoice-header-content">
            <div className="invoice-header-left">
              <h2>
                <FaFileInvoiceDollar />
                Invoices
              </h2>
              <div className="invoice-search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <select
              className="filter-dropdown"
              value={selectedStatus}
              onChange={(e) => handleFilter(e.target.value)}
            >
              <option value="All">All Invoices</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Paid">Paid</option>
            </select>

            <button
              className="invoice-create-btn"
              onClick={() => navigate("/dashboard/createinvoice")}
            >
              <FaPlus />
              Create New
            </button>
          </div>
        </div>

        {(controllerLoading || invoiceDetailsLoading) ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (error || invoiceDetailsError) ? (
          <p className="error-message">❌ Error: {error || invoiceDetailsError}</p>
        ) : (
          <div className="invoice-table-container">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer Name</th>
                  <th>Taxable Amount</th>
                  <th>Tax Amount</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.length > 0 ? (
                  currentInvoices.map((invoice) => (
                    <tr
                      key={invoice.invoice_id}
                      onClick={() => viewInvoice(invoice)}
                      className="invoice-row-clickable"
                    >
                      <td className="invoice-cell">
                        {invoice.invoice_id || "N/A"}
                      </td>
                      <td className="invoice-cell">
                        {invoice.first_name} {invoice.last_name}
                      </td>
                      <td className="invoice-cell text-right">
                        ₹
                        {(invoice.total_amount - invoice.tax_amount).toFixed(
                          2
                        )}
                      </td>
                      <td className="invoice-cell text-right">
                        ₹{Number(invoice.tax_amount).toFixed(2)}
                      </td>
                      <td className="invoice-cell text-right">
                        ₹{Number(invoice.total_amount).toFixed(2)}
                      </td>
                      <td className="invoice-cell">
                        <span
                          className={`status-label status-${invoice.status?.trim().toLowerCase()}`}
                        >
                          {invoice.status?.trim() || "Unknown"}
                        </span>
                      </td>

                      <td className="invoice-action">
                        <span
                          className="invoice-view-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePdf(invoice.invoice_id);
                          }}
                        >
                          <FaFilePdf className="icon" />
                        </span>
                        <span
                          className="invoice-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(invoice.invoice_id);
                          }}
                        >
                          <FaTrash className="icon" />
                        </span>
                        <span
                          className="invoice-update-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdate(invoice);
                          }}
                        >
                          <FaEdit className="icon" />
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-invoices">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination UI */}
            <div className="pagination">
              <div className="page-info">
                Showing {filteredInvoices.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredInvoices.length)} of {filteredInvoices.length} entries
              </div>
              <div className="pagination-controls">
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
                  max={totalPagesLocal}
                  value={currentPage}
                  onChange={(e) => handlePageChange(parseInt(e.target.value))}
                />
                <button 
                  className="control-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPagesLocal}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {showUpdateForm && (
        <InvoiceUpdateDialogbox
          invoice={selectedInvoice}
          onClose={closeUpdateForm}
          setInvoices={handleUpdateAfter}
        />
      )}

      {showInvoiceDetails && (
        <InvoiceDetailsPage
          invoice={selectedInvoice}
          onClose={closeInvoiceDetails}
        />
      )}
    </div>
  );
}
