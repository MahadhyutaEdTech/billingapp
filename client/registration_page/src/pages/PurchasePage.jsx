import { usePurchaseController, deletePurchase } from "../controllers/prchasePageController";
import { FaSearch, FaTrash, FaEdit } from "react-icons/fa";
import Spinner from "../components/Spinner";
import "../css/PurchasePage.css";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import UpdatePurchasePage from "./UpdatePurchasePage";

export default function PurchasePage() {
  const { search, setSearch, filteredPurchases, setPurchases, fetchPurchases, loading: controllerLoading } = usePurchaseController();
  const navigate = useNavigate();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const itemsPerPage = 10;

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchases = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

  // Add pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (purchaseId) => {
    setLoading(true);
    try {
      console.log("Attempting to delete purchase with ID:", purchaseId);
      
      // Make the delete API call
      const deletedPurchase = await deletePurchase(purchaseId);
      if (!deletedPurchase) return;
      
      console.log("Purchase deleted successfully:", deletedPurchase);
      
      // Reload the purchase list after deletion
      fetchPurchases();
    } catch (error) {
      console.error("Failed to delete purchase:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleUpdate = (purchaseId) => {
    setSelectedPurchaseId(purchaseId);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  // Toggle expanded row
  const toggleRowExpansion = (purchaseId) => {
    setExpandedRow(expandedRow === purchaseId ? null : purchaseId);
  };

  // Navigate to create purchase page
  const handleCreateClick = () => {
    navigate("/dashboard/create-purchase");
  };

  return (
    <div className="purchase-container">
      <div className="purchase-fixed-header">
        <div className="purchase-title">
          <h2>Purchase</h2>
        </div>
        <div className="purchase-controls">
          <div className="purchase-search-bar">
            <input
              type="text"
              placeholder="Search Purchase"
              value={search}
              onChange={handleSearchChange}
            />
            <span className="purchase-search-icon"><FaSearch /></span>
          </div>
          <button className="purchase-create-btn" onClick={handleCreateClick}>Create New</button>
        </div>
      </div>
      
      <div className="table-container">
        {(loading || controllerLoading) && (
          <div className="spinner-overlay">
            <Spinner />
          </div>
        )}
        <table className="purchase-table">
          <thead>
            <tr>
              <th>Expenses Number</th>
              <th>Supplier</th>
              <th>Purchase Date</th>
              <th>Total Amount</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPurchases.length > 0 ? (
              currentPurchases.map((purchase, index) => (
                <React.Fragment key={index}>
                  <tr 
                    onClick={() => toggleRowExpansion(purchase.purchase_id)}
                    className={`purchase-row ${expandedRow === purchase.purchase_id ? "expanded" : ""}`}
                  >
                    <td>{purchase.expenses_number}</td>
                    <td>{purchase.supplier_name}</td>
                    <td>{purchase.purchase_date}</td>
                    <td>₹{parseFloat(purchase.total_amount).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${purchase.payment_status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {purchase.payment_status}
                      </span>
                    </td>
                    <td>
                      <span className="purchase-action-buttons">
                        <button
                          className="purchase-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(purchase.purchase_id);
                          }}
                        >
                          <FaTrash />
                        </button>
                        <button
                          className="purchase-update-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdate(purchase.purchase_id);
                          }}
                        >
                          <FaEdit />
                        </button>
                      </span>
                    </td>
                  </tr>
                  {expandedRow === purchase.purchase_id && (
                    <tr className="expanded-details">
                      <td colSpan="6">
                        <div className="details-grid">
                          <div className="detail-section">
                            <h4>Purchase Information</h4>
                            <p><strong>Expenses Number:</strong> {purchase.expenses_number}</p>
                            <p><strong>Supplier:</strong> {purchase.supplier_name}</p>
                            <p><strong>Purchase Date:</strong> {purchase.purchase_date}</p>
                            <p><strong>Due Date:</strong> {purchase.due_date}</p>
                          </div>

                          <div className="detail-section">
                            <h4>Financial Details</h4>
                            <p><strong>Total Amount:</strong> ₹{parseFloat(purchase.total_amount).toFixed(2)}</p>
                            <p><strong>Payment Status:</strong> {purchase.payment_status}</p>
                            <p><strong>Items Count:</strong> {purchase.items_count}</p>
                          </div>

                          <div className="detail-section">
                            <h4>Additional Information</h4>
                            <p><strong>Notes:</strong> {purchase.notes}</p>
                            <p><strong>Items:</strong> {purchase.items_count} items in this purchase</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No purchases available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          Previous
        </button>

        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="pagination-btn"
        >
          Next
        </button>
      </div>

      {/* Update dialog */}
      {isDialogOpen && selectedPurchaseId && (
        <UpdatePurchasePage
          purchase={filteredPurchases.find((purchase) => purchase.purchase_id === selectedPurchaseId)}
          onClose={closeDialog}
          setPurchases={setPurchases}
        />
      )}
    </div>
  );
}