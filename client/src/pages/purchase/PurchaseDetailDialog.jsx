import React, { useState, useEffect } from 'react';
import { FaTimes, FaEdit, FaTrash, FaFileInvoice, FaCalendarAlt, FaUser, FaMoneyBillWave, FaInfoCircle } from 'react-icons/fa';
import "@/css/modules/purchase/PurchaseDetailDialog.css";

const PurchaseDetailDialog = ({ purchase, onClose, onEdit, onDelete }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Dark mode detection
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark-mode'));
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!purchase) return null;

  return (
    <div className={`dialog-overlay ${isDarkMode ? 'dark-mode' : ''}`} onClick={onClose}>
      <div className="dialog-container">
        <div className="dialog-header">
          <h3>Purchase Details</h3>
          <div className="button-group">
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="dialog-body">
          <div className="grid-container">
            <div className="detail-box">
              <div className="label">Expenses Number</div>
              <div className="value">{purchase.expenses_number || 'N/A'}</div>
            </div>
            <div className="detail-box">
              <div className="label">Purchase Date</div>
              <div className="value">{formatDate(purchase.purchase_date) || 'N/A'}</div>
            </div>
            <div className="detail-box">
              <div className="label">Due Date</div>
              <div className="value">{formatDate(purchase.due_date) || 'N/A'}</div>
            </div>
            <div className="detail-box">
              <div className="label">Status</div>
              <div className="value">{purchase.payment_status || 'N/A'}</div>
            </div>
            <div className="detail-box">
              <div className="label">Total Amount</div>
              <div className="value">₹{Number(purchase.total_amount).toFixed(2) || '0.00'}</div>
            </div>
            <div className="detail-box full-width">
              <div className="label">Notes</div>
              <div className="value">{purchase.notes || 'N/A'}</div>
            </div>
          </div>

          <div className="grid-container">
            <h4>Supplier Details</h4>
            <div className="detail-box">
              <div className="label">Name</div>
              <div className="value">{purchase.supplier_name || 'N/A'}</div>
            </div>
            <div className="detail-box">
              <div className="label">Email</div>
              <div className="value">{purchase.supplier_email || 'N/A'}</div>
            </div>
            <div className="detail-box">
              <div className="label">Phone</div>
              <div className="value">{purchase.supplier_phone || 'N/A'}</div>
            </div>
            <div className="detail-box full-width">
              <div className="label">Address</div>
              <div className="value">{purchase.supplier_address || 'N/A'}</div>
            </div>
          </div>

          <div className="grid-container">
            <h4>Purchase Items</h4>
            {purchase.items && purchase.items.length > 0 ? (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.item_name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{Number(item.unit_price).toFixed(2)}</td>
                      <td>₹{Number(item.quantity * item.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No items found for this purchase.</p>
            )}
          </div>
        </div>

        <div className="dialog-footer">
          <button className="edit-button" onClick={() => onEdit(purchase.purchase_id)}>
            <FaEdit /> Edit Purchase
          </button>
          <button className="delete-button" onClick={() => onDelete(purchase.purchase_id)}>
            <FaTrash /> Delete Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailDialog; 