// CustomerList.jsx
import React, { useState, useEffect } from "react";
import { FaSearch, FaEye, FaTrash, FaEdit } from "react-icons/fa";
import Spinner from "../../components/Spinner";

import CustomerForm from "./CustomerForm";
import CustomerViewForm from "././CustomerViewForm";
import CustomerUpdateDialog from "./CustomerUpdateDialog";
import useCustomerController from "../../controllers/CustomerController";
import "../../css/modules/customer/CustomerList.css";

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark-mode');
  });

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark-mode'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const {
    customers,
    loading,
    error,
    totalPages,
    setCustomers,
    handleDeleteCustomer,
  } = useCustomerController(searchTerm, page);
  const closeDialog = () => {
    setIsDialogOpen(false); // Close the dialog when canceled
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = customers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPagesLocal = Math.ceil(customers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleRowClick = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleCloseViewForm = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className={`customer-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="customer-section">
        <div className="fix-header">
          <div className="customer-header-content">
            <div className="customer-header-left">
              <h2 className="customer-title">Customers</h2>
            </div>
            <div className="customer-search-bar">
              <input
                type="text"
                placeholder="Search Customer"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <span className="search-icon">
                <FaSearch className="search-icon" />
              </span>
            </div>

            <div className="customer-actions">
              <button className="create-btn" onClick={() => setShowForm(true)}>
                Create New
              </button>
            </div>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="spinner-overlay">
              <Spinner />
            </div>
          ) : error ? (
            <p className="error-message">❌ Error: {error}</p>
          ) : (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>GST Number</th>
                  <th>State</th>
                  <th>GST Address</th>

                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && !error && currentItems.length > 0 ? (
                  currentItems.map((customer) => {
                    let gstDetails = null;

                    if (customer.cust_gst_details) {
                      try {
                        gstDetails =
                          typeof customer.cust_gst_details === "object"
                            ? customer.cust_gst_details
                            : JSON.parse(customer.cust_gst_details);

                        if (
                          !gstDetails ||
                          !gstDetails.gst_no ||
                          !gstDetails.state_code
                        ) {
                          console.warn(
                            `Invalid GST structure for customer ${customer.customer_id}`
                          );
                          gstDetails = null;
                        }
                      } catch (e) {
                        console.warn(
                          `GST parsing error for customer ${customer.customer_id}:`,
                          e.message
                        );
                        gstDetails = null;
                      }
                    }

                    return (
                      <tr
                        key={customer.customer_id}
                        className="hover-row"
                        onClick={() => handleRowClick(customer)}
                      >
                          <td>{`${customer.first_name || ""} ${
                            customer.last_name || ""
                          }`}</td>
                          <td>{customer.email || "N/A"}</td>
                          <td>{customer.phone || "N/A"}</td>
                          <td>{gstDetails ? gstDetails.gst_no : "N/A"}</td>
                          <td>{gstDetails ? gstDetails.state_code : "N/A"}</td>
                          <td>{gstDetails?.address || "N/A"}</td>
                          <td className="customer-action">
                            {/*<span
                              className="view-btn"
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              <FaEye className="icon" />
                            </span>
                            */}
                            <span
                              className="update-btn"
                              onClick={() => setEditingCustomer(customer)}
                            >
                              <FaEdit className="icon" />
                            </span>
                            <span
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteCustomer(customer.customer_id)
                              }
                            >
                              <FaTrash className="icon" />
                            </span>
                          </td>
                        </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="no-customers">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          <div className="simple-pagination">
            <div className="page-info">
              Showing {customers.length > 0 ? indexOfFirstItem + 1 : 0} to{" "}
              {Math.min(indexOfLastItem, customers.length)} of {customers.length}{" "}
              entries
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
                value={currentPage}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value > 0 && value <= totalPagesLocal) {
                    handlePageChange(value);
                  }
                }}
                min="1"
                max={totalPagesLocal}
              />
              <span className="page-info">of {totalPagesLocal}</span>
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

        {showForm && (
          <CustomerForm
            onClose={() => setShowForm(false)}
            setCustomers={setCustomers}
          />
        )}
        {selectedCustomer && (
          <CustomerViewForm
            customer={selectedCustomer}
            onClose={handleCloseViewForm}
          />
        )}
        {editingCustomer && (
          <CustomerUpdateDialog
            customer={editingCustomer}
            onClose={() => setEditingCustomer(null)}
            setCustomers={setCustomers}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerList;
