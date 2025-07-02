import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";
import "../../css/modules/invoice/ModernProfessionalInvoicePdf.css";
import { API_BASE } from "../../config/config";
import Spinner from '../../components/Spinner';
import { ToWords } from "to-words";

const ModernProfessionalInvoicePdf = () => {
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
      return toWords.convert(Math.round(amount)).toUpperCase() + "RUPEES ONLY"; // Changed to DOLLARS
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
    sessionStorage.setItem("changingTemplate", "true");
    window.location.href = `/dashboard/invoice-template-chooser/${invoiceId}`;
  };

  const handleBack = () => {
    navigate("/dashboard/invoices");
  };

  if (isLoading) return <Spinner />;
  if (error)
    return (
      <div className="modern-professional-invoice--error">
        <h3>Error Loading Invoice</h3>
        <p>{error}</p>
        <button onClick={handleBack} className="modern-professional-invoice__back-button">
          ← Back
        </button>
      </div>
    );

  if (!invoice) return <div>No invoice found.</div>;

  const products = invoice?.products || [];
  const isIGST = invoice?.gst_type === "IGST";

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
        <button className="download-btn" onClick={handleDownload} disabled={isLoading || !invoice}>
          Download
        </button>
        <button className="back-btn" onClick={handleBack}>
          Back
        </button>
      </div>
      <div className="modern-professional-invoice-container">
        <div className="modern-professional-invoice">
          {/* Header Section */}
          <div className="header-section">
            <div className="left-header">
              <h1>INVOICE</h1>
              <div className="invoice-meta">
                <div><strong>Invoice No:</strong> {invoice?.invoice_id || "N/A"}</div>
                <div><strong>Date:</strong> {formatDate(invoice?.invoice_date)}</div>
              </div>
            </div>
            <div className="right-header">
              <div className="company-info">
                <div className="logo-placeholder">
                  {invoice?.organization?.logo && !logoError ? (
                    <img
                      src={invoice.organization.logo}
                      alt="Company Logo"
                      onError={handleLogoError}
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-zap"
                    >
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                  )}
                </div>
                <h2>{invoice?.organization?.name || "Your Company Name"}</h2>
                <div className="company-details">
                  <div>{invoice?.organization?.address || "123 Anywhere St, Any City, ST 12345"}</div>
                  <div>GSTIN: {invoice?.organization?.gst_number || "N/A"}</div>
                  <div>PAN: {invoice?.organization?.pan_number || "N/A"}</div>
                  <div>Tel: {invoice?.organization?.phone || "+123-456-7890"}</div>
                  <div>Email: {invoice?.organization?.email || "hello@reallygreatsite.com"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To & Customer Details */}
          <div className="billto-customer-details">
            <div className="billto-section">
              <div className="billto-title">Bill To:</div>
              <div className="billto-details">
                <div>
                  <strong>{invoice?.customer?.first_name} {invoice?.customer?.last_name}</strong>
                </div>
                {invoice?.customer?.gst_details?.address && (
                  <div>{invoice.customer.gst_details.address}</div>
                )}
                <div>Email: {invoice?.customer?.email}</div>
                <div>Phone: {invoice?.customer?.phone}</div>
                {invoice?.customer?.gst_details?.gst_no && (
                  <div>GSTIN: {invoice.customer.gst_details.gst_no}</div>
                )}
              </div>
            </div>
            <div className="shipto-section">
              {/* Optionally add Ship To or other info here */}
            </div>
          </div>

          {/* Items Table */}
          <table className="items-table" style={{ margin: "0 0 18px 0", width: "100%" }}>
            <thead>
              <tr>
                <th>Description</th>
                <th>HSN/SAC</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Taxable Amt.</th>
                <th>GST Rate</th>
                <th>GST Amt.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => {
                  const grossAmount = product.unit_price * product.quantity;
                  const discountAmount = (grossAmount * (product.discount || 0)) / 100;
                  const taxableAmount = grossAmount - discountAmount;
                  const gstAmount = (taxableAmount * product.tax_percentage) / 100;
                  const totalAmount = taxableAmount + gstAmount;
                  return (
                    <tr key={index}>
                      <td>{product.product_name || "Your Description"}</td>
                      <td>{product.hsn_sac || "N/A"}</td>
                      <td>{product.quantity || 1}</td>
                      <td>₹{product.unit_price.toFixed(2) || "0.00"}</td>
                      <td>₹{discountAmount.toFixed(2)}</td>
                      <td>₹{taxableAmount.toFixed(2)}</td>
                      <td>{product.tax_percentage || 0}%</td>
                      <td>₹{gstAmount.toFixed(2)}</td>
                      <td>₹{totalAmount.toFixed(2)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9">No products available.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Summary Section */}
          <div className="summary-section">
            <div className="bank-details-summary">
              <div className="bank-details-title">Bank Details</div>
              <div className="bank-details-list">
                <div>Bank Name: {invoice?.organization?.bank_name || "Olivia Wilson"}</div>
                <div>Account Name: {invoice?.organization?.acc_name || "N/A"}</div>
                <div>Bank Account: {invoice?.organization?.acc_num || "0123 4567 8901"}</div>
                <div>IFSC: {invoice?.organization?.ifsc || "N/A"}</div>
                <div>Branch: {invoice?.organization?.branch || "N/A"}</div>
              </div>
            </div>
            <div className="totals-summary">
              <table>
                <tbody>
                  <tr>
                    <td className="label">Sub Total</td>
                    <td className="value">₹{calculations.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="label">Discount</td>
                    <td className="value">₹{calculations.totalDiscount.toFixed(2)}</td>
                  </tr>
                  {isIGST ? (
                    <tr>
                      <td className="label">IGST</td>
                      <td className="value">₹{result.totalIGST.toFixed(2)}</td>
                    </tr>
                  ) : (
                    <>
                      <tr>
                        <td className="label">CGST</td>
                        <td className="value">₹{result.totalCGST.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="label">SGST</td>
                        <td className="value">₹{result.totalSGST.toFixed(2)}</td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <td className="label grand">Grand Total</td>
                    <td className="value grand">₹{calculations.grandTotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="label">Advance Paid</td>
                    <td className="value">₹{invoice?.advance?.toFixed(2) || "0.00"}</td>
                  </tr>
                  <tr>
                    <td className="label payable">Payable Amount</td>
                    <td className="value payable">₹{Math.max(calculations.payableAmount, 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="amount-in-words">
            <strong>Amount in Words:</strong> {getAmountInWords(calculations.grandTotal)}
          </div>

          {/* Terms and Conditions */}
          <div className="terms-section">
            <h4>Terms and Conditions:</h4>
            <ul>
              <li>Payment is due within 1 week.</li>
              <li>Goods/Services once sold will not be taken back.</li>
              <li>Interest will be charged at 18% PA if payment is not made within due date.</li>
              <li>All disputes are subject to local jurisdiction only.</li>
              <li>This is a computer generated invoice.</li>
            </ul>
          </div>

          {/* Signature */}
          {invoice?.organization?.signature_image && (
            <div className="signature-section">
              <div className="signature-block">
                <img
                  src={invoice.organization.signature_image}
                  alt="Authorized Signature"
                  className="signature-image"
                />
                <div className="signature-line">
                  Signature
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="footer-section">
            <p>If you have any question please contact : {invoice?.organization?.email || "hello@reallygreatsite.com"}</p>
          </div>

          {/* Decorative elements from image */}
          <div className="decorative-shapes">
            <div className="shape-top-left"></div>
            <div className="shape-bottom-left"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModernProfessionalInvoicePdf;