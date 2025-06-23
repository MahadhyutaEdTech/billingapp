import React, { useState, useEffect } from "react";
import "../../css/modules/customer/CustomerForm.css";
import axiosInstance from '../../utils/axiosConfig';
import { API_BASE } from "../../config/config";

const CustomerForm = ({ onClose }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gst_state: "",
    gst_no: "",
    gst_address: ""
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const validateForm = () => {
    const nameRegex = /^[A-Za-z\s]+$/;

    //console.log("Validating Form Data:", formData);

    if (!formData.first_name.trim()) {
      setError("First name is required.");
      return false;
    }
    if (!nameRegex.test(formData.first_name)) {
      setError("First name must contain only letters.");
      return false;
    }

    if (!formData.last_name.trim()) {
      setError("Last name is required.");
      return false;
    }
    if (!nameRegex.test(formData.last_name)) {
      setError("Last name must contain only letters.");
      return false;
    }

    if (!formData.email.includes("@") || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must be exactly 10 digits.");
      return false;
    }

    if (formData.gst_no && !/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/.test(formData.gst_no)) {
      setError("Invalid GST Number format");
      return false;
    }

    if (formData.gst_state && !/^[A-Z]{2}$/.test(formData.gst_state)) {
      setError("State code must be 2 uppercase letters");
      return false;
    }

    //console.log("✅ Form validation passed.");
    setError(null);
    return true;
  };

  const createCustomer = async (customerData) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("❌ User not authenticated. Please log in.");
      return;
    }

    try {
      //console.log("🚀 Sending Data to API:", JSON.stringify(customerData, null, 2));

      const response = await axiosInstance.post(`${API_BASE}/customer/createCustomer`, customerData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Uses dynamic token
          "ngrok-skip-browser-warning": "true",
        },
      });

      //console.log("✅ API Response:", response.data);
      setSuccess("Customer created successfully!");
      setError(null);

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        gst_state: "",
        gst_no: "",
        gst_address: ""
      });

      //console.log("🧹 Form reset after successful creation.");
    } catch (error) {
      console.error("❌ API Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to create customer.");
      setSuccess(null);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => {
      const updatedForm = { ...prev, [e.target.name]: e.target.value };
      //console.log(`🔄 Updated ${e.target.name}:`, e.target.value);
      return updatedForm;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //console.log("🚀 Form submitted with data:", formData);

    if (validateForm()) {
      const timestamp = new Date().toISOString();
      const newDate = timestamp.slice(0, 19).replace("T", " ");

      const customerData = {
        ...formData,
        phone: String(formData.phone),
        created_at: newDate,
        updated_at: newDate,
        cust_gst_details: formData.gst_no ? JSON.stringify({
          state_code: formData.gst_state,
          gst_no: formData.gst_no,
          address: formData.gst_address
        }) : null
      };

      //console.log("📡 Sending data to create customer:", customerData);
      createCustomer(customerData);
    }
  };

  return (
    <div className={`customer-form-modal ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="customer-form-container">
        <div className="customer-form-header">
          <h2 className="customer-form-title">Create Customer</h2>
          <button className="customer-form-close" onClick={onClose}>×</button>
        </div>

        <div className="customer-form-content">
          {error && <p className="customer-form-error">{error}</p>}
          {success && <p className="customer-form-success">{success}</p>}

          <form onSubmit={handleSubmit}>
            <div className="customer-form-section">
              <h3 className="customer-form-section-title">Basic Details</h3>
              <div className="customer-form-grid">
                <div className="customer-form-group">
                  <label className="customer-form-label">
                    First Name<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="customer-form-input"
                    required
                  />
                </div>
                <div className="customer-form-group">
                  <label className="customer-form-label">
                    Last Name<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="customer-form-input"
                    required
                  />
                </div>
                <div className="customer-form-group">
                  <label className="customer-form-label">
                    Email<span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="customer-form-input"
                    required
                  />
                </div>
                <div className="customer-form-group">
                  <label className="customer-form-label">
                    Phone<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="customer-form-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="customer-form-section">
              <h3 className="customer-form-section-title">GST Details (Optional)</h3>
              <div className="customer-form-grid">
                <div className="customer-form-group">
                  <label className="customer-form-label">State Code</label>
                  <input
                    type="text"
                    name="gst_state"
                    value={formData.gst_state}
                    onChange={handleChange}
                    className="customer-form-input"
                    maxLength="2"
                    style={{ textTransform: 'uppercase' }}
                    placeholder="e.g. MH"
                  />
                </div>
                <div className="customer-form-group">
                  <label className="customer-form-label">GST Number</label>
                  <input
                    type="text"
                    name="gst_no"
                    value={formData.gst_no}
                    onChange={handleChange}
                    className="customer-form-input"
                    style={{ textTransform: 'uppercase' }}
                    placeholder="e.g. 27AAPFU0939F1ZV"
                  />
                </div>
                <div className="customer-form-group customer-form-full-width">
                  <label className="customer-form-label">GST Address</label>
                  <textarea
                    name="gst_address"
                    value={formData.gst_address}
                    onChange={handleChange}
                    className="customer-form-input customer-form-textarea"
                    placeholder="Enter complete GST registered address"
                  />
                </div>
              </div>
            </div>

            <div className="customer-form-actions">
              <button type="button" className="customer-form-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="customer-form-submit">
                Create Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CustomerForm;