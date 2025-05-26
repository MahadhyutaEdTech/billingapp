import React, { useState, useEffect } from "react";
import axiosInstance from '../utils/axiosConfig';
import "../css/UpdateOrganizationPage.css";
import { API_BASE } from "../config/config";
import qs from "qs";

export default function UpdateOrganizationPage({ organization, onClose, setOrganizations }) {
  const [updatedOrg, setUpdatedOrg] = useState(organization || {});
  const [gstEntries, setGstEntries] = useState([]);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    // Set default sample data if no organization data exists
    if (!organization || Object.keys(organization).length === 0) {
      setUpdatedOrg({
        org_id: Date.now(), // Generate a temporary org_id
        name: "ABC Corporation Pvt Ltd",
        type: "Private Limited Company",
        email: "info@abccorp.com",
        phone: "9876543210",
        address: "123, Business Park, Main Street",
        website: "www.abccorp.com",
        reg_number: "ABCDE1234F",
        bank_name: "State Bank of India",
        acc_name: "ABC Corporation Pvt Ltd",
        acc_num: "1234567890123",
        ifsc: "SBIN0123456",
        branch: "Main Branch, City Center",
        logo_image: "https://example.com/logo.png"
      });

      // Sample GST entries
      setGstEntries([
        {
          stateCode: "MH",
          gstNumber: "27ABCDE1234F1Z5",
          lastInvoiceNumber: 0,
          address: "Unit 1, Industrial Area, Mumbai - 400001, Maharashtra"
        },
        {
          stateCode: "KA",
          gstNumber: "29ABCDE1234F1Z1",
          lastInvoiceNumber: 0,
          address: "Plot No 45, Tech Park, Bangalore - 560001, Karnataka"
        }
      ]);
    } else {
      setUpdatedOrg(organization);
      if (organization?.gst_details) {
        const gstArray = Object.entries(organization.gst_details).map(([stateCode, details]) => ({
          stateCode,
          gstNumber: details.gst_number,
          lastInvoiceNumber: details.last_invoice_number,
          address: details.address || ''
        }));
        setGstEntries(gstArray);
      }
    }
  }, [organization]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedOrg((prev) => ({ ...prev, [name]: value }));
  };

  const handleGstChange = (index, field, value) => {
    const newGstEntries = [...gstEntries];
    newGstEntries[index][field] = value;
    setGstEntries(newGstEntries);
  };

  const addGstEntry = () => {
    setGstEntries([...gstEntries, { stateCode: '', gstNumber: '', lastInvoiceNumber: 0, address: '' }]);
  };

  const removeGstEntry = (index) => {
    setGstEntries(gstEntries.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    if (!updatedOrg.org_id) {
      alert("❌ Organization ID is required");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("❌ User not authenticated. Please log in.");
      return;
    }

    try {
      const formData = new FormData();
      
      Object.keys(updatedOrg).forEach((key) => {
        if (updatedOrg[key] !== organization[key] && key !== 'gst_details' && key !== 'logo_preview') {
          formData.append(key, updatedOrg[key]);
        }
      });

      const gst_details = {};
      gstEntries.forEach(entry => {
        if (entry.stateCode && entry.gstNumber) {
          gst_details[entry.stateCode.toUpperCase()] = {
            gst_number: entry.gstNumber,
            last_invoice_number: parseInt(entry.lastInvoiceNumber || 0),
            address: entry.address // Include address in GST details
          };
        }
      });
      formData.append('gst_details', JSON.stringify(gst_details));

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await axiosInstance({
        method: 'put',
        url: `${API_BASE}/organization/update`,
        params: { org_id: updatedOrg.org_id },
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.status === 200) {
        console.log("✅ Update successful:", response.data);
        alert("✅ Organization updated successfully!");
        setOrganizations((prevOrgs) =>
          prevOrgs.map((org) =>
            org.org_id === updatedOrg.org_id ? { ...org, ...updatedOrg } : org
          )
        );
        onClose();
      }
    } catch (error) {
      console.error("❌ Error updating organization:", error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`❌ Failed to update organization: ${errorMessage}`);
      
      if (error.response) {
        console.error('Error Response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
      }
    }
  };

  return (
    <div className="update-organization-modal">
      <div className="update-organization-wrapper">
        <button className="update-organization-close" onClick={onClose}>&times;</button>
        <div className="update-organization-title">Update Organization</div>
        <div className="update-organization-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Organization Logo</label>
              <input
                type="text"
                name="logo_image"
                value={updatedOrg.logo_image || ""}
                onChange={handleChange}
                placeholder="Enter logo image URL"
                className="logo-input"
              />
            </div>

            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={updatedOrg.name || ""} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Type</label>
              <input type="text" name="type" value={updatedOrg.type || ""} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={updatedOrg.email || ""} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={updatedOrg.phone || ""} onChange={handleChange} />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <input type="text" name="address" value={updatedOrg.address || ""} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input type="text" name="website" value={updatedOrg.website || ""} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Registration Number</label>
              <input type="text" name="registrationNumber" value={updatedOrg.reg_number || ""} onChange={handleChange} />
            </div>
          </div>

          <div className="gst-section">
            <h3>GST Details</h3>
            <div className="gst-entries">
              {gstEntries.map((entry, index) => (
                <div key={index} className="gst-entry-card">
                  <div className="gst-entry-inputs">
                    <div className="form-group">
                      <label>State Code</label>
                      <input
                        type="text"
                        placeholder="e.g., KA, MH"
                        value={entry.stateCode}
                        onChange={(e) => handleGstChange(index, 'stateCode', e.target.value.toUpperCase())}
                        maxLength="2"
                      />
                    </div>
                    <div className="form-group">
                      <label>GST Number</label>
                      <input
                        type="text"
                        placeholder="Enter GST Number"
                        value={entry.gstNumber}
                        onChange={(e) => handleGstChange(index, 'gstNumber', e.target.value)}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>GST Address</label>
                      <textarea
                        placeholder="Enter complete address for this GST registration"
                        value={entry.address || ''}
                        onChange={(e) => handleGstChange(index, 'address', e.target.value)}
                        className="gst-address-input"
                        rows="3"
                      />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="remove-gst-btn"
                    onClick={() => removeGstEntry(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="add-gst-btn" onClick={addGstEntry}>
              + Add New GST Entry
            </button>
          </div>

          <div className="bank-section">
            <h3 className="section-title">Bank Details</h3>
            <div className="bank-details-grid">
              <div className="form-group">
                <label className="required-field">Bank Name</label>
                <input 
                  type="text" 
                  name="bank_name" 
                  value={updatedOrg.bank_name || ""} 
                  onChange={handleChange} 
                  placeholder="e.g., State Bank of India"
                  className="bank-input"
                />
              </div>

              <div className="form-group">
                <label className="required-field">Account Name</label>
                <input 
                  type="text" 
                  name="acc_name" 
                  value={updatedOrg.acc_name || ""} 
                  onChange={handleChange} 
                  placeholder="e.g., Company Name"
                  className="bank-input"
                />
              </div>

              <div className="form-group">
                <label className="required-field">Account Number</label>
                <input 
                  type="text" 
                  name="acc_num" 
                  value={updatedOrg.acc_num || ""} 
                  onChange={handleChange} 
                  placeholder="Enter 11-16 digit account number"
                  className="bank-input"
                  maxLength="16"
                />
              </div>

              <div className="form-group">
                <label className="required-field">IFSC Code</label>
                <input 
                  type="text" 
                  name="ifsc" 
                  value={updatedOrg.ifsc || ""} 
                  onChange={handleChange} 
                  placeholder="e.g., SBIN0123456"
                  className="bank-input"
                  maxLength="11"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group">
                <label>Branch</label>
                <input 
                  type="text" 
                  name="branch" 
                  value={updatedOrg.branch || ""} 
                  onChange={handleChange} 
                  placeholder="e.g., Main Branch, City"
                  className="bank-input"
                />
              </div>
            </div>
          </div>

        </div>
        <div className="form-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleUpdate}>Update Organization</button>
        </div>
      </div>
    </div>
  );
}
