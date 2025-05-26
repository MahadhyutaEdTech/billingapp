import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useInvoices from "../controllers/invoiceController";
import {
  statusColors,
  deleteInvoice,
  filterInvoice,
} from "../models/invoiceModel";
import InvoiceUpdateDialogbox from "./InvoiceUpdateDialogbox";
import { FaFilePdf, FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import "../css/InvoiceTable.css";

export default function InvoiceTable() {
  const {
    search,
    setSearch,
    filteredInvoices,
    loading,
    error,
    setInvoices,
    page,
    setPage,
    totalPages,
  } = useInvoices();

  const navigate = useNavigate();

  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const viewInvoice = (invoice) => {
    if (!invoice || typeof invoice !== "object") {
      console.error("Invalid invoice object:", invoice);
      alert("Error: Invoice data is missing or invalid!");
      return;
    }

    console.log("Navigating to invoice:", invoice);

    navigate(`/dashboard/invoice/${invoice.invoice_id}`, {
      state: { invoiceId: invoice.invoice_id },
    });
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
    console.log("🔄 Updating invoice:", invoice);
    setSelectedInvoice(invoice);
    setShowUpdateForm(true);
  };

  const handleFilter = async (status) => {
    setSelectedStatus(status);
    setPage(1); // Reset pagination on filter change

    if (status === "All" || status === "") {
      // Reset to show all invoices
      try {
        const allInvoices = await filterInvoice(""); // Pass an empty string or appropriate parameter to fetch all invoices
        setInvoices(allInvoices);
      } catch (error) {
        console.error("Error fetching all invoices:", error);
      }
    } else {
      try {
        const filteredData = await filterInvoice(status);
        setInvoices(filteredData);
      } catch (error) {
        console.error("Error filtering invoices:", error);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const closeUpdateForm = () => {
    setShowUpdateForm(false);
  };

  return (
    <div className="invoice-container">
      <section className="invoice-section">
        <div className="invoice-fix-header">
          <div className="invoice-title">
            <h2>Invoices</h2>
          </div>

          <div className="invoice-controls">
            <div className="invoice-search-bar">
              <input
                type="text"
                placeholder="Search Invoice"
                value={search}
                onChange={handleSearchChange}
              />
              <span className="invoice-search-icon">
                <FaSearch className="search-icon" />
              </span>
            </div>

            <select
              className="filter-dropdown"
              value={selectedStatus}
              onChange={(e) => handleFilter(e.target.value)}
            >
              <option value="" hidden>
                Filter by Status
              </option>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Paid">Paid</option>
            </select>

            <button
              className="create-btn"
              onClick={() => navigate("/dashboard/createinvoice")}
            >
              Create New
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <p className="error-message">❌ Error: {error}</p>
        ) : (
          <div className="invoice-table-container">
            <div className="table-scroll-wrapper">
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
                  {filteredInvoices?.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <tr key={invoice.invoice_id}>
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
                            className={`status-label ${
                              statusColors[invoice.status?.trim()] ||
                              "bg-gray-400"
                            }`}
                          >
                            {invoice.status?.trim() || "Unknown"}
                          </span>
                        </td>

                        <td className="invoice-action">
                          <span
                            className="view-btn"
                            onClick={() => viewInvoice(invoice)}
                          >
                            <FaFilePdf className="icon" />
                          </span>
                          <span
                            className="delete-btn"
                            onClick={() => handleDelete(invoice.invoice_id)}
                          >
                            <FaTrash className="icon" />
                          </span>
                          <span
                            className="update-btn"
                            onClick={() => handleUpdate(invoice)}
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
            </div>
          </div>
        )}

        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span>
            {" "}
            Page {page} of {totalPages}{" "}
          </span>
          <button onClick={() => setPage(page + 1)}>Next</button>
        </div>

        {showUpdateForm && selectedInvoice && (
          <InvoiceUpdateDialogbox
            invoice={selectedInvoice}
            onClose={closeUpdateForm}
            setInvoices={setInvoices}
          />
        )}
      </section>
    </div>
  );
}
