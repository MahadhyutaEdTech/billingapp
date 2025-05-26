// CustomerList.jsx
import React, { useState } from "react";
import { FaSearch, FaEye, FaTrash, FaEdit } from "react-icons/fa";
import Spinner from "../components/Spinner";
import Sidebar from "../pages/Sidebar";
import CustomerForm from "./CustomerForm";
import CustomerViewForm from "./CustomerViewForm";
import CustomerUpdateDialog from "./CustomerUpdateDialog";
import useCustomerController from "../controllers/CustomerController";
import "../css/CustomerList.css";

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const {
    customers,
    loading,
    error,
    totalPages,
    setCustomers,
    handleDeleteCustomer,
  } = useCustomerController(searchTerm, page);
  const closeDialog = () => {
    setIsDialogOpen(false);  // Close the dialog when canceled
  };

  return (
    <div className="customer-container">
      <div className="customer-section">
        <div className="fix-header">
          <div className="customer-title">
            <h2>Customers</h2>
          </div>

          <div className="customer-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search Customer"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">
                <FaSearch className="search-icon" />
              </span>
            </div>

            <button className="create-btn" onClick={() => setShowForm(true)}>
              Create New
            </button>
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
                {!loading && !error && customers.length > 0 ? (
                  customers.map((customer) => {
                    let gstDetails = null;
                    
                    // Handle GST details parsing
                    if (customer.cust_gst_details) {
                      try {
                        // Check if it's already an object
                        if (typeof customer.cust_gst_details === 'object') {
                          gstDetails = customer.cust_gst_details;
                        } else {
                          // Parse if it's a string
                          gstDetails = JSON.parse(customer.cust_gst_details);
                        }
                        
                        // Validate GST details structure
                        if (!gstDetails || !gstDetails.gst_no || !gstDetails.state_code) {
                          console.warn(`Invalid GST structure for customer ${customer.customer_id}`);
                          gstDetails = null;
                        }
                      } catch (e) {
                        console.warn(`GST parsing error for customer ${customer.customer_id}:`, e.message);
                        gstDetails = null;
                      }
                    }

                    return (
                      <tr key={customer.customer_id}>
                        <td>{`${customer.first_name || ''} ${customer.last_name || ''}`}</td>
                        <td>{customer.email || 'N/A'}</td>
                        <td>{customer.phone || 'N/A'}</td>
                        <td>{gstDetails ? gstDetails.gst_no : 'N/A'}</td>
                        <td>{gstDetails ? gstDetails.state_code : 'N/A'}</td>
                        <td className="gst-address" title={gstDetails?.address || ''}>
                          {gstDetails?.address || 'N/A'}
                        </td>
                     
                        <td className="customer-action">
                          <span className="view-btn" onClick={() => setSelectedCustomer(customer)}>
                            <FaEye className="icon" />
                          </span>
                          <span className="update-btn" onClick={() => setEditingCustomer(customer)}>
                            <FaEdit className="icon" />
                          </span>
                          <span className="delete-btn" onClick={() => handleDeleteCustomer(customer.customer_id)}>
                            <FaTrash className="icon" />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="no-customers">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span> Page {page} of {totalPages} </span>
          <button  onClick={() => setPage(page + 1)}>Next</button>
        </div>

        {showForm && <CustomerForm onClose={() => setShowForm(false)} setCustomers={setCustomers} />}
        {selectedCustomer && <CustomerViewForm customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}
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