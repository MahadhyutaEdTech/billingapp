import React, { useState } from "react";
import axiosInstance from '../utils/axiosConfig';
import "../css/AddOrganizationPage.css";
import { API_BASE } from "../config/config";
import { useNavigate } from "react-router-dom";

const AddOrganizationPage = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    email: "",
    phone: "",
    website: "",
    registrationNumber: "",
    logo_image: null,
    invoicePrefix: "",
    gstEntries: [{ stateCode: "", gstNumber: "", address: "" }],
    bank_name: "",
    acc_name: "",
    acc_num: "",
    ifsc: "",
    branch: "",
    
    created_at: new Date().toISOString(),  // Add this line
  });

  // Separate state for logoFile
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationErrors({ ...validationErrors, [e.target.name]: "" });
  };

  // Update handleImageChange with stricter validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (500KB limit)
      if (file.size > 500 * 1024) {
        alert('File size should be less than 500KB');
        return;
      }

      console.log("🖼️ Selected file:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)}KB`
      });

      // Create a copy with a new name to avoid special characters
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const newFile = new File([file], cleanFileName, { type: file.type });
      
      setLogoFile(newFile);
      const previewUrl = URL.createObjectURL(newFile);
      setLogoPreview(previewUrl);
    }
  };

  const handleGstChange = (index, field, value) => {
    const newGstEntries = [...formData.gstEntries];
    newGstEntries[index][field] = value;
    setFormData({ ...formData, gstEntries: newGstEntries });
    setValidationErrors({ ...validationErrors, gstEntries: [] });
  };

  const addGstEntry = () => {
    setFormData({
      ...formData,
      gstEntries: [...formData.gstEntries, { stateCode: "", gstNumber: "", address: "" }],
    });
  };

  const removeGstEntry = (index) => {
    const newGstEntries = formData.gstEntries.filter((_, i) => i !== index);
    setFormData({ ...formData, gstEntries: newGstEntries });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.type.trim()) errors.type = "Type is required.";
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format.";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = "Phone number must be 10 digits.";
    }
    if (!formData.registrationNumber.trim()) errors.registrationNumber = "Registration number is required.";

    // GST validation - make it optional
    const gstErrors = formData.gstEntries.map((entry) => {
      const errors = {};
      if (entry.stateCode || entry.gstNumber) { // Only validate if either field has a value
        if (!entry.stateCode) errors.stateCode = "State code is required";
        if (!entry.gstNumber) {
          errors.gstNumber = "GST Number is required";
        } else if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/.test(entry.gstNumber)) {
          errors.gstNumber = "Invalid GST Number format";
        }
      }
      return errors;
    });

    if (gstErrors.some((error) => Object.keys(error).length > 0)) {
      errors.gstEntries = gstErrors;
    }

    // Bank details validation
    if (!formData.bank_name.trim()) errors.bank_name = "Bank name is required";
    if (!formData.acc_name.trim()) errors.acc_name = "Account name is required";
    if (!formData.acc_num.trim()) errors.acc_num = "Account number is required";
    if (!formData.ifsc.trim()) errors.ifsc = "IFSC code is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token not found");

      // Debug the complete data structure before FormData conversion
      const dataToSend = {
        name: formData.name,
        type: formData.type,
        email: formData.email,
        phone: formData.phone,
        website: formData.website || "",
        reg_number: formData.registrationNumber,
        invoice_prefix: formData.invoicePrefix || "",
        gst_details: formData.gstEntries.reduce((acc, entry) => {
          if (entry.stateCode && entry.gstNumber) {
            acc[entry.stateCode.toUpperCase()] = {
              gst_number: entry.gstNumber,
              last_invoice_number: 0,
              address: entry.address || ""
            };
          }
          return acc;
        }, {}),
        bank_name: formData.bank_name,
        acc_name: formData.acc_name,
        acc_num: formData.acc_num,
        ifsc: formData.ifsc.toUpperCase(),
        branch: formData.branch || "",
        created_at: formData.created_at
      };

      console.log("📦 Complete data structure:", JSON.stringify(dataToSend, null, 2));

      const formDataToSend = new FormData();

      // First add and verify logo_image
      if (logoFile) {
        formDataToSend.append("logo_image", logoFile);
        // Verify logo_image was added
        const logoEntry = formDataToSend.get("logo_image");
        console.log("🔍 Verifying logo_image in FormData:", {
          added: !!logoEntry,
          name: logoEntry?.name,
          type: logoEntry?.type,
          size: logoEntry?.size,
        });
      }

      // Convert the debug object to FormData
      Object.entries(dataToSend).forEach(([key, value]) => {
        formDataToSend.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });

      // Log form data for debugging
      console.log("📦 Form data entries:", Array.from(formDataToSend.entries()));

      // Debug form data before sending
      console.log("🔍 Form Data Content:");
      Array.from(formDataToSend.entries()).forEach(([key, value]) => {
        if (key === 'logo_image') {
          console.log('Logo File Details:', {
            name: value.name,
            type: value.type,
            size: value.size,
            lastModified: value.lastModified
          });
        } else if (key === 'gst_details') {
          console.log('GST Details:', JSON.parse(value));
        } else {
          console.log(`${key}:`, value);
        }
      });

      // Final verification of all form data
      console.log("📦 Final FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        if (key === "logo_image") {
          console.log("logo_image:", {
            type: "File",
            name: value.name,
            size: value.size,
            contentType: value.type
          });
        } else {
          console.log(`${key}:`, value);
        }
      }

      const response = await axiosInstance.post(
        `${API_BASE}/organization/create`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          maxContentLength: 5 * 1024 * 1024, // 5MB max
          maxBodyLength: 5 * 1024 * 1024, // 5MB max
          timeout: 30000, // 30 second timeout
        }
      );

      console.log("📥 Full API Response:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });

      // Check if response has data and success status
      if (response.data && (response.status === 200 || response.status === 201)) {
        console.log("✅ Organization Added Successfully:", response.data);
        // Navigate first, then show alert
        navigate("/dashboard/organization-page");
        alert("Organization added successfully!");
      } else {
        throw new Error("Invalid response from server");
      }

    } catch (err) {
      console.error("🚫 Detailed submission error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      
      let errorMessage = err.response?.data?.message || err.message || "Failed to add organization";
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const logoSection = (
    <div className="input-field full-width logo-upload">
      <label>Logo Image</label>
      <input
        type="file"
        name="logoImage"
        onChange={handleImageChange}
        accept="image/*"
       
      />
      {logoPreview && (
        <div className="logo-preview">
          <img
            src={logoPreview}
            alt="Logo preview"
            onError={(e) => {
              e.target.style.display = 'none';
              console.warn('Failed to load logo image');
            }}
            style={{ maxWidth: '200px', marginTop: '10px' }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="organization-container">
      <h2>Add New Organization</h2>
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <p className="error-help">Please try again or contact support if the problem persists.</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="organization-form">
        <div className="form-grid">
          {/* Left Column - Organization & Bank Details */}
          <div className="form-column">
            <div className="section-group">
              <h3>Organization Details</h3>
              <div className="input-grid">
                <div className="input-field">
                  <label>Organization Name*</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Enter organization name"
                    required 
                  />
                  {validationErrors.name && <p className="error">{validationErrors.name}</p>}
                </div>

                <div className="input-field">
                  <label>Organization Type*</label>
                  <select name="type" value={formData.type} onChange={handleChange} required>
                    <option value="">Select Type</option>
                    <option value="Private Limited">Private Limited</option>
                    <option value="Public Limited">Public Limited</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Proprietorship">Proprietorship</option>
                  </select>
                  {validationErrors.type && <p className="error">{validationErrors.type}</p>}
                </div>

                <div className="input-field">
                  <label>Email Address*</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="Enter email address"
                    required 
                  />
                  {validationErrors.email && <p className="error">{validationErrors.email}</p>}
                </div>

                <div className="input-field">
                  <label>Phone Number*</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="Enter 10-digit phone number"
                    required 
                  />
                  {validationErrors.phone && <p className="error">{validationErrors.phone}</p>}
                </div>

                <div className="input-field">
                  <label>Website</label>
                  <input 
                    type="url" 
                    name="website" 
                    value={formData.website} 
                    onChange={handleChange} 
                    placeholder="Enter website URL"
                  />
                </div>

                <div className="input-field">
                  <label>Registration Number*</label>
                  <input 
                    type="text" 
                    name="registrationNumber" 
                    value={formData.registrationNumber} 
                    onChange={handleChange} 
                    placeholder="Enter registration number"
                    required 
                  />
                  {validationErrors.registrationNumber && <p className="error">{validationErrors.registrationNumber}</p>}
                </div>

                <div className="input-field">
                  <label>
                    Invoice Prefix <span className="optional">(Optional)</span>
                    <span className="tooltip-icon" title="This prefix will be added before invoice numbers">ℹ️</span>
                  </label>
                  <input 
                    type="text"
                    name="invoicePrefix"
                    value={formData.invoicePrefix}
                    onChange={handleChange}
                    placeholder="e.g. INV/2024-, ABC/24-"
                    maxLength="15"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {validationErrors.invoicePrefix && <p className="error">{validationErrors.invoicePrefix}</p>}
                  <small className="helper-text">Examples: INV-, ABC/24-, SALE/2024-</small>
                </div>

                {logoSection}
              </div>
            </div>

            <div className="section-group">
              <h3>Bank Details</h3>
              <div className="input-grid">
                <div className="input-field">
                  <label>Bank Name*</label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                    required
                  />
                  {validationErrors.bank_name && <p className="error">{validationErrors.bank_name}</p>}
                </div>

                <div className="input-field">
                  <label>Account Name*</label>
                  <input
                    type="text"
                    name="acc_name"
                    value={formData.acc_name}
                    onChange={handleChange}
                    placeholder="Enter account holder name"
                    required
                  />
                  {validationErrors.acc_name && <p className="error">{validationErrors.acc_name}</p>}
                </div>

                <div className="input-field">
                  <label>Account Number*</label>
                  <input
                    type="text"
                    name="acc_num"
                    value={formData.acc_num}
                    onChange={handleChange}
                    placeholder="Enter account number"
                    required
                  />
                  {validationErrors.acc_num && <p className="error">{validationErrors.acc_num}</p>}
                </div>

                <div className="input-field">
                  <label>IFSC Code*</label>
                  <input
                    type="text"
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleChange}
                    placeholder="Enter IFSC code"
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                  {validationErrors.ifsc && <p className="error">{validationErrors.ifsc}</p>}
                </div>

                <div className="input-field">
                  <label>Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    placeholder="Enter branch name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - GST Details */}
          <div className="form-column">
            <div className="section-group">
              <h3>GST Details</h3>
              <div className="gst-entries">
                {formData.gstEntries.map((entry, index) => (
                  <div key={index} className="gst-entry">
                    <div className="gst-input-group">
                      <div className="gst-row">
                        <input
                          type="text"
                          placeholder="State Code (e.g., KA, MH)"
                          value={entry.stateCode}
                          onChange={(e) => handleGstChange(index, "stateCode", e.target.value.toUpperCase())}
                          maxLength="2"
                          style={{ textTransform: 'uppercase' }}
                          className="state-code-input"
                        />
                        <input
                          type="text"
                          placeholder="GST Number"
                          value={entry.gstNumber}
                          onChange={(e) => handleGstChange(index, "gstNumber", e.target.value.toUpperCase())}
                          style={{ textTransform: 'uppercase' }}
                          className="gst-number-input"
                        />
                      </div>
                      <div className="gst-address">
                        <textarea
                          placeholder="Enter address for this GST"
                          value={entry.address}
                          onChange={(e) => handleGstChange(index, "address", e.target.value)}
                          className="gst-address-input"
                          rows="3"
                        />
                      </div>
                      {index > 0 && (
                        <button 
                          type="button" 
                          className="remove-gst-btn"
                          onClick={() => removeGstEntry(index)}
                        >
                          ✖
                        </button>
                      )}
                    </div>
                    {validationErrors.gstEntries?.[index]?.stateCode && (
                      <p className="error">{validationErrors.gstEntries[index].stateCode}</p>
                    )}
                    {validationErrors.gstEntries?.[index]?.gstNumber && (
                      <p className="error">{validationErrors.gstEntries[index].gstNumber}</p>
                    )}
                  </div>
                ))}
                <button type="button" className="add-gst-btn" onClick={addGstEntry}>
                  + Add Another GST Entry
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Adding..." : "Add Organization"}
          </button>
          <button
            className="btn-back"
            type="button"
            onClick={() => navigate("/dashboard/organization-page")}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOrganizationPage;