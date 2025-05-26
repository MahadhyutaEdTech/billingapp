import React, { useState, useEffect } from "react";
import "../css/UpdatePurchasePage.css";
import Spinner from "../components/Spinner";

export default function UpdatePurchasePage({ purchase, onClose, setPurchases }) {
  const [formData, setFormData] = useState({
    expenses_number: "",
    supplier_name: "",
    purchase_date: "",
    due_date: "",
    total_amount: "",
    payment_status: "",
    items_count: "",
    notes: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Populate form data when purchase changes
  useEffect(() => {
    if (purchase) {
      setFormData({
        expenses_number: purchase.expenses_number || "",
        supplier_name: purchase.supplier_name || "",
        purchase_date: purchase.purchase_date || "",
        due_date: purchase.due_date || "",
        total_amount: purchase.total_amount || "",
        payment_status: purchase.payment_status || "",
        items_count: purchase.items_count || "",
        notes: purchase.notes || ""
      });
    }
  }, [purchase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, this would be an API call
      // Here we're simulating an API update with a timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate successful update
      const updatedPurchase = {
        ...purchase,
        ...formData,
        // Ensure numeric values are stored as numbers
        total_amount: parseFloat(formData.total_amount),
        items_count: parseInt(formData.items_count, 10)
      };
      
      // Update the purchases list in the parent component
      setPurchases(prevPurchases => 
        prevPurchases.map(item => 
          item.purchase_id === purchase.purchase_id ? updatedPurchase : item
        )
      );
      
      console.log("Purchase updated successfully:", updatedPurchase);
      onClose(); // Close the dialog after successful update
    } catch (error) {
      console.error("Failed to update purchase:", error);
      setError("Failed to update purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const paymentStatusOptions = ["Paid", "Pending", "Partially Paid", "Cancelled"];

  return (
    <div className="update-purchase-overlay">
      <div className="update-purchase-modal">
        <div className="update-purchase-header">
          <h2>Update Purchase</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {loading && (
          <div className="modal-spinner">
            <Spinner />
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="update-purchase-form">
          <div className="form-group">
            <label htmlFor="expenses_number">Invoice Number</label>
            <input
              type="text"
              id="expenses_number"
              name="expenses_number"
              value={formData.expenses_number}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="supplier_name">Supplier Name</label>
            <input
              type="text"
              id="supplier_name"
              name="supplier_name"
              value={formData.supplier_name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purchase_date">Purchase Date</label>
              <input
                type="date"
                id="purchase_date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="due_date">Due Date</label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="total_amount">Total Amount (₹)</label>
              <input
                type="number"
                id="total_amount"
                name="total_amount"
                step="0.01"
                min="0"
                value={formData.total_amount}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="items_count">Items Count</label>
              <input
                type="number"
                id="items_count"
                name="items_count"
                min="1"
                step="1"
                value={formData.items_count}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="payment_status">Payment Status</label>
            <select
              id="payment_status"
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              required
            >
              <option value="">Select status</option>
              {paymentStatusOptions.map((status, index) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="update-purchase-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Updating..." : "Update Purchase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}