import React, { useState, useEffect } from "react";
import axiosInstance from '../../utils/axiosConfig';
import { API_BASE } from "../../config/config";
import "../../css/modules/organization/UpdateOrganizationPage.css";

export default function UpdateOrganizationPage({ organization, onClose, setOrganizations }) {
  const [updatedOrg, setUpdatedOrg] = useState(organization || {});
  const [gstEntries, setGstEntries] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setUpdatedOrg(organization || {});
    if (organization?.gst_details) {
      const gstArray = Object.entries(organization.gst_details).map(([stateCode, details]) => ({
        stateCode,
        gstNumber: details.gst_number,
        lastInvoiceNumber: details.last_invoice_number,
        address: details.address || ''
      }));
      setGstEntries(gstArray);
    } else {
      setGstEntries([]);
    }
  }, [organization]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedOrg((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
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

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = type === 'logo' ? 500 * 1024 : 300 * 1024;
    const fieldName = type === 'logo' ? 'logo_image' : 'signature_image';
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: `File size should be less than ${maxSize / 1024}KB`
      }));
      return;
    }
    if (type === 'logo') {
      setLogoFile(file);
    } else {
      setSignatureFile(file);
    }
    setUpdatedOrg(prev => ({
      ...prev,
      [fieldName]: URL.createObjectURL(file)
    }));
    setErrors(prev => ({ ...prev, [fieldName]: null }));
  };

  const removeImage = (type) => {
    const fieldName = type === 'logo' ? 'logo_image' : 'signature_image';
    if (type === 'logo') {
      setLogoFile(null);
    } else {
      setSignatureFile(null);
    }
    setUpdatedOrg(prev => ({...prev, [fieldName]: ''}));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!updatedOrg.org_id) {
      newErrors.general = "Organization ID is required";
    }
    gstEntries.forEach((entry, index) => {
      if (entry.stateCode && !entry.gstNumber) {
        newErrors[`gst_${index}_number`] = "GST Number is required when State Code is provided";
      }
      if (entry.gstNumber && !entry.stateCode) {
        newErrors[`gst_${index}_state`] = "State Code is required when GST Number is provided";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrors({ general: "User not authenticated. Please log in." });
      return;
    }
    setLoading(true);
    try {
      const updateData = {
        name: updatedOrg.name,
        type: updatedOrg.type,
        email: updatedOrg.email,
        phone: updatedOrg.phone,
        website: updatedOrg.website,
        reg_number: updatedOrg.reg_number,
        pan_number: updatedOrg.pan_number,
        invoice_prefix: updatedOrg.invoice_prefix,
        bank_name: updatedOrg.bank_name,
        acc_name: updatedOrg.acc_name,
        ifsc: updatedOrg.ifsc,
        branch: updatedOrg.branch,
        acc_num: updatedOrg.acc_num
      };
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => 
          value !== undefined && value !== null && value !== ''
        )
      );
      const gst_details = {};
      gstEntries.forEach(entry => {
        if (entry.stateCode && entry.gstNumber) {
          gst_details[entry.stateCode.toUpperCase()] = {
            gst_number: entry.gstNumber,
            last_invoice_number: parseInt(entry.lastInvoiceNumber || 0),
            address: entry.address || ''
          };
        }
      });
      if (Object.keys(gst_details).length > 0) {
        cleanData.gst_details = JSON.stringify(gst_details);
      }
      if (Object.keys(cleanData).length === 0 && !logoFile && !signatureFile) {
        setErrors({ general: "No changes detected to update" });
        setLoading(false);
        return;
      }
      const formData = new FormData();
      Object.entries(cleanData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (logoFile) {
        formData.append('logo_image', logoFile);
      }
      if (signatureFile) {
        formData.append('signature_image', signatureFile);
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
        setOrganizations((prevOrgs) =>
          prevOrgs.map((org) =>
            org.org_id === updatedOrg.org_id ? { ...org, ...updatedOrg } : org
          )
        );
        onClose();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setErrors({ general: `Failed to update organization: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  // File upload section
  const FileUploadSection = ({ type, label, currentImage, error }) => (
    <div className="file-upload-section">
      <label>{label}</label>
      {currentImage ? (
        <div className="image-preview">
          <img src={currentImage} alt={`Current ${type}`} className="preview-img" />
          <button type="button" className="remove-img-btn" onClick={() => removeImage(type)}>
            Remove
          </button>
        </div>
      ) : (
        <div>
          <input
            accept="image/*"
            id={`${type}-upload`}
            type="file"
            onChange={(e) => handleFileUpload(e, type)}
          />
        </div>
      )}
      {error && <div className="error-text">{error}</div>}
    </div>
  );

  return (
    <div className="simple-modal-overlay">
      <div className="simple-modal">
        <div className="modal-header">
          <span className="modal-title">Update Organization</span>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">
          {errors.general && <div className="error-text">{errors.general}</div>}
          <div className="form-row">
            <FileUploadSection
              type="logo"
              label="Organization Logo (Max: 500KB)"
              currentImage={updatedOrg.logo_image}
              error={errors.logo_image}
            />
            <FileUploadSection
              type="signature"
              label="Signature Image (Max: 300KB)"
              currentImage={updatedOrg.signature_image}
              error={errors.signature_image}
            />
          </div>
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Organization Name</label>
                <input
                  type="text"
                  name="name"
                  value={updatedOrg.name || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Organization Type</label>
                <input
                  type="text"
                  name="type"
                  value={updatedOrg.type || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={updatedOrg.email || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={updatedOrg.phone || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="text"
                  name="website"
                  value={updatedOrg.website || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  name="reg_number"
                  value={updatedOrg.reg_number || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>PAN Number</label>
                <input
                  type="text"
                  name="pan_number"
                  value={updatedOrg.pan_number || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Invoice Prefix</label>
                <input
                  type="text"
                  name="invoice_prefix"
                  value={updatedOrg.invoice_prefix || ""}
                  onChange={handleChange}
                  placeholder="e.g., INV, ORG"
                />
              </div>
            </div>
          </div>
          <div className="form-section">
            <h3>GST Details</h3>
            {gstEntries.map((entry, index) => (
              <div key={index} className="gst-entry-card">
                <button type="button" className="remove-gst-btn" onClick={() => removeGstEntry(index)}>
                  ×
                </button>
                <div className="form-grid">
                  <div className="form-group">
                    <label>State Code</label>
                    <input
                      type="text"
                      value={entry.stateCode}
                      onChange={(e) => handleGstChange(index, 'stateCode', e.target.value.toUpperCase())}
                      maxLength="2"
                      placeholder="e.g., KA, MH"
                    />
                    {errors[`gst_${index}_state`] && <div className="error-text">{errors[`gst_${index}_state`]}</div>}
                  </div>
                  <div className="form-group">
                    <label>GST Number</label>
                    <input
                      type="text"
                      value={entry.gstNumber}
                      onChange={(e) => handleGstChange(index, 'gstNumber', e.target.value)}
                      placeholder="Enter GST Number"
                    />
                    {errors[`gst_${index}_number`] && <div className="error-text">{errors[`gst_${index}_number`]}</div>}
                  </div>
                  <div className="form-group">
                    <label>Last Invoice Number</label>
                    <input
                      type="number"
                      value={entry.lastInvoiceNumber}
                      onChange={(e) => handleGstChange(index, 'lastInvoiceNumber', e.target.value)}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>GST Address</label>
                    <textarea
                      value={entry.address || ''}
                      onChange={(e) => handleGstChange(index, 'address', e.target.value)}
                      placeholder="Enter complete address for this GST registration"
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="add-gst-btn" onClick={addGstEntry}>
              + Add New GST Entry
            </button>
          </div>
          <div className="form-section">
            <h3>Bank Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={updatedOrg.bank_name || ""}
                  onChange={handleChange}
                  placeholder="e.g., State Bank of India"
                />
              </div>
              <div className="form-group">
                <label>Account Name</label>
                <input
                  type="text"
                  name="acc_name"
                  value={updatedOrg.acc_name || ""}
                  onChange={handleChange}
                  placeholder="e.g., Company Name"
                />
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  name="acc_num"
                  value={updatedOrg.acc_num || ""}
                  onChange={handleChange}
                  placeholder="Enter 11-16 digit account number"
                  maxLength="16"
                />
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input
                  type="text"
                  name="ifsc"
                  value={updatedOrg.ifsc || ""}
                  onChange={handleChange}
                  placeholder="e.g., SBIN0123456"
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
                />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="btn-save" onClick={handleUpdate} disabled={loading}>
              {loading ? 'Updating...' : 'Update Organization'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}