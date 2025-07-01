import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";
import "../../css/modules/invoice/ModernInvoicePdf.css"; // Import the new CSS
import "../../css/modules/invoice/InvoiceTemplateButtons.css";
import { API_BASE } from "../../config/config";
import Spinner from '../../components/Spinner';

import { ToWords } from "to-words";

const ModernInvoicePdf = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  const handleLogoError = () => {
    setLogoError(true);
  };

  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        name: "Rupee",
        plural: "Rupees",
        symbol: "₹",
        fractionalUnit: {
          name: "Paisa",
          plural: "Paise",
          symbol: "",
        },
      },
    },
  });

  const getAmountInWords = (amount) => {
    try {
      const words = toWords.convert(amount, { currency: true });
      return words.toUpperCase();
    } catch (error) {
      console.error("Error converting amount to words:", error);
      return toWords.convert(Math.round(amount)).toUpperCase() + " RUPEES ONLY";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("User not authenticated. Please log in.");
      setIsLoading(false);
      navigate("/auth");
      return;
    }

    if (!invoiceId) {
      setError("Invoice ID not provided.");
      setIsLoading(false);
      return;
    }
    const fetchInvoiceData = async () => {
      try {
        const response = await axiosInstance.get(`${API_BASE}/invoice/get`, {
          params: { invoice_id: invoiceId },
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.data) {
          throw new Error("No data received from server");
        }

        const data = response.data;
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("No invoice found with the provided ID");
        }

        const firstItem = data[0];
        //console.log("API Response data:", data); // Debug log

        setInvoice({
          invoice_id: `${firstItem.invoice_prefix || ""}${firstItem.invoice_number}`,
          invoice_date: firstItem.invoice_date || "Unknown Date",
          total_amount: Number(firstItem.total_amount) || 0,
          tax_amount: Number(firstItem.tax_amount) || 0,
          advance: Number(firstItem.advance) || 0,
          due_amount: Number(firstItem.due_amount) || 0,
          gst_type: firstItem.gst_type || "IGST",
          discount: Number(firstItem.discount) || 0,
          customer: {
            first_name: firstItem.first_name || "Unknown",
            last_name: firstItem.last_name || "",
            email: firstItem.customer_email || "N/A",
            phone: firstItem.customer_phone || "N/A",
            gst_details: firstItem.cust_gst_details || null,
          },
          ship_to: {
            first_name:
              firstItem.shipping_addresses?.first_name ||
              firstItem.first_name ||
              "Unknown",
            last_name:
              firstItem.shipping_addresses?.last_name ||
              firstItem.last_name ||
              "",
            address: firstItem.shipping_addresses?.address || "",
            phone:
              firstItem.shipping_addresses?.phone ||
              firstItem.customer_phone ||
              "",
          },
          organization: {
            name: firstItem.name || "N/A",
            address: firstItem.gst_details?.address || "N/A",
            gst_number: firstItem.gst_details?.gst_number || "N/A",
            pan_number: firstItem.pan_number || "N/A",
            email: firstItem.email || "N/A",
            phone: firstItem.phone || "N/A",
            bank_name: firstItem.bank_name || "N/A",
            acc_name: firstItem.acc_name || "N/A",
            acc_num: firstItem.acc_num || "N/A",
            ifsc: firstItem.ifsc || "N/A",
            branch: firstItem.branch || "N/A",
            logo: firstItem.logo_image || null,
            signature_image: firstItem.signature_image || null,
          },
          products: data.map((item, index) => ({
            product_id: item.product_id || `N/A-${index}`,
            product_name: item.product_name || "Unknown Product",
            quantity: Number(item.quantity) || 1,
            unit_price: item.unit_price !== null ? Number(item.unit_price) : 0,
            hsn_sac: item.hsn_sac || "N/A",
            tax_percentage: Number(item.tax) || 0,
            total_amount: Number(item.total_amount) || 0,
            discount: Number(item.discount) || 0,
          })),
        });
      } catch (err) {
        console.error("Fetch error:", err);
        let errorMessage = "Failed to fetch invoice data. ";
        if (err.response) {
          if (err.response.status === 500) {
            errorMessage += "Internal server error. Please try again later.";
          } else {
            errorMessage +=
              err.response.data?.message ||
              "Please check your connection and try again.";
          }
        } else if (err.request) {
          errorMessage +=
            "No response from server. Please check your connection.";
        } else {
          errorMessage += err.message || "Something went wrong.";
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceData();
  }, [invoiceId, navigate]);

  useEffect(() => {
    if (invoice?.invoice_id) {
      const originalTitle = document.title;
      document.title = `Invoice_${invoice.invoice_id}`;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [invoice]);

  const handleDownload = () => {
    window.print();
  };

  const handleChangeTemplate = () => {
    localStorage.removeItem(`invoice_template_${invoiceId}`);

    // Set a flag in session storage before redirecting
    sessionStorage.setItem("changingTemplate", "true");

    // Use full page reload to reset component state and localStorage sync
    window.location.href = `/dashboard/invoice-template-chooser/${invoiceId}`;
  };

  const handleBack = () => {
    navigate("/dashboard/invoices");
  };

  if (isLoading)
    return <Spinner />;

  if (error)
    return (
      <div className="modern-invoice-container">
        <div className="modern-invoice modern-invoice-error">
          <h3>Error Loading Invoice</h3>
          <p>{error}</p>
          <button onClick={handleBack} className="modern-invoice-back-button">
            ← Go Back
          </button>
        </div>
      </div>
    );

  if (!invoice) return <div>No invoice found.</div>;

  const products = invoice?.products || [];

  // Use GST type from API if present, else fallback to GSTIN logic
  const orgGst = invoice?.organization?.gst_number || "";
  const custGst = invoice?.customer?.gst_details?.gst_no || "";
  let gstType = invoice?.gst_type;
  if (!gstType) {
    gstType = getGstTypeFromGstins(orgGst, custGst);
  }
  const isIGST = gstType === "IGST";

  const result = products.reduce(
    (acc, product) => {
      const grossAmount = product.unit_price * product.quantity;
      const discountAmount = (grossAmount * (product.discount || 0)) / 100;
      const taxableAmount = grossAmount - discountAmount;
      const totalTaxRate = product.tax_percentage || 0;

      let gstCalculations;
      if (isIGST) {
        gstCalculations = {
          igst: (taxableAmount * totalTaxRate) / 100,
          cgst: 0,
          sgst: 0,
        };
      } else {
        const halfTaxRate = totalTaxRate / 2;
        const halfTaxAmount = (taxableAmount * halfTaxRate) / 100;
        gstCalculations = {
          igst: 0,
          cgst: halfTaxAmount,
          sgst: halfTaxAmount,
        };
      }

      const totalGSTAmount =
        gstCalculations.igst + gstCalculations.cgst + gstCalculations.sgst;
      const totalAmount = taxableAmount + totalGSTAmount;

      return {
        subtotal: acc.subtotal + grossAmount,
        totalDiscount: acc.totalDiscount + discountAmount,
        totalTax: acc.totalTax + totalGSTAmount,
        totalIGST: acc.totalIGST + gstCalculations.igst,
        totalCGST: acc.totalCGST + gstCalculations.cgst,
        totalSGST: acc.totalSGST + gstCalculations.sgst,
        grandTotal: acc.grandTotal + totalAmount,
      };
    },
    {
      subtotal: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalIGST: 0,
      totalCGST: 0,
      totalSGST: 0,
      grandTotal: 0,
    }
  );

  const payableAmount = Math.max(
    result.grandTotal - (invoice?.advance || 0),
    0
  );

  const calculations = { ...result, payableAmount };

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  return (
    <>
      <div className="invoice-template-actions">
        <button className="change-template-btn" onClick={handleChangeTemplate}>
          Change Template
        </button>
        <button className="download-btn" onClick={handleDownload}>
          Download
        </button>
        <button className="back-btn" onClick={handleBack}>
          Back
        </button>
      </div>
      <div className="invoice-template-container">
        <div className="modern-invoice-container">
          <div className="modern-invoice">
            {/* TAX INVOICE Heading at the top */}
            <div style={{ textAlign: "center", margin: "0 0 1em 0" }}>
              <h1 style={{ fontSize: "1.7rem", fontWeight: "bold", margin: 0 }}>
                TAX INVOICE
              </h1>
            </div>
            {/* Header Section */}
            <div className="modern-invoice-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div className="company-logo-section">
                {!logoError && invoice?.organization?.logo ? (
                  <img
                    src={invoice.organization.logo}
                    alt="Company Logo"
                    className="logo"
                    onError={handleLogoError}
                  />
                ) : (
                  <h2 className="company-name">{invoice?.organization?.name || "COMPANY"}</h2>
                )}
              </div>
              <div className="invoice-title-section" style={{ flex: 1, marginLeft: "2rem" }}>
                <div className="invoice-info">
                  <p style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                    {invoice?.organization?.name}
                  </p>
                  <p>Address: {invoice?.organization?.address}</p>
                  <p>GSTIN: {invoice?.organization?.gst_number}</p>
                  <p>Phone: +91{invoice?.organization?.phone} | Email: {invoice?.organization?.email}</p>
                </div>
              </div>
            </div>

            {/* Bill To & Invoice Meta Section */}
            <div className="modern-invoice-details">
              <div className="bill-to-section">
                <h3>Bill To:</h3>
                <p>
                  <strong>{invoice?.customer?.first_name} {invoice?.customer?.last_name}</strong>
                  <br />
                  {invoice?.customer?.gst_details?.address || "N/A"}
                  <br />
                  Phone: +91{invoice?.customer?.phone}
                  {invoice?.customer?.gst_details && (
                    <>
                      <br />
                      GSTIN: {invoice.customer.gst_details.gst_no}
                     
                    </>
                  )}
                </p>
              </div>
              {/* Ship To section removed as per new image - this div can be removed or left empty if needed for flex layout */}
              {/* <div className="invoice-meta-section"></div> */}
            </div>

            {/* Invoice Number and Date Bar */}
            <div className="invoice-date-bar">
              <p>
                <strong>Invoice No.:</strong> {invoice?.invoice_id || "N/A"}
                <span> | </span>
                <strong>Invoice Date:</strong> {formatDate(invoice?.invoice_date)}
              </p>
            </div>

            {/* Product Table */}
            <table className="modern-invoice-table">
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Product/Service</th>
                  <th>HSN/SAC</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Discount</th>
                  <th className="text-right">Taxable Amt.</th>
                  <th className="text-right">GST Rate</th>
                  <th className="text-right">GST Amt.</th>
                  <th className="text-right">Total Amt.</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product, idx) => {
                    const grossAmount = product.unit_price * product.quantity;
                    const discountAmount = (grossAmount * (product.discount || 0)) / 100;
                    const taxableAmount = grossAmount - discountAmount;
                    const gstAmount = (taxableAmount * product.tax_percentage) / 100;
                    const totalAmount = taxableAmount + gstAmount;

                    return (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{product?.product_name || "N/A"}</td>
                        <td className="text-center">{product?.hsn_sac || "N/A"}</td>
                        <td className="text-right">{product?.quantity || 0}</td>
                        <td className="text-right">₹{product?.unit_price.toFixed(2)}</td>
                        <td className="text-right">₹{discountAmount.toFixed(2)}</td>
                        <td className="text-right">₹{taxableAmount.toFixed(2)}</td>
                        <td className="text-right">{`${product.tax_percentage || 0}%`}</td>
                        <td className="text-right">₹{gstAmount.toFixed(2)}</td>
                        <td className="text-right">₹{totalAmount.toFixed(2)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center">No products available.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Summary Section */}
            <div className="modern-invoice-summary-container">
              <div className="modern-invoice-summary">
                <p>
                  <span>Subtotal:</span>
                  <span>₹{calculations.subtotal.toFixed(2)}</span>
                </p>
                <p>
                  <span>Discount:</span>
                  <span>₹{calculations.totalDiscount.toFixed(2)}</span>
                </p>
               {/* GST Section: Show IGST or CGST/SGST based on gst_type */}
                {isIGST ? (
                  <p>
                    <span>IGST ({products[0]?.tax_percentage}%):</span>
                    <span>₹{result.totalIGST.toFixed(2)}</span>
                  </p>
                ) : (
                  <>
                    <p>
                      <span>CGST ({(products[0]?.tax_percentage || 0) / 2}%):</span>
                      <span>₹{result.totalCGST.toFixed(2)}</span>
                    </p>
                    <p>
                      <span>SGST ({(products[0]?.tax_percentage || 0) / 2}%):</span>
                      <span>₹{result.totalSGST.toFixed(2)}</span>
                    </p>
                    <p>
                      <span>CGST + SGST:</span>
                      <span>₹{(result.totalCGST + result.totalSGST).toFixed(2)}</span>
                    </p>
                  </>
                )}
                <p className="grand-total">
                  <span>Grand Total:</span>
                  <span>₹{calculations.grandTotal.toFixed(2)}</span>
                </p>
                <p>
                  <span>Advance Paid:</span>
                  <span>₹{invoice?.advance?.toFixed(2) || "0.00"}</span>
                </p>
                <p>
                  <span>Payable Amount:</span>
                  <span>₹{Math.max(calculations.payableAmount, 0).toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* Amount in Words */}
            <div className="modern-invoice-amount-in-words" style={{ fontSize: "11px", margin: "10px 0", fontWeight: 500 }}>
              <strong>Amount in Words:</strong> {getAmountInWords(calculations.grandTotal)}
            </div>

            {/* Bank Details */}
            <div className="modern-invoice-bank-details">
              <h3>Bank Details</h3>
              <p><strong>Bank Name:</strong> {invoice?.organization?.bank_name}</p>
              <p><strong>Account Name:</strong> {invoice?.organization?.acc_name}</p>
              <p><strong>Account Number:</strong> {invoice?.organization?.acc_num}</p>
              <p><strong>IFSC Code:</strong> {invoice?.organization?.ifsc}</p>
              <p><strong>Branch:</strong> {invoice?.organization?.branch}</p>
            </div>

            {/* Terms and Conditions */}
            <div className="modern-invoice-terms">
              <h4>Terms and Conditions:</h4>
              <ul>
                <li>Payment is due within 1 weeks.</li>
                <li>Goods/Services once sold will not be taken back.</li>
                <li>Interest will be charged at 18% PA if payment is not made within due date.</li>
                <li>All disputes are subject to local jurisdiction only.</li>
                <li>This is a computer generated invoice.</li>
              </ul>
            </div>

            {/* Signature and Footer */}
            <div className="modern-invoice-signature">
              {invoice?.organization?.signature_image ? (
                <div style={{ textAlign: "right" }}>
                  <img
                    src={invoice.organization.signature_image}
                    alt="Authorized Signature"
                    className="signature-image"
                    
                    onError={(e) => {
                      console.error("Signature image failed to load:", invoice.organization.signature_image);
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="signature-line">Signature</div>
                </div>
              ) : (
                <div className="signature-line">Signature</div>
              )}
            </div>

           
          </div>
        </div>
      </div>
    </>
  );
};

export default ModernInvoicePdf;