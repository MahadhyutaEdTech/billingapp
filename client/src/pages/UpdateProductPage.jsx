import React, { useState } from "react";
import axiosInstance from '../utils/axiosConfig';
import "../css/UpdateProductPage.css";
import { API_BASE } from "../config/config";

export default function UpdateProductPage({ product, onClose, setProducts }) {
  const [updatedProduct, setUpdatedProduct] = useState({ ...product });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Add validation for current_stock
    if (name === 'current_stock') {
      const numValue = parseInt(value);
      const maxQuantity = parseInt(updatedProduct.quantity);
      
      if (numValue > maxQuantity) {
        alert('Current stock cannot exceed total quantity!');
        return;
      }
    }
    
    setUpdatedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("❌ User not authenticated. Please log in.");
      return;
    }

    try {
      const changes = {};
      Object.keys(updatedProduct).forEach((key) => {
        if (updatedProduct[key] !== product[key]) {
          changes[key] = updatedProduct[key];
        }
      });

      changes.product_id = updatedProduct.product_id;

      if (Object.keys(changes).length === 0) {
        alert("⚠️ No changes detected!");
        return;
      }

      const response = await axiosInstance.put(
        `${API_BASE}/products/update?product_id=${updatedProduct.product_id}`,
        changes,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Uses dynamic token
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.message === "Product Data updated successfully") {
        alert("✅ Product updated successfully!");
        setProducts((prevProducts) =>
          prevProducts.map((prod) =>
            prod.product_id === updatedProduct.product_id ? { ...prod, ...changes } : prod
          )
        );
        onClose();
      } else {
        alert("⚠️ Update failed. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error updating product:", error);
      alert("❌ Failed to update product. Please try again.");
    }
  };
  return (
    <div className="update-product-modal"> {/* Dark overlay */}
      <div className="update-product-wrapper"> {/* Modal container */}
        <button className="update-product-close" onClick={onClose}>&times;</button>
        <div className="update-product-title">Update Product</div>
        <div className="update-product-form">
          <label>Product Name</label>
          <input type="text" name="product_name" value={updatedProduct.product_name || ""} onChange={handleChange} className="update-product-input" />
          <label>Description</label>
          <input type="text" name="description" value={updatedProduct.description || ""} onChange={handleChange} className="update-product-input" />
          <label>SKU</label>
          <input type="text" name="sku" value={updatedProduct.sku || ""} onChange={handleChange} className="update-product-input" />
          <label>HSN/SAC</label>
          <input type="text" name="hsn_sac" value={updatedProduct.hsn_sac || ""} onChange={handleChange} className="update-product-input" />
          <label>Unit Price</label>
          <input type="number" name="unit_price" value={updatedProduct.unit_price || ""} onChange={handleChange} className="update-product-input" />
          <label>Cost Price</label>
          <input type="number" name="cost_price" value={updatedProduct.cost_price || ""} onChange={handleChange} className="update-product-input" />
          <label>Quantity</label>
          <input type="number" name="quantity" value={updatedProduct.quantity || ""} onChange={handleChange} className="update-product-input" />
          <label>Current Stock</label>
          <input 
            type="number" 
            name="current_stock" 
            value={updatedProduct.current_stock || ""} 
            onChange={handleChange} 
            max={updatedProduct.quantity}
            className="update-product-input" 
          />
          <label>Product Type</label>
          <input type="text" name="product_type" value={updatedProduct.product_type || ""} onChange={handleChange} className="update-product-input" />
          <div className="update-product-btn-group">
            <button className="update-product-btn-save" onClick={handleUpdate}>Update</button>
            <button className="update-product-btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
