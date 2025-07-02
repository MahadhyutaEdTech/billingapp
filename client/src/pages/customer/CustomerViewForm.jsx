import React from "react";
import "../../css/modules/customer/CustomerViewForm.css";


const CustomerViewForm = ({ customer, onClose }) => {
  if (!customer) return null;

  const handlePrint = () => {
    const printContent = document.querySelector('.view-content');
    const originalContent = document.body.innerHTML;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Details - ${customer.first_name} ${customer.last_name}</title>
          <style>
            .view-content { padding: 20px; }
            .view-section { margin-bottom: 20px; }
            .view-details-grid { display: grid; gap: 10px; }
            .detail-item { margin-bottom: 10px; }
            strong { margin-right: 8px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  // Parse GST details safely
  const getGstDetails = () => {
    try {
      if (typeof customer.cust_gst_details === 'string') {
        return JSON.parse(customer.cust_gst_details);
      }
      // If it's already an object, return as is
      if (typeof customer.cust_gst_details === 'object') {
        return customer.cust_gst_details;
      }
      return {};
    } catch (error) {
      console.error('Error parsing GST details:', error);
      return {};
    }
  };

  const gstDetails = getGstDetails();
  
  // Format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay">
      <div className="view-container">
        <div className="view-header">
          <h2 className="view-title">Customer Details</h2>
          <div className="button-group">
           
            <button className="close-button" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="view-content">
          <div className="view-section">
            <h3>Basic Information</h3>
            <div className="view-details-grid">
              <div className="detail-item">
                <strong>Name:</strong>
                <span>{customer.first_name} {customer.last_name}</span>
              </div>
              <div className="detail-item">
                <strong>Email:</strong>
                <span>{customer.email || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <strong>Phone:</strong>
                <span>{customer.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          
          <div className="view-section">
            <h3>GST Information</h3>
            <div className="view-details-grid">
              <div className="detail-item">
                <strong>GST Number:</strong>
                <span>{gstDetails.gst_no || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <strong>State Code:</strong>
                <span>{gstDetails.state_code || 'N/A'}</span>
              </div>
              <div className="detail-item full-width">
                <strong>GST Address:</strong>
                <span>{gstDetails.address || 'N/A'}</span>
              </div>
            </div>
          </div>

       

          <div className="view-section">
            <h3>Timestamps</h3>
            <div className="view-details-grid">
              <div className="detail-item">
                <strong>Created At:</strong>
                <span>{formatDate(customer.created_at)}</span>
              </div>
              <div className="detail-item">
                <strong>Last Updated:</strong>
                <span>{formatDate(customer.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerViewForm;
