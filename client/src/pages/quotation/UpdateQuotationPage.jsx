import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchQuotationById, updateQuotation } from "../../models/quotationModel";
import Spinner from "../../components/Spinner";
import "../../css/modules/quotation/UpdateQuotationDialogbox.css";
import { toast } from "react-toastify";

const UpdateQuotationPage = ({ quotationId: propId, onClose, darkMode }) => {
  const { quotationId: urlId } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const actualId = propId || urlId;

  useEffect(() => {
    const loadQuotation = async () => {
      try {
        setLoading(true);
        const data = await fetchQuotationById(actualId);
        setQuotation(data);
      } catch (err) {
        setError("Failed to load quotation.");
      } finally {
        setLoading(false);
      }
    };
    loadQuotation();
  }, [actualId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuotation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductChange = (index, field, value) => {
    setQuotation((prev) => {
      const products = [...prev.products];
      products[index] = { ...products[index], [field]: value };
      return { ...prev, products };
    });
  };

  const formatDateForMySQL = (dateString) => {
    if (!dateString) return null;
    // If already in YYYY-MM-DD, return as is
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(dateString)) return dateString;
    // Otherwise, parse and format
    return new Date(dateString).toISOString().slice(0, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updateData = {
        quotation_number: quotation.quotation_number,
        quotation_date: formatDateForMySQL(quotation.quotation_date),
        valid_until: formatDateForMySQL(quotation.valid_until),
        total_amount: quotation.total_amount,
        tax_amount: quotation.tax_amount,
        discount: quotation.discount,
        gst_type: quotation.gst_type,
        notes: quotation.notes,
        terms_conditions: quotation.terms_conditions,
        status: quotation.status,
        customer_id: quotation.customer_id,
        organization_id: quotation.organization_id,
      };
      await updateQuotation(actualId, updateData);
      if (toast) toast.success("Quotation updated successfully!");
      else window.alert("Quotation updated successfully!");
      if (onClose) onClose();
      else navigate(`/dashboard/quotation/${actualId}`);
    } catch (err) {
      setError("Failed to update quotation.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className={`update-quotation-modal${darkMode ? ' dark-mode' : ''}`}>
        <div className="update-quotation-wrapper">
          <Spinner />
        </div>
      </div>
    );
  if (error)
    return (
      <div className={`update-quotation-modal${darkMode ? ' dark-mode' : ''}`}>
        <div className="update-quotation-wrapper">
          <div className="error-message">{error}</div>
          <button className="update-quotation-btn-cancel" onClick={onClose || (() => navigate("/dashboard/quotations"))}>Close</button>
        </div>
      </div>
    );
  if (!quotation) return null;

  return (
    <div className={`update-quotation-modal${darkMode ? ' dark-mode' : ''}`}>
      <div className="update-quotation-wrapper" style={{ maxWidth: 420, width: '95%', padding: 16 }}>
        <button className="update-quotation-close" onClick={onClose || (() => navigate("/dashboard/quotations"))}>&times;</button>
        <div className="update-quotation-title" style={{ fontSize: 18, marginBottom: 10 }}>
          Update Quotation #{quotation.quotation_number}
        </div>
        <form onSubmit={handleSubmit} className="update-quotation-form" style={{ gap: 8 }}>
          <label>Date:</label>
          <input
            type="date"
            name="quotation_date"
            className="update-quotation-input"
            value={quotation.quotation_date?.slice(0, 10) || ""}
            onChange={handleChange}
            required
          />
          <label>Valid Until:</label>
          <input
            type="date"
            name="valid_until"
            className="update-quotation-input"
            value={quotation.valid_until?.slice(0, 10) || ""}
            onChange={handleChange}
            required
          />
          <label>Status:</label>
          <select
            name="status"
            className="update-quotation-input"
            value={quotation.status || ""}
            onChange={handleChange}
            required
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
            <option value="Converted">Converted</option>
          </select>
          <label>Notes:</label>
          <textarea
            name="notes"
            className="update-quotation-input"
            value={quotation.notes || ""}
            onChange={handleChange}
            rows={2}
            style={{ resize: 'vertical', minHeight: 40 }}
          />
          <label>Terms & Conditions:</label>
          <textarea
            name="terms_conditions"
            className="update-quotation-input"
            value={quotation.terms_conditions || ""}
            onChange={handleChange}
            rows={2}
            style={{ resize: 'vertical', minHeight: 40 }}
          />
          <div style={{ margin: '10px 0 5px 0', fontWeight: 600, fontSize: 15 }}>Products/Services</div>
          {quotation.products?.map((product, idx) => (
            <div
              key={idx}
              className="product-edit-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: 6,
                marginBottom: 6,
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                className="update-quotation-input"
                value={product.product_name || ""}
                onChange={(e) => handleProductChange(idx, "product_name", e.target.value)}
                placeholder="Product Name"
                required
              />
              <input
                type="number"
                className="update-quotation-input"
                value={product.quantity || 0}
                onChange={(e) => handleProductChange(idx, "quantity", e.target.value)}
                placeholder="Qty"
                min="1"
                required
              />
              <input
                type="number"
                className="update-quotation-input"
                value={product.unit_price || 0}
                onChange={(e) => handleProductChange(idx, "unit_price", e.target.value)}
                placeholder="Unit Price"
                min="0"
                required
              />
              <input
                type="number"
                className="update-quotation-input"
                value={product.tax || 0}
                onChange={(e) => handleProductChange(idx, "tax", e.target.value)}
                placeholder="Tax %"
                min="0"
                required
              />
            </div>
          ))}
          <div className="update-quotation-btn-group">
            <button type="submit" className="update-quotation-btn-save" disabled={saving}>
              {saving ? "Saving..." : "Update Quotation"}
            </button>
            <button type="button" className="update-quotation-btn-cancel" onClick={onClose || (() => navigate("/dashboard/quotations"))}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateQuotationPage;
