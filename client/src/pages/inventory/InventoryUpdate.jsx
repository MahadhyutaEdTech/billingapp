import React from 'react';
import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { API_BASE } from '../../config/config';
import "../../css/modules/inventory/InventoryUpdate.css";

const InventoryUpdate = ({ product, onClose, onUpdate }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedData = Object.fromEntries(formData);
    
    const token = localStorage.getItem("authToken");
    
    // Debug logging to check product data
    //console.log("Product data:", product);
    //console.log("Product ID:", product?._id || product?.product_id);
    
    // Check if product ID exists
    const productId = product?._id || product?.product_id;
    if (!productId) {
      alert("Error: Product ID not found. Cannot update product.");
      console.error("Product object:", product);
      return;
    }
    
    try {
      const response = await axiosInstance.put(
        `${API_BASE}/products/update?product_id=${productId}`, // ✅ Fixed: use productId
        updatedData, // ✅ Fixed: use form data
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        }
      );

     // console.log("Update successful:", response.data);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Update failed: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
  };

  const handleReadOnlyClick = (fieldName) => {
    alert(`${fieldName} cannot be modified in this form.`);
  };

  // Check if product data is available
  if (!product) {
    return (
      <div className="update-dialog-overlay">
        <div className="update-dialog">
          <div className='update-title'><h3>Error</h3></div>
          <p>Product data not available.</p>
          <div className="dialog-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`update-dialog-overlay ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="update-dialog">
        <div className='update-title'><h3>Update Inventory</h3></div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name:</label>
            <input
              name="product_name"
              defaultValue={product.product_name || ''}
              readOnly
              onClick={() => handleReadOnlyClick('Product Name')}
            />
          </div>
          
          <div className="form-group">
            <label>SKU:</label>
            <input
              name="sku"
              defaultValue={product.sku || ''}
              readOnly
              onClick={() => handleReadOnlyClick('SKU')}
            />
          </div>
          
          <div className="form-group">
            <label>Stock:</label>
            <input
              type="number"
              name="quantity"
              defaultValue={product.quantity || product.current_stock || ''}
              required
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label>Unit Price:</label>
            <input
              type="number"
              name="unit_price"
              defaultValue={product.unit_price || ''}
              readOnly
              onClick={() => handleReadOnlyClick('Unit Price')}
            />
          </div>
          
          <div className="form-group">
            <label>Cost Price:</label>
            <input
              type="number"
              name="cost_price"
              defaultValue={product.cost_price || ''}
              readOnly
              onClick={() => handleReadOnlyClick('Cost Price')}
            />
          </div>
          
          <div className="dialog-buttons">
            <button type="submit" className="save-btn">Save</button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryUpdate;