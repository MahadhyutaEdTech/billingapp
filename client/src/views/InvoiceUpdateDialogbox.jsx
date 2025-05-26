import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosConfig";
import "../css/InvoiceUpdateDialogbox.css"; // Importing CSS file for styling

const InvoiceUpdateDialogbox = ({ invoice, onClose, setInvoices }) => {
  const [updatedInvoice, setUpdatedInvoice] = useState({ ...invoice });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedInvoice((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const changes = Object.keys(updatedInvoice).reduce((acc, key) => {
        if (updatedInvoice[key] !== invoice[key]) {
          acc[key] = updatedInvoice[key];
        }
        return acc;
      }, {});

      changes.invoice_id = updatedInvoice.invoice_id;

      if (Object.keys(changes).length === 0) {
        toast.info("No changes detected!");
        return;
      }

      const response = await axiosInstance.put(
        `/invoice/update?invoice_id=${updatedInvoice.invoice_id}`,
        changes
      );

      if (response.data.message === "Invoice Data updated successfully") {
        toast.success("Invoice updated successfully!");
        setInvoices((prevInvoices) =>
          prevInvoices.map((inv) =>
            inv.invoice_id === updatedInvoice.invoice_id ? { ...inv, ...changes } : inv
          )
        );
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update invoice");
      console.error("Update error:", error);
    }
  };

  return (
    <div className="update-invoice-modal"> {/* Dark overlay */}
      <div className="update-invoice-wrapper"> {/* Modal container */}
        <button className="update-invoice-close" onClick={onClose}>&times;</button>
        <div className="update-invoice-title">Update Invoice</div>
        <div className="update-invoice-form">
          <label>Customer Name</label>
          <input type="text" name="first_name" value={updatedInvoice.first_name} onChange={handleChange} className="update-invoice-input" />
          <input type="text" name="last_name" value={updatedInvoice.last_name} onChange={handleChange} className="update-invoice-input"/>

          <label>Total Amount</label>
          <input type="number" name="total_amount" value={updatedInvoice.total_amount || ""} onChange={handleChange} className="update-invoice-input" />
          <label>Tax Amount</label>
          <input type="number" name="tax_amount" value={updatedInvoice.tax_amount || ""} onChange={handleChange} className="update-invoice-input" />
          <label>Status</label>
          <select name="status" value={updatedInvoice.status || ""} onChange={handleChange} className="update-invoice-input">
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Pending">Pending</option>
          </select>
          <div className="update-invoice-btn-group">
            <button className="update-invoice-btn-save" onClick={handleUpdate}>Update</button>
            <button className="update-invoice-btn-cancel" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceUpdateDialogbox;
