import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "@/css/modules/purchase/UpdatePurchasePage.css";
import Spinner from "../../components/Spinner";

export default function UpdatePurchasePage({ purchase, onClose, setPurchases }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    expenses_number: "",
    supplier_name: "",
    purchase_date: "",
    due_date: "",
    total_amount: "",
    payment_status: "",
    items_count: "",
    notes: "",
    items: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        notes: purchase.notes || "",
        items: purchase.items || []
      });
    }
  }, [purchase]);

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

    setIsDarkMode(document.documentElement.classList.contains('dark-mode'));

    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const price = field === 'price' ? value : newItems[index].price;
      
      if (quantity && price) {
        newItems[index].total = (parseFloat(quantity) * parseFloat(price)).toFixed(2);
      }
    }
    
    setFormData(prevState => ({
      ...prevState,
      items: newItems
    }));
    
    calculateTotalAmount(newItems);
  };

  const calculateTotalAmount = (items) => {
    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.total) || 0);
    }, 0);
    
    setFormData(prevState => ({
      ...prevState,
      total_amount: total.toFixed(2),
      items_count: items.length
    }));
  };

  const addItem = () => {
    setFormData(prevState => ({
      ...prevState,
      items: [...prevState.items, { item_name: "", quantity: "", price: "", total: "" }]
    }));
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prevState => ({
      ...prevState,
      items: newItems
    }));
    calculateTotalAmount(newItems);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("authToken");
      
      if (!token) throw new Error("Authentication token not found");

      const dataToSend = {
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        items_count: parseInt(formData.items_count),
        items: formData.items.map(item => ({
          item_name: item.item_name,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          total: parseFloat(item.total)
        }))
      };

      const response = await axiosInstance.put(
        `/purchase/purchases/${purchase.purchase_id}?user_id=${userId}`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        //console.log("✅ Purchase Updated Successfully:", response.data);
        setPurchases(prev => prev.map(p => 
          p.purchase_id === purchase.purchase_id ? response.data : p
        ));
        onClose();
      }
    } catch (err) {
      console.error("🚫 Update error:", err);
      setError(err.response?.data?.message || "Failed to update purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`update-purchase-dialog ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="dialog-header">
        <h2>Update Purchase</h2>
        <button className="close-button" onClick={handleClose}>&times;</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="update-purchase-form">
        <div className="form-section">
          <h3>Purchase Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Expenses Number*</label>
              <input
                type="text"
                name="expenses_number"
                value={formData.expenses_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Supplier Name*</label>
              <input
                type="text"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Purchase Date*</label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Due Date*</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Payment Status*</label>
              <select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleChange}
                required
              >
                <option value="">Select status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div className="form-group">
              <label>Total Amount (₹)*</label>
              <input
                type="number"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Purchase Items</h3>
          <div className="items-container">
            {formData.items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="form-group">
                  <label>Item Name*</label>
                  <input
                    type="text"
                    value={item.item_name}
                    onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Quantity*</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price (₹)*</label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Total (₹)</label>
                  <input
                    type="number"
                    value={item.total}
                    readOnly
                  />
                </div>

                {index > 0 && (
                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => removeItem(index)}
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-item-btn" onClick={addItem}>
              + Add Another Item
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group full-width">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Enter any additional notes..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Purchase"}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}