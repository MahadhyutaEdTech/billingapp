import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaSearch, FaTrash, FaEdit, FaFilter, FaFileAlt, FaPlus, FaEye, FaExchangeAlt } from "react-icons/fa";
import Spinner from "../../components/Spinner";
import { getQuotations, searchQuotations, filterQuotations, deleteQuotation, convertToInvoice } from "../../controllers/quotationController";
import "../../css/modules/quotation/QuotationTable.css";
import QuotationDetailsPage from "./QuotationDetailsPage";
import UpdateQuotationPage from "./UpdateQuotationPage";

// Placeholder for dark mode (replace with context or prop as needed)
const darkMode = false; // TODO: connect to app state

const QuotationTable = () => {
  const [quotations, setQuotations] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [itemsPerPage] = useState(10);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const navigate = useNavigate();

  const statuses = ["All", "Draft", "Sent", "Accepted", "Rejected", "Expired", "Converted"];

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuotations();
      setQuotations(data);
      setFilteredQuotations(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (err) {
      setError("Failed to load quotations");
      console.error("Error loading quotations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = quotations;

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter((quotation) => {
        const searchLower = search.toLowerCase();
        return (
          quotation.quotation_number?.toLowerCase().includes(searchLower) ||
          quotation.first_name?.toLowerCase().includes(searchLower) ||
          quotation.last_name?.toLowerCase().includes(searchLower) ||
          quotation.customer_email?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (selectedStatus !== "All") {
      filtered = filtered.filter((quotation) => 
        quotation.status?.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    setFilteredQuotations(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1);
  }, [search, quotations, selectedStatus, itemsPerPage]);

  const handleSearch = async () => {
    if (!search.trim()) {
      await fetchQuotations();
      return;
    }

    setLoading(true);
    try {
      const data = await searchQuotations(search);
      setFilteredQuotations(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setPage(1);
    } catch (err) {
      toast.error("Failed to search quotations");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = async (status) => {
    if (status === "All") {
      await fetchQuotations();
      return;
    }

    setLoading(true);
    try {
      const data = await filterQuotations(status);
      setFilteredQuotations(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setPage(1);
    } catch (err) {
      toast.error("Failed to filter quotations");
      console.error("Filter error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quotationId) => {
    const confirmed = window.confirm("Are you sure you want to delete this quotation?");
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteQuotation(quotationId);
      toast.success("Quotation deleted successfully");
      await fetchQuotations();
    } catch (err) {
      toast.error("Failed to delete quotation");
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToInvoice = async (quotationId) => {
    const confirmed = window.confirm("Are you sure you want to convert this quotation to an invoice?");
    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await convertToInvoice(quotationId);
      toast.success("Quotation converted to invoice successfully");
      await fetchQuotations();
      // Optionally navigate to the new invoice
      if (result.invoice_id) {
        navigate(`/dashboard/invoice/${result.invoice_id}`);
      }
    } catch (err) {
      toast.error("Failed to convert quotation to invoice");
      console.error("Convert error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "#6b7280";
      case "sent":
        return "#3b82f6";
      case "accepted":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      case "expired":
        return "#f59e0b";
      case "converted":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getPaginatedData = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredQuotations.slice(startIndex, endIndex);
  };

  const totalAmount = filteredQuotations.reduce((sum, quotation) => sum + (Number(quotation.total_amount) || 0), 0);

  const handleView = (id) => {
    setSelectedQuotationId(id);
    setShowDetails(true);
  };

  return (
    <div className={`quotation-table-container${darkMode ? " dark-mode" : ""}`}>
      <section className="qt-section">
        <div className="quotation-table-header">
          <div className="quotation-table-header-content">
            <div className="quotation-table-header-left">
              <h2>
                <FaFileAlt style={{ fontSize: "1.75rem", color: darkMode ? "#e0e0e0" : "#333" }} />
                Quotations
              </h2>
              <div className="qt-search-bar">
                <span className="qt-search-icon">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search quotations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  aria-label="Search quotations"
                />
              </div>
            </div>
            <div className="quotation-table-header-left">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  handleStatusFilter(e.target.value);
                }}
                className="qt-filter-dropdown"
                aria-label="Filter by status"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                className="qt-create-btn"
                onClick={() => navigate("/dashboard/create-quotation")}
                aria-label="Create new quotation"
              >
                <FaPlus />
                <span className="hide-on-mobile">Create New</span>
              </button>
              <button
                className="qt-filter-btn"
                onClick={() => setShowFilters(!showFilters)}
                aria-label="Show advanced filters"
              >
                <FaFilter />
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="qt-advanced-filters">
              <div className="qt-filter-group">
                <input
                  type="date"
                  placeholder="From Date"
                  className="qt-filter-input"
                  aria-label="From date"
                />
                <input
                  type="date"
                  placeholder="To Date"
                  className="qt-filter-input"
                  aria-label="To date"
                />
                <button className="qt-reset-btn" aria-label="Reset filters">
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="quotation-table-content-wrapper">
          <div className="qt-table-container">
            {loading ? (
              <div className="qt-spinner-overlay">
                <Spinner />
              </div>
            ) : error ? (
              <p className="qt-error-message">❌ Error: {error}</p>
            ) : (
              <table className="qt-table">
                <thead>
                  <tr>
                    <th>Quotation #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Valid Until</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && !error && filteredQuotations.length > 0 ? (
                    getPaginatedData().map((quotation) => (
                      <tr key={quotation.quotation_id} className="qt-row">
                        <td>{quotation.quotation_number}</td>
                        <td>
                          {quotation.first_name} {quotation.last_name}
                          <br />
                          <small>{quotation.customer_email}</small>
                        </td>
                        <td>{formatDate(quotation.quotation_date)}</td>
                        <td>{formatDate(quotation.valid_until)}</td>
                        <td>₹{Number(quotation.total_amount).toLocaleString()}</td>
                        <td>
                          <span
                            className="qt-status-badge"
                            style={{ background: getStatusColor(quotation.status) }}
                          >
                            {quotation.status}
                          </span>
                        </td>
                        <td className="qt-actions">
                          <button
                            className="qt-action-btn qt-view-btn"
                            onClick={() => handleView(quotation.quotation_id)}
                            title="View Details"
                            aria-label="View details"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="qt-action-btn qt-edit-btn"
                            onClick={() => {
                              setSelectedQuotationId(quotation.quotation_id);
                              setShowUpdateDialog(true);
                            }}
                            title="Edit"
                            aria-label="Edit quotation"
                          >
                            <FaEdit />
                          </button>
                          {quotation.status !== "Converted" && (
                            <button
                              className="qt-action-btn qt-convert-btn"
                              onClick={() => handleConvertToInvoice(quotation.quotation_id)}
                              title="Convert to Invoice"
                              aria-label="Convert to invoice"
                            >
                              <FaExchangeAlt />
                            </button>
                          )}
                          <button
                            className="qt-action-btn qt-delete-btn"
                            onClick={() => handleDelete(quotation.quotation_id)}
                            title="Delete"
                            aria-label="Delete quotation"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="qt-text-center">
                        No quotations found.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="qt-summary-row">
                    <td colSpan={4} style={{ textAlign: "right", fontWeight: "bold" }}>
                      Total:
                    </td>
                    <td style={{ fontWeight: "bold" }}>
                      ₹{totalAmount.toLocaleString()}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          <div className="qt-pagination-container">
            <div className="qt-pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="qt-pagination-btn"
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="qt-pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="qt-pagination-btn"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {showDetails && (
          <QuotationDetailsPage
            quotationId={selectedQuotationId}
            onClose={() => setShowDetails(false)}
          />
        )}

        {showUpdateDialog && (
          <UpdateQuotationPage
            quotationId={selectedQuotationId}
            onClose={() => {
              setShowUpdateDialog(false);
              setSelectedQuotationId(null);
              fetchQuotations();
            }}
            darkMode={darkMode}
          />
        )}
      </section>
    </div>
  );
};

export default QuotationTable; 