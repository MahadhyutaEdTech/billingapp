import React, { useState, useEffect } from "react";
import axiosInstance from '../../utils/axiosConfig';
import "@/css/modules/purchase/CreatePurchasePage.css";
import { useNavigate } from "react-router-dom";

const CreatePurchasePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    expenses_number: "",
    supplier_name: "",
    purchase_date: new Date().toISOString().split('T')[0],
    due_date: "",
    total_amount: "",
    payment_status: "Unpaid",
    items_count: "",
    notes: "",
    items: [{ item_name: "", quantity: "", price: "", total: "" }],
    created_at: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationErrors({ ...validationErrors, [e.target.name]: "" });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto-calculate total if quantity and price are filled
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const price = field === 'price' ? value : newItems[index].price;
      
      if (quantity && price) {
        newItems[index].total = (parseFloat(quantity) * parseFloat(price)).toFixed(2);
      }
    }
    
    setFormData({ ...formData, items: newItems });
    setValidationErrors({ ...validationErrors, items: [] });
    
    // Calculate total amount
    calculateTotalAmount(newItems);
  };

  const calculateTotalAmount = (items) => {
    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.total) || 0);
    }, 0);
    
    setFormData(prevData => ({
      ...prevData,
      total_amount: total.toFixed(2),
      items_count: items.length
    }));
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_name: "", quantity: "", price: "", total: "" }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    calculateTotalAmount(newItems);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.expenses_number.trim()) errors.expenses_number = "Expenses number is required.";
    if (!formData.supplier_name.trim()) errors.supplier_name = "Supplier name is required.";
    if (!formData.purchase_date) errors.purchase_date = "Purchase date is required.";
    if (!formData.due_date) errors.due_date = "Due date is required.";
    if (!formData.total_amount) errors.total_amount = "Total amount is required.";
    if (!formData.payment_status) errors.payment_status = "Payment status is required.";

    // Items validation
    const itemErrors = formData.items.map((item) => {
      const errors = {};
      if (!item.item_name) errors.item_name = "Item name is required";
      if (!item.quantity) errors.quantity = "Quantity is required";
      if (!item.price) errors.price = "Price is required";
      return errors;
    });

    if (itemErrors.some((error) => Object.keys(error).length > 0)) {
      errors.items = itemErrors;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    //console.log("Submitting payment_status:", formData.payment_status);
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token not found");


      const userId = localStorage.getItem("userId"); // Add user_id from storage

      const dataToSend = {
        purchase_id: Date.now(),
        expenses_number: formData.expenses_number,
        supplier_name: formData.supplier_name,
        purchase_date: formData.purchase_date,
        due_date: formData.due_date,
        total_amount: parseFloat(formData.total_amount),
        payment_status: formData.payment_status,
        items_count: parseInt(formData.items_count),
        notes: formData.notes || "",
        items: formData.items.map(item => ({
          item_name: item.item_name,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          total: parseFloat(item.total)
        }))
      };

      const response = await axiosInstance.post(
        `/purchase/purchases?user_id=${userId}`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        //console.log("✅ Purchase Added Successfully:", response.data);
        navigate("/dashboard/purchase-page");
        alert("Purchase added successfully!");
      }

    } catch (err) {
      console.error("🚫 Detailed submission error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      setError(err.response?.data?.message || "Failed to add purchase. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`purchase-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <h2 className="main-form-title">
        Add New Purchase
      </h2>
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <p className="error-help">Please try again or contact support if the problem persists.</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="purchase-form">
        <h3 className="section-heading">Purchase Details</h3>
        <hr className="section-divider" />
        <div className="form-grid">
          {/* Left Column - Purchase Details */}
          <div className="form-column">
            <div className="section-group">
              <div className="input-grid">
                <div className="input-field">
                  <label>Expenses Number*</label>
                  <input 
                    type="text" 
                    name="expenses_number" 
                    value={formData.expenses_number} 
                    onChange={handleChange} 
                    placeholder="Enter expenses number"
                    required 
                  />
                  {validationErrors.expenses_number && <p className="error">{validationErrors.expenses_number}</p>}
                </div>

                <div className="input-field">
                  <label>Supplier Name*</label>
                  <input 
                    type="text" 
                    name="supplier_name" 
                    value={formData.supplier_name} 
                    onChange={handleChange} 
                    placeholder="Enter supplier name"
                    required 
                  />
                  {validationErrors.supplier_name && <p className="error">{validationErrors.supplier_name}</p>}
                </div>

                <div className="input-field">
                  <label>Purchase Date*</label>
                  <input 
                    type="date" 
                    name="purchase_date" 
                    value={formData.purchase_date} 
                    onChange={handleChange} 
                    required 
                  />
                  {validationErrors.purchase_date && <p className="error">{validationErrors.purchase_date}</p>}
                </div>

                <div className="input-field">
                  <label>Due Date*</label>
                  <input 
                    type="date" 
                    name="due_date" 
                    value={formData.due_date} 
                    onChange={handleChange}
                    required 
                  />
                  {validationErrors.due_date && <p className="error">{validationErrors.due_date}</p>}
                </div>

                <div className="input-field">
                  <label>Total Amount*</label>
                  <input 
                    type="number" 
                    name="total_amount" 
                    value={formData.total_amount} 
                    onChange={handleChange} 
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                    readOnly 
                  />
                  {validationErrors.total_amount && <p className="error">{validationErrors.total_amount}</p>}
                </div>

                <div className="input-field">
                  <label>Payment Status*</label>
                  <select name="payment_status" value={formData.payment_status} onChange={handleChange} required>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                  {validationErrors.payment_status && <p className="error">{validationErrors.payment_status}</p>}
                </div>

                <div className="input-field full-width">
                  <label>Notes</label>
                  <textarea 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleChange} 
                    placeholder="Enter additional notes (optional)"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Items */}
          <div className="form-column">
            <div className="section-group">
              <h3>Purchase Items</h3>
              <div className="items-entries">
                {formData.items.map((item, index) => (
                  <div key={index} className="item-entry">
                    <div className="item-input-group">
                      <div className="item-field">
                        <label>Item Name*</label>
                        <input
                          type="text"
                          placeholder="Enter item name"
                          value={item.item_name}
                          onChange={(e) => handleItemChange(index, "item_name", e.target.value)}
                          required
                        />
                        {validationErrors.items?.[index]?.item_name && (
                          <p className="error">{validationErrors.items[index].item_name}</p>
                        )}
                      </div>
                      
                      <div className="item-row">
                        <div className="item-field">
                          <label>Quantity*</label>
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            min="1"
                            step="1"
                            required
                          />
                          {validationErrors.items?.[index]?.quantity && (
                            <p className="error">{validationErrors.items[index].quantity}</p>
                          )}
                        </div>
                        
                        <div className="item-field">
                          <label>Price*</label>
                          <input
                            type="number"
                            placeholder="Price per unit"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, "price", e.target.value)}
                            min="0.01"
                            step="0.01"
                            required
                          />
                          {validationErrors.items?.[index]?.price && (
                            <p className="error">{validationErrors.items[index].price}</p>
                          )}
                        </div>
                        
                        <div className="item-field">
                          <label>Total</label>
                          <input
                            type="text"
                            placeholder="Total"
                            value={item.total}
                            readOnly
                          />
                        </div>
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
                  </div>
                ))}
                <button type="button" className="add-item-btn" onClick={addItem}>
                  + Add Another Item
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Adding..." : "Add Purchase"}
          </button>
          <button
            className="btn-back"
            type="button"
            onClick={() => navigate("/dashboard/purchase-page")}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchasePage;