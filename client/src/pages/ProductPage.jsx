import { useProductController, deleteProduct } from "../controllers/productPageController";
import { FaSearch, FaTrash, FaEdit } from "react-icons/fa";
import Spinner from "../components/Spinner";
import "../css/ProductPage.css";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import UpdateProductPage from "./UpdateProductPage";  // Import the UpdateProductPage component

export default function ProductPage() {
  const { search, setSearch, filteredProducts, setProducts, fetchProducts, loading: controllerLoading } = useProductController();
  const navigate = useNavigate();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);  // State for dialog visibility
  const [selectedProductId, setSelectedProductId] = useState(null);  // State to hold the selected product ID
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
      console.log("Attempting to delete product with ID:", productId);
      
      // Make the delete API call
      const deletedProduct = await deleteProduct(productId); // Call the API to delete the product
      if (!deletedProduct) return; // Stop if deletion fails
      
      console.log("Product deleted successfully:", deletedProduct);
      
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
  };

  const handleUpdate = (productId) => {
    setSelectedProductId(productId);  // Set the selected product ID
    setIsDialogOpen(true);  // Open the update dialog
  };

  const closeDialog = () => {
    setIsDialogOpen(false);  // Close the dialog when canceled
  };

  return (
    <div className="product-container">
      <div className="Product-fixed-header">
        <div className="product-title">
          <h2>Products</h2>
        </div>
        <div className="product-controls">
          <div className="product-search-bar">
            <input
              type="text"
              placeholder="Search Product"
              value={search}
              onChange={handleSearchChange}
            />
            <span className="product-search-icon"><FaSearch /></span>
          </div>
          <button className="product-create-btn" onClick={() => navigate("/dashboard/createProduct")}>Create New</button>
        </div>
      </div>
      
      <div className="table-container">
        {(loading || controllerLoading) && (
          <div className="spinner-overlay">
            <Spinner />
          </div>
        )}
        <table className="product-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Description</th>
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
                <tr key={index}>
                  <td>{product.product_name}</td>
                  <td>{product.description}</td>
                  <td>{product.sku}</td>
                  <td>{product.hsn_sac}</td>
                  <td>₹{parseFloat(product.unit_price).toFixed(2)}</td>
                  <td>{parseFloat(product.tax).toFixed(2)}%</td>
                  <td>{product.quantity || 0}</td>
                  <td>{product.current_stock || 0}</td>
                  <td>{product.product_type}</td>
                  <td>
                    <span className="product-delete-btn" onClick={() => handleDelete(product.product_id)}>
                      <FaTrash />
                    </span>
                    <span className="product-update-btn" onClick={() => handleUpdate(product.product_id)}>
                      <FaEdit />
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">No products available</td>
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

      {/* Conditionally render the update dialog */}
      {isDialogOpen && selectedProductId && (
        <UpdateProductPage
          product={filteredProducts.find((prod) => prod.product_id === selectedProductId)}
          onClose={closeDialog}
          setProducts={setProducts}
        />
      )}
    </div>
  );
}
