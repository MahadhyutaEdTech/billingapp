import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaFileAlt, FaExchangeAlt, FaPrint, FaDownload } from "react-icons/fa";
import { fetchQuotationById, deleteQuotation, convertQuotationToInvoice } from "../../models/quotationModel";
import Spinner from "../../components/Spinner";
import "../../css/modules/quotation/QuotationDetailsPage.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QuotationPrintPdf from "./q";

const QuotationDetailsPage = ({ quotationId, onClose }) => {
  const { quotationId: urlQuotationId } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const componentRef = useRef();

  // Use quotationId prop if available, otherwise use URL param
  const actualQuotationId = quotationId || urlQuotationId;

  //console.log("QuotationDetailsPage: quotationId", actualQuotationId);

  useEffect(() => {
    if (actualQuotationId) {
      fetchQuotationData();
    } else {
      setError("No quotation ID provided");
      setLoading(false);
    }
  }, [actualQuotationId]);

  const fetchQuotationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      //console.log("=== QuotationDetailsPage: fetchQuotationData ===");
      //console.log("actualQuotationId:", actualQuotationId);
      //console.log("typeof actualQuotationId:", typeof actualQuotationId);
      
      const data = await fetchQuotationById(actualQuotationId);
      
     // console.log("Data returned from fetchQuotationById:", data);
      
      if (data) {
        // Since your function returns a processed object, not an array
        setQuotation(data);
        console.log("✅ Quotation data set successfully");
      } else {
        console.log("❌ No data returned from fetchQuotationById");
        setError("Quotation not found or failed to load");
      }
    } catch (err) {
      console.error("❌ Error in fetchQuotationData:", err);
      setError("Failed to load quotation details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this quotation?");
    if (!confirmed) return;

    try {
      await deleteQuotation(actualQuotationId);
      toast.success("Quotation deleted successfully");
      if (onClose) {
        onClose();
      } else {
        navigate("/dashboard/quotations");
      }
    } catch (err) {
      toast.error("Failed to delete quotation");
      console.error("Delete error:", err);
    }
  };

  const handleConvertToInvoice = async () => {
    const confirmed = window.confirm("Are you sure you want to convert this quotation to an invoice?");
    if (!confirmed) return;

    try {
      const result = await convertQuotationToInvoice(actualQuotationId);
      toast.success("Quotation converted to invoice successfully");
      if (result.invoice_id) {
        navigate(`/dashboard/invoice/${result.invoice_id}`);
      } else {
        navigate("/dashboard/invoices");
      }
    } catch (err) {
      toast.error("Failed to convert quotation to invoice");
      console.error("Convert error:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!componentRef.current) return;
    const input = componentRef.current;

    // Make the hidden component visible for screenshot
    input.style.display = "block";
    // Wait for the DOM to update
    await new Promise((resolve) => setTimeout(resolve, 100));

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Quotation_${quotation?.quotation_number || actualQuotationId}.pdf`);
      // Hide the component again
      input.style.display = "none";
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "#6b7280";
      case "sent":
        return "#3b82f6";
      case "accepted":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      case "expired":
        return "#f59e0b";
      case "converted":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="quotation-detail-dialog-overlay">
        <div className="quotation-detail-dialog-container">
          <div className="quotation-detail-dialog-body">
            <div className="spinner-overlay">
              <Spinner />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quotation-detail-dialog-overlay">
        <div className="quotation-detail-dialog-container">
          <div className="quotation-detail-dialog-header">
            <h3>Error</h3>
            <button className="quotation-detail-close-button" onClick={onClose || (() => navigate("/dashboard/quotations"))}>&times;</button>
          </div>
          <div className="quotation-detail-dialog-body">
            <p className="error-message">❌ {error}</p>
            <p>Quotation ID: {actualQuotationId}</p>
            <button className="quotation-detail-primary-button" onClick={onClose || (() => navigate("/dashboard/quotations"))}>
              Back to Quotations
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="quotation-detail-dialog-overlay">
        <div className="quotation-detail-dialog-container">
          <div className="quotation-detail-dialog-header">
            <h3>Not Found</h3>
            <button className="quotation-detail-close-button" onClick={onClose || (() => navigate("/dashboard/quotations"))}>&times;</button>
          </div>
          <div className="quotation-detail-dialog-body">
            <p>Quotation not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quotation-detail-dialog-overlay">
      <div className="quotation-detail-dialog-container compact">
        <div className="quotation-detail-dialog-header compact">
          <h4>Quotation #{quotation.quotation_number || 'N/A'}</h4>
          <button className="quotation-detail-close-button" onClick={onClose || (() => navigate("/dashboard/quotations"))}>&times;</button>
        </div>
        <div className="quotation-detail-dialog-body compact">
          <div className="quotation-detail-compact-grid">
            <div className="quotation-detail-compact-col">
              <div><strong>Date:</strong> {formatDate(quotation.quotation_date)}</div>
              <div><strong>Valid Until:</strong> {formatDate(quotation.valid_until)}</div>
              <div>
                <strong>Status:</strong>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(quotation.status) }}>
                  {quotation.status || 'N/A'}
                </span>
              </div>
              <div><strong>Customer:</strong> {quotation.customer_details?.first_name || quotation.first_name || 'N/A'} {quotation.customer_details?.last_name || quotation.last_name || ''}</div>
              <div><strong>Email:</strong> {quotation.customer_details?.email || quotation.customer_email || 'N/A'}</div>
              <div><strong>Phone:</strong> {quotation.customer_details?.phone || quotation.phone || 'N/A'}</div>
            </div>
            <div className="quotation-detail-compact-col">
              <div><strong>Organization:</strong> {quotation.organization_details?.name || 'N/A'}</div>
              <div><strong>Org Email:</strong> {quotation.organization_details?.email || 'N/A'}</div>
              <div><strong>Org Phone:</strong> {quotation.organization_details?.phone || 'N/A'}</div>
              <div><strong>Subtotal:</strong> {formatCurrency(quotation.total_amount)}</div>
              <div><strong>Discount:</strong> -{formatCurrency(quotation.discount || 0)}</div>
              <div><strong>Tax:</strong> {formatCurrency(quotation.tax_amount || 0)}</div>
              <div><strong>Total:</strong> <span style={{ fontWeight: 600 }}>{formatCurrency((quotation.total_amount || 0) + (quotation.tax_amount || 0) - (quotation.discount || 0))}</span></div>
            </div>
          </div>
          <div className="quotation-detail-compact-section" style={{ marginTop: 8 }}>
            <strong>Products/Services:</strong>
            {quotation.products && quotation.products.length > 0 ? (
              <table className="quotation-detail-items-table compact">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>HSN/SAC</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Tax</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.products.map((product, index) => (
                    <tr key={index}>
                      <td>{product.product_name || 'N/A'}</td>
                      <td>{product.hsn_sac || 'N/A'}</td>
                      <td>{product.quantity || 0}</td>
                      <td>{formatCurrency(product.unit_price)}</td>
                      <td>{product.tax || 0}%</td>
                      <td>{formatCurrency((product.quantity || 0) * (product.unit_price || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <span style={{ marginLeft: 8 }}>No products found.</span>
            )}
          </div>
          {quotation.notes && (
            <div className="quotation-detail-compact-section" style={{ marginTop: 8 }}>
              <strong>Notes:</strong> {quotation.notes}
            </div>
          )}
          {quotation.terms_conditions && (
            <div className="quotation-detail-compact-section" style={{ marginTop: 8 }}>
              <strong>Terms:</strong> {quotation.terms_conditions}
            </div>
          )}
        </div>
        <div className="quotation-detail-dialog-footer compact">
          <button className="quotation-detail-primary-button compact" onClick={handleDownloadPDF} title="Download PDF"><FaDownload /></button>
          <button className="quotation-detail-primary-button compact" onClick={handlePrint} title="Print"><FaPrint /></button>
          <button className="quotation-detail-primary-button compact" onClick={() => navigate(`/dashboard/update-quotation/${actualQuotationId}`)} title="Edit"><FaEdit /></button>
          {quotation.status !== "Converted" && (
            <button className="quotation-detail-primary-button compact" onClick={handleConvertToInvoice} title="Convert to Invoice"><FaExchangeAlt /></button>
          )}
          <button className="quotation-detail-primary-button compact" onClick={handleDelete} style={{ backgroundColor: '#ef4444' }} title="Delete"><FaTrash /></button>
          <button className="quotation-detail-primary-button compact" onClick={onClose || (() => navigate("/dashboard/quotations"))} style={{ backgroundColor: '#6b7280' }} title="Close">&times;</button>
        </div>
      </div>
      <div
        ref={componentRef}
        style={{
          display: "none", // Will be set to block for screenshot
          position: "absolute",
          left: "-9999px",
          top: 0,
          background: "#fff",
          zIndex: -1,
        }}
      >
        <QuotationPrintPdf quotation={quotation} />
      </div>
    </div>
  );
};

export default QuotationDetailsPage;