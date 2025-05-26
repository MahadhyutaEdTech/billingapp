import React from 'react';
import axiosInstance from '../utils/axiosConfig';
import { API_BASE } from '../config/config';
import '../css/InventoryUpdate.css';

const InventoryUpdate = ({ product, onClose, onUpdate }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedData = Object.fromEntries(formData);
    
    const token = localStorage.getItem("authToken");
    try {
      await axiosInstance.put(
        `${API_BASE}/products/update/${product._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Update failed: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  const handleReadOnlyClick = (fieldName) => {
    alert(`${fieldName} cannot be modified in this form.`);
  };

  return (
    <div className="update-dialog-overlay">
      <div className="update-dialog">
        <div className='update-title'><h3>Update Inventory</h3></div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name:</label>
            <input
              name="product_name"
              defaultValue={product.product_name}
              readOnly
              onClick={() => handleReadOnlyClick('Product Name')}
            />
          </div>
          <div className="form-group">
            <label>SKU:</label>
            <input
              name="sku"
              defaultValue={product.sku}
              readOnly
              onClick={() => handleReadOnlyClick('SKU')}
            />
          </div>
          <div className="form-group">
            <label>Stock:</label>
            <input
              type="number"
              name="quantity"
              defaultValue={product.quantity}
              required
            />
          </div>
          <div className="form-group">
            <label>Unit Price:</label>
            <input
              type="number"
              name="unit_price"
              defaultValue={product.unit_price}
              readOnly
              onClick={() => handleReadOnlyClick('Unit Price')}
            />
          </div>
          <div className="form-group">
            <label>Cost Price:</label>
            <input
              type="number"
              name="cost_price"
              defaultValue={product.cost_price}
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
