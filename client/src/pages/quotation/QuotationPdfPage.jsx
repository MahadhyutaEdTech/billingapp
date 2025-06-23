import React, { forwardRef } from "react";

console.log("QuotationPdf loaded");

const QuotationPdfPage = forwardRef(({ quotation }, ref) => {
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

  return (
    <div ref={ref} style={{ padding: 24, fontFamily: "Arial", backgroundColor: "white" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ margin: 0, color: "#333" }}>QUOTATION</h1>
        <p style={{ margin: "5px 0", color: "#666" }}>#{quotation?.quotation_number}</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
        <div>
          <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>From:</h3>
          <p style={{ margin: "2px 0" }}><strong>{quotation?.organization_details?.name}</strong></p>
          <p style={{ margin: "2px 0" }}>{quotation?.organization_details?.email}</p>
          <p style={{ margin: "2px 0" }}>{quotation?.organization_details?.phone}</p>
          <p style={{ margin: "2px 0" }}>{quotation?.organization_details?.address}</p>
        </div>
        <div>
          <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>To:</h3>
          <p style={{ margin: "2px 0" }}><strong>{quotation?.customer_details?.first_name} {quotation?.customer_details?.last_name}</strong></p>
          <p style={{ margin: "2px 0" }}>{quotation?.customer_details?.email}</p>
          <p style={{ margin: "2px 0" }}>{quotation?.customer_details?.phone}</p>
          <p style={{ margin: "2px 0" }}>{quotation?.customer_details?.address}</p>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <p><strong>Quotation Date:</strong> {formatDate(quotation?.quotation_date)}</p>
        <p><strong>Valid Until:</strong> {formatDate(quotation?.valid_until)}</p>
        <p><strong>Status:</strong> {quotation?.status}</p>
      </div>

      {quotation?.products && quotation.products.length > 0 && (
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ color: "#333", borderBottom: "2px solid #333", paddingBottom: 5 }}>Items</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Product/Service</th>
                <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>HSN/SAC</th>
                <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>Qty</th>
                <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "right" }}>Unit Price</th>
                <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>Tax</th>
                <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.products.map((product, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{product.product_name}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{product.hsn_sac}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>{product.quantity}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "right" }}>{formatCurrency(product.unit_price)}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>{product.tax}%</td>
                  <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "right" }}>{formatCurrency(product.quantity * product.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 30, display: "flex", justifyContent: "flex-end" }}>
        <div style={{ minWidth: 250 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span>Subtotal:</span>
            <span>{formatCurrency(quotation?.total_amount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span>Discount:</span>
            <span>-{formatCurrency(quotation?.discount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span>Tax Amount:</span>
            <span>{formatCurrency(quotation?.tax_amount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #333", paddingTop: 10, fontSize: 18, fontWeight: "bold" }}>
            <span>Total Amount:</span>
            <span>{formatCurrency((quotation?.total_amount || 0) + (quotation?.tax_amount || 0) - (quotation?.discount || 0))}</span>
          </div>
        </div>
      </div>

      {quotation?.notes && (
        <div style={{ marginTop: 30 }}>
          <h3 style={{ color: "#333", borderBottom: "1px solid #333", paddingBottom: 5 }}>Notes</h3>
          <p style={{ marginTop: 10 }}>{quotation.notes}</p>
        </div>
      )}

      {quotation?.terms_conditions && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ color: "#333", borderBottom: "1px solid #333", paddingBottom: 5 }}>Terms & Conditions</h3>
          <p style={{ marginTop: 10 }}>{quotation.terms_conditions}</p>
        </div>
      )}
    </div>
  );
});

// Add display name for debugging
QuotationPdfPage.displayName = 'QuotationPdfPage';

export default QuotationPdfPage;