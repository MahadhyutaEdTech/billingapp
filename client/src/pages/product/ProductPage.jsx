import { useProductController, deleteProduct, fetchProductById } from "../../controllers/productPageController";
import { FaSearch, FaTrash, FaEdit, FaBuilding, FaPlus, FaBox } from "react-icons/fa";
import Spinner from "../../components/Spinner";
import "@/css/modules/product/ProductPage.css"
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import UpdateProductPage from "./UpdateProductPage";  // Import the UpdateProductPage component
import ProductDetailsDialog from "./ProductDetailsDialog"; // Import the new dialog


export default function ProductPage() {
  const { search, setSearch, filteredProducts, setProducts, fetchProducts, loading: controllerLoading } = useProductController();
  const navigate = useNavigate();
  
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);  // State for update dialog visibility
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);  // State for details dialog visibility
  const [selectedProductId, setSelectedProductId] = useState(null);  // State to hold the selected product ID
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);  // State for product details
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Add pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (productId) => {
    setLoading(true);
    try {
      //console.log("Attempting to delete product with ID:", productId);
      
      // Make the delete API call
      const deletedProduct = await deleteProduct(productId); // Call the API to delete the product
      if (!deletedProduct) return; // Stop if deletion fails
      
      //console.log("Product deleted successfully:", deletedProduct);
      
      // Reload the product list after deletion
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleUpdate = (productId) => {
    setSelectedProductId(productId);  // Set the selected product ID
    setIsUpdateDialogOpen(true);  // Open the update dialog
  };

  const closeUpdateDialog = () => {
    setIsUpdateDialogOpen(false);  // Close the update dialog
  };

  const handleViewDetails = async (productId) => {
    if (!productId) {
      console.error("No product ID provided");
      return;
    }

    setLoading(true);
    try {
      //console.log("Fetching details for product ID:", productId);
      const productDetails = await fetchProductById(productId);
      
      if (!productDetails) {
        throw new Error("Failed to fetch product details");
      }

     // console.log("Product details fetched:", productDetails);
      setSelectedProductDetails(productDetails);
      setIsDetailsDialogOpen(true);
    } catch (error) {
      console.error("Error in handleViewDetails:", error);
      toast.error("Failed to load product details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedProductDetails(null);
  };

  return (
    <div className="product-container">
      <section className="product-section">
        <div className="product-header">
          <div className="product-header-content">
            <div className="product-header-left">
              <h2 className="product-title">
                <FaBox /> Products
              </h2>
              <div className="product-search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <button className="product-create-btn" onClick={() => navigate("/dashboard/createProduct")}>
              <FaPlus />
              Create New
            </button>
          </div>
        </div>
      
        <div className="product-table-container">
          {(loading || controllerLoading) && (
            <div className="spinner-overlay">
              <Spinner />
            </div>
          )}
          <table className="product-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>HSN/SAC</th>
                <th>Unit Price</th>
                <th>Tax (%)</th>
                <th>Quantity</th>
                <th>Current Stock</th>
                <th>Product Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product, index) => (
                  <tr 
                    key={index} 
                    onClick={() => handleViewDetails(product.product_id)} 
                    style={{ cursor: 'pointer' }}
                    className="product-row"
                  >
                    <td>{product.product_name}</td>
                    <td>{product.sku}</td>
                    <td>{product.hsn_sac}</td>
                    <td>₹{parseFloat(product.unit_price).toFixed(2)}</td>
                    <td>{parseFloat(product.tax).toFixed(2)}%</td>
                    <td>{product.quantity || 0}</td>
                    <td>{product.current_stock || 0}</td>
                    <td>{product.product_type}</td>
                    <td>
                      <span className="action-buttons">
                        <span 
                          className="product-delete-btn" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleDelete(product.product_id); 
                          }}
                        >
                          <FaTrash />
                        </span>
                        <span 
                          className="product-update-btn" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleUpdate(product.product_id); 
                          }}
                        >
                          <FaEdit />
                        </span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">No products available</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination UI */}
          <div className="simple-pagination">
            <div className="page-info">
              Showing {filteredProducts.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} entries
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
                  if (value > 0 && value <= totalPages) {
                    handlePageChange(value);
                  }
                }}
                min="1"
                max={totalPages}
              />
              <span className="page-info">of {totalPages}</span>
              <button 
                className="control-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Conditionally render the update dialog */}
      {isUpdateDialogOpen && selectedProductId && (
        <UpdateProductPage
          product={filteredProducts.find((prod) => prod.product_id === selectedProductId)}
          onClose={closeUpdateDialog}
          setProducts={setProducts}
        />
      )}

      {/* Conditionally render the product details dialog */}
      {isDetailsDialogOpen && selectedProductDetails && (
        <ProductDetailsDialog
          product={selectedProductDetails}
          onClose={closeDetailsDialog}
        />
      )}
    </div>
  );
}
