import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosConfig";
import "../css/CustomerUpdateDialog.css"; // Importing CSS file for styling

const CustomerUpdateDialog = ({ customer, onClose, setCustomers }) => {
  const [updatedCustomer, setUpdatedCustomer] = useState(() => {
    // Parse GST details if it exists
    let gstDetails = {};
    if (customer.cust_gst_details) {
      try {
        gstDetails = JSON.parse(customer.cust_gst_details);
      } catch (e) {
        console.warn("Error parsing GST details");
      }
    }
    return {
      ...customer,
      gst_state: gstDetails.state_code || "",
      gst_no: gstDetails.gst_no || "",
      gst_address: gstDetails.address || ""
    };
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      // Construct GST details object
      const gstDetails = {
        state_code: updatedCustomer.gst_state,
        gst_no: updatedCustomer.gst_no,
        address: updatedCustomer.gst_address
      };

      const changes = {
        customer_id: updatedCustomer.customer_id,
        first_name: updatedCustomer.first_name,
        last_name: updatedCustomer.last_name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        cust_gst_details: JSON.stringify(gstDetails)
      };

      const response = await axiosInstance.post(
        `/customer/updateCustomerData?customer_id=${updatedCustomer.customer_id}`,
        changes
      );

      if (response.data.message === "Customer Data updated successfully") {
        toast.success("Customer updated successfully!");
        setCustomers((prevCustomers) =>
          prevCustomers.map((cust) =>
            cust.customer_id === updatedCustomer.customer_id
              ? { ...cust, ...changes }
              : cust
          )
        );
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update customer");
      console.error("Update error:", error);
    }
  };

  return (
    <div className="update-customer-modal">
      <div className="update-customer-wrapper">
        <button className="update-customer-close" onClick={onClose}>×</button>
        <h2 className="update-customer-title">Update Customer</h2>
        
        <form className="update-customer-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="input-grid">
              <div className="input-group">
                <label>First Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="first_name"
                  value={updatedCustomer.first_name || ""}
                  onChange={handleChange}
                  className="update-customer-input"
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Last Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="last_name"
                  value={updatedCustomer.last_name || ""}
                  onChange={handleChange}
                  className="update-customer-input"
                  required
                />
              </div>
            </div>

            <div className="input-grid">
              <div className="input-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={updatedCustomer.email || ""}
                  onChange={handleChange}
                  className="update-customer-input"
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Phone <span className="required">*</span></label>
                <input
                  type="text"
                  name="phone"
                  value={updatedCustomer.phone || ""}
                  onChange={handleChange}
                  className="update-customer-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section gst-details">
            <h3 className="section-title">GST Details</h3>
            <div className="input-grid">
              <div className="input-group">
                <label>State Code</label>
                <input
                  type="text"
                  name="gst_state"
                  value={updatedCustomer.gst_state || ""}
                  onChange={handleChange}
                  className="update-customer-input"
                  maxLength="2"
                  style={{ textTransform: 'uppercase' }}
                  placeholder="e.g. MH"
                />
              </div>
              
              <div className="input-group">
                <label>GST Number</label>
                <input
                  type="text"
                  name="gst_no"
                  value={updatedCustomer.gst_no || ""}
                  onChange={handleChange}
                  className="update-customer-input"
                  style={{ textTransform: 'uppercase' }}
                  placeholder="e.g. 27AAPFU0939F1ZV"
                />
              </div>
            </div>

            <div className="input-group full-width">
              <label>GST Address</label>
              <textarea
                name="gst_address"
                value={updatedCustomer.gst_address || ""}
                onChange={handleChange}
                className="update-customer-input"
                rows="3"
                placeholder="Enter complete GST registered address"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-save" onClick={handleUpdate}>
              Update Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerUpdateDialog;