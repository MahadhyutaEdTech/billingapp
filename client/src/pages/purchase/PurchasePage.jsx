import { usePurchaseController } from "../../controllers/prchasePageController";
import { FaSearch, FaTrash, FaEdit, FaShoppingCart, FaPlus } from "react-icons/fa";
import Spinner from "../../components/Spinner";
import "@/css/modules/purchase/PurchasePage.css";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import UpdatePurchasePage from "./UpdatePurchasePage";
import PurchaseDetailDialog from "./PurchaseDetailDialog";

export default function PurchasePage() {
  const { 
    search, 
    setSearch, 
    filteredPurchases, 
    setPurchases, 
    fetchPurchases, 
    loading: controllerLoading,
    deletePurchase 
  } = usePurchaseController();
  const navigate = useNavigate();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
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
      await deletePurchase(purchaseId);
      setPurchases(prev => prev.filter(p => p.purchase_id !== purchaseId));
      setIsDialogOpen(false);
      //console.log("Purchase deleted successfully");
    } catch (error) {
      console.error("Failed to delete purchase:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    // Reset to first page when searching
    setCurrentPage(1);
  };

  const handleUpdate = (purchaseId) => {
    setSelectedPurchaseId(purchaseId);
    setIsDialogOpen(false);
    setIsUpdateDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedPurchaseId(null);
  };

  const closeUpdateDialog = () => {
    setIsUpdateDialogOpen(false);
    setSelectedPurchaseId(null);
  };

  // Toggle expanded row
  const toggleRowExpansion = (purchaseId) => {
    setExpandedRow(expandedRow === purchaseId ? null : purchaseId);
  };

  const handleRowClick = (purchaseId) => {
    setSelectedPurchaseId(purchaseId);
    setIsDialogOpen(true);
  };

  // Navigate to create purchase page
  const handleCreateClick = () => {
    navigate("/dashboard/create-purchase");
  };

  // Add date formatter function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const selectedPurchase = filteredPurchases.find(p => p.purchase_id === selectedPurchaseId);

  return (
    <div className="purchase-list-container">
      <div className="purchase-header">
        <div className="purchase-header-content">
          <div className="purchase-header-left">
            <h2>
              <FaShoppingCart />
              Purchase
            </h2>
            <div className="purchase-search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search purchases..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <button className="purchase-create-btn" onClick={handleCreateClick}>
            <FaPlus />
            Create New
          </button>
        </div>
      </div>
      
      <section className="purchase-section">
        {(loading || controllerLoading) ? (
          <div className="loading-spinner-container">
            <Spinner />
          </div>
        ) : filteredPurchases.length === 0 ? (
          <p className="no-data">No purchases available</p>
        ) : (
          <div className="purchase-table-container">
            <div className="table-scroll-wrapper">
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
                          onClick={() => handleRowClick(purchase.purchase_id)}
                          className={`purchase-row ${expandedRow === purchase.purchase_id ? "expanded" : ""}`}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>{purchase.expenses_number}</td>
                          <td>{purchase.supplier_name}</td>
                          <td>{formatDate(purchase.purchase_date)}</td>
                          <td>₹{parseFloat(purchase.total_amount).toFixed(2)}</td>
                          <td>
                            <span className={`status-badge ${purchase.payment_status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {purchase.payment_status}
                            </span>
                          </td>
                          <td>
                            <div className="purchase-action-buttons">
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
                            </div>
                          </td>
                        </tr>
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

            {totalPages > 1 && (
              <div className="simple-pagination">
                <div className="page-info">
                  Showing {filteredPurchases.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredPurchases.length)} of {filteredPurchases.length} entries
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

      {/* Purchase Detail Dialog */}
      {isDialogOpen && selectedPurchase && (
        <PurchaseDetailDialog
          purchase={selectedPurchase}
          onClose={closeDialog}
          onEdit={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      {/* Update Purchase Dialog */}
      {isUpdateDialogOpen && selectedPurchase && (
        <div className="dialog-overlay" onClick={closeUpdateDialog}>
          <div className="dialog-content update-dialog" onClick={e => e.stopPropagation()}>
            <UpdatePurchasePage
              purchase={selectedPurchase}
              onClose={closeUpdateDialog}
              setPurchases={setPurchases}
            />
          </div>
        </div>
      )}
    </div>
  );
}