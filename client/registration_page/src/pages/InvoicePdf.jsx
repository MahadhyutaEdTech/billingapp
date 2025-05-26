import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from '../utils/axiosConfig';
import "../css/InvoicePdf.css";
import { API_BASE } from "../config/config";
import { toWords } from 'number-to-words';

const InvoicePdf = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  const handleLogoError = () => {
    setLogoError(true);
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
            "Authorization": `Bearer ${token}`,
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
        console.log("API Response firstItem:", firstItem); // Debug log

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
            gst_details: firstItem.cust_gst_details || null
          },
          ship_to: {
            first_name: firstItem.shipping_addresses?.first_name || firstItem.first_name || "Unknown",
            last_name: firstItem.shipping_addresses?.last_name || firstItem.last_name || "",
            address: firstItem.shipping_addresses?.address || "N/A",
            phone: firstItem.shipping_addresses?.phone || firstItem.customer_phone || "N/A",
          },
          organization: {
            name: firstItem.name || "N/A",
            address: firstItem.gst_details?.address || "N/A",
            gst_number: firstItem.gst_details?.gst_number || "N/A",
            reg_number: firstItem.reg_number || "N/A",
            email: firstItem.email || "N/A",
            phone: firstItem.phone || "N/A",
            bank_name: firstItem.bank_name || "N/A",
            acc_name: firstItem.acc_name || "N/A",
            acc_num: firstItem.acc_num || "N/A",
            ifsc: firstItem.ifsc || "N/A",
            branch: firstItem.branch || "N/A",
            logo: firstItem.logo_image || null,
          },
          products: [{
            product_id: firstItem.product_id || "N/A",
            product_name: firstItem.product_name || "Unknown Product",
            quantity: Number(firstItem.quantity) || 1,
            unit_price: firstItem.unit_price !== null ? Number(firstItem.unit_price) : 0,
            hsn_sac: firstItem.hsn_sac || "N/A",
            tax_percentage: Number(firstItem.tax) || 0,
            total_amount: Number(firstItem.total_amount) || 0
          }]
        });
      } catch (err) {
        console.error("Fetch error:", err);
        let errorMessage = "Failed to fetch invoice data. ";
        if (err.response) {
          // Server responded with error
          if (err.response.status === 500) {
            errorMessage += "Internal server error. Please try again later.";
          } else {
            errorMessage += err.response.data?.message || "Please check your connection and try again.";
          }
        } else if (err.request) {
          // Request made but no response
          errorMessage += "No response from server. Please check your connection.";
        } else {
          // Error in request setup
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
  
  if (isLoading) return (
    <div className="invoice__loading">
      <h3>Loading invoice data...</h3>
      <p>Please wait while we fetch your invoice.</p>
    </div>
  );
  
  if (error) return (
    <div className="invoice__error">
      <h3>Error Loading Invoice</h3>
      <p>{error}</p>
      <button onClick={() => window.history.back()} className="invoice__back-button">
        ← Go Back
      </button>
    </div>
  );

  if (!invoice) return <div>No invoice found.</div>;

  const products = invoice?.products || [];
  const isIGST = invoice?.gst_type === "IGST";

  const result = products.reduce((acc, product) => {
    const grossAmount = product.unit_price * product.quantity;
    const discountAmount = (grossAmount * (product.discount || 0)) / 100;
    const taxableAmount = grossAmount - discountAmount;
    const totalTaxRate = product.tax_percentage || 0;
    
    let gstCalculations;
    if (isIGST) {
      gstCalculations = {
        igst: (taxableAmount * totalTaxRate) / 100,
        cgst: 0,
        sgst: 0
      };
    } else {
      const halfTaxRate = totalTaxRate / 2;
      const halfTaxAmount = (taxableAmount * halfTaxRate) / 100;
      gstCalculations = {
        igst: 0,
        cgst: halfTaxAmount,
        sgst: halfTaxAmount
      };
    }

    const totalGSTAmount = gstCalculations.igst + gstCalculations.cgst + gstCalculations.sgst;
    const totalAmount = taxableAmount + totalGSTAmount;

    return {
      subtotal: acc.subtotal + grossAmount,
      totalDiscount: acc.totalDiscount + discountAmount,
      totalTax: acc.totalTax + totalGSTAmount,
      totalIGST: acc.totalIGST + gstCalculations.igst,
      totalCGST: acc.totalCGST + gstCalculations.cgst,
      totalSGST: acc.totalSGST + gstCalculations.sgst,
      grandTotal: acc.grandTotal + totalAmount
    };
  }, { 
    subtotal: 0, 
    totalDiscount: 0, 
    totalTax: 0, 
    totalIGST: 0,
    totalCGST: 0,
    totalSGST: 0,
    grandTotal: 0 
  });
  
  // ✅ Now calculate the final payable amount
  const payableAmount = Math.max(result.grandTotal - (invoice?.advance || 0), 0);
  
  // ✅ Merge payableAmount into final calculations
  const calculations = { ...result, payableAmount };
  
  console.log(toWords(calculations.grandTotal));

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? "Invalid Date" 
      : date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
  };

  const capitalizeWords = (str) => {
    return str.split(' ').map(word => word.toUpperCase()).join(' ');
  };

  return (
    <div className="invoice__header">
      <h2 className="invoice__title">Tax Invoice</h2>
      <table className="invoice__table">
        <tbody>
          <tr>
            <td colSpan="6">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {!logoError ? (
                  <img 
                    src={invoice?.organization?.logo || '/images/default-logo.png'} 
                    alt="Organization Logo" 
                    onError={handleLogoError}
                    style={{ 
                      height: '50px', 
                      width: 'auto', 
                      objectFit: 'contain',
                      display: logoError ? 'none' : 'block'
                    }}
                  />
                ) : null}
                <h4><b>{invoice?.organization?.name}</b></h4>
              </div>
            </td>
            <td colSpan="4" style={{ textAlign: 'right' }}>
              <b>Invoice No.: {invoice?.invoice_id || "N/A"}</b><br />
              <b>Invoice Date: {formatDate(invoice?.invoice_date)}</b>
            </td>
          </tr>
          <tr>
            <td colSpan="10"><b><i>Address:</i> {invoice?.organization?.address}</b></td>
          </tr>
          <tr>
            <td colSpan="5" style={{ borderRight: '1px solid #ddd' }}><b><i>PAN No.:</i> {invoice?.organization?.reg_number}</b></td>
            <td colSpan="5">
              
              <div>
                <div><b>GST No:</b> {invoice?.organization?.gst_number}</div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan="5" style={{ borderRight: '1px solid #ddd' }}><b><i>Email:</i> {invoice?.organization?.email}</b></td>
            <td colSpan="5"><b><i>Mobile No.:</i> {invoice?.organization?.phone}</b></td>
          </tr>
          <tr>
            <td colSpan="5" style={{ verticalAlign: 'top', borderRight: '1px solid #ddd' }}>
              <div style={{ padding: '10px 0' }}>
                <b>Bill To:</b><br />
                {invoice?.customer?.first_name} {invoice?.customer?.last_name}<br />
                {invoice?.customer?.gst_details?.address}<br />
                +91{invoice?.customer?.phone}<br />
                {invoice?.customer?.gst_details && (
                  <div>
                    <b>GST Number:</b> {invoice.customer.gst_details.gst_no}<br />
                    <b>State Code:</b> {invoice.customer.gst_details.state_code}<br />
                    
                  </div>
                )}
              </div>
            </td>
            <td colSpan="5">
                <div>
                  <b>Ship To:</b><br />
                  {invoice?.ship_to?.first_name} {invoice?.ship_to?.last_name}<br />
                  {invoice?.ship_to?.address}, {invoice?.ship_to?.city}<br />
                  {invoice?.ship_to?.postal_code}<br />
                  +91{invoice?.ship_to?.phone}<br />
                  
                
                </div>
            </td>
          </tr>
          <tr>
            <th>Sr No.</th>
            <th>Product/Service</th>
            <th>HSN/SAC</th>
            <th>Quantity</th>
            <th>Unit Price ₹</th>
            <th>Taxable Amount ₹</th>
            <th>GST Rate</th>
            <th>GST Amount ₹</th>
            <th colSpan="2">Total Amount ₹</th>
          </tr>
          {products.length > 0 ? products.map((product, idx) => {
            const grossAmount = product.unit_price * product.quantity;
            const discountAmount = (grossAmount * (product.discount || 0)) / 100;
            const taxableAmount = grossAmount - discountAmount;
            const gstAmount = (taxableAmount * product.tax_percentage) / 100;
            const totalAmount = taxableAmount + gstAmount;

            return (
              <tr key={idx}>
                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ textAlign: 'center' }}>{product?.product_name || "N/A"}</td>
                <td style={{ textAlign: 'center' }}>{product?.hsn_sac || "N/A"}</td>
                <td style={{ textAlign: 'center' }}>{product?.quantity || 0}</td>
                <td style={{ textAlign: 'center' }}>{product?.unit_price.toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>{grossAmount.toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>
                  {`${product.tax_percentage}% ${isIGST ? 'IGST' : 'GST'}`}
                </td>
                <td style={{ textAlign: 'center' }}>{gstAmount.toFixed(2)}</td>
                <td colSpan="2" style={{ textAlign: 'center' }}>{totalAmount.toFixed(2)}</td>
              </tr>
            );
          }) : (
            <tr style={{ textAlign: 'center' }}><td colSpan="10">No products available.</td></tr>
          )}
          <tr><td colSpan="10" style={{ border: 'none', height: '20px' }}></td></tr>
          <tr><td colSpan="10" style={{ border: 'none', height: '20px' }}></td></tr>
          <tr><td colSpan="10" style={{ border: 'none', height: '20px' }}></td></tr>
          <tr>
            <td colSpan="5" style={{ textAlign: 'center' }}><strong>Bank Details</strong></td>
            <td colSpan="2" style={{ textAlign: 'right' }}>Taxable Amount:</td>
            <td colSpan="3"style={{ textAlign: 'right' }}>₹ {calculations.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan="5"><strong>Bank Name: {invoice?.organization?.bank_name}</strong></td>
            <td colSpan="2" style={{ textAlign: 'right' }}>Discount:</td>
            <td colSpan="3" style={{ textAlign: 'right' }}>₹ {calculations.totalDiscount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan="5"><strong>Account Name: {invoice?.organization?.acc_name}</strong></td>
            <td colSpan="2" style={{ textAlign: 'right' }}>
              {isIGST ? (
                `IGST (${products[0]?.tax_percentage}%):`
              ) : (
                <>
                  <div>CGST ({(products[0]?.tax_percentage / 2)}%):</div>
                  <div>SGST ({(products[0]?.tax_percentage / 2)}%):</div>
                </>
              )}
            </td>
            <td colSpan="3" style={{ textAlign: 'right' }}>
              {isIGST ? (
                `₹ ${result.totalIGST.toFixed(2)}`
              ) : (
                <>
                  <div>₹ {result.totalCGST.toFixed(2)}</div>
                  <div>₹ {result.totalSGST.toFixed(2)}</div>
                </>
              )}
            </td>
          </tr>
          <tr>
            <td colSpan="5"><strong>Account Number: {invoice?.organization?.acc_num}</strong></td>
            <td colSpan="2" style={{ textAlign: 'right' }}><strong>Grand Total:</strong></td>
            <td colSpan="3" style={{ textAlign: 'right' }}><strong>₹ {calculations.grandTotal.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td colSpan="5" style={{ textAlign: 'left', paddingTop: '10px', paddingBottom: '10px' }}><strong>IFSC Code: {invoice?.organization?.ifsc}</strong></td>
            <td colSpan="2" style={{ textAlign: 'right' }}>Advance:</td>
            <td colSpan="3" style={{ textAlign: 'right' }}>₹ {invoice?.advance?.toFixed(2) || "0.00"}</td>
          </tr>
          <tr>
            <td colSpan="5" style={{ textAlign: 'left', paddingTop: '10px', paddingBottom: '10px' }}><strong>Branch: {invoice?.organization?.branch}</strong></td>
            <td colSpan="2" style={{ textAlign: 'right' }}><strong>Payable Amount:</strong></td>
            <td  colSpan="3" style={{ textAlign: 'right' }}><strong>₹ {Math.max(calculations.payableAmount, 0).toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td colSpan="10" style={{ textAlign: 'left', padding: '15px 10px' }}>
              <strong>Amount in Words: 
              {capitalizeWords(toWords(Math.round(calculations.grandTotal)))} RUPEES ONLY</strong> 
            </td>
          </tr>
          <tr>
            <td colSpan="5" style={{ textAlign: 'left', padding: '40px 15px 15px', verticalAlign: 'bottom', borderBottom: '1px solid #000' }}>
              Customer Seal and Signature
            </td>
            <td colSpan="5" style={{ textAlign: 'right', padding: '40px 15px 15px', verticalAlign: 'bottom', borderBottom: '1px solid #000' }}>
              Authorised Signature
            </td>
          </tr>
          <tr><td colSpan="10" style={{ padding: '15px' }}></td></tr>
          <tr>
            <td colSpan="10" rowSpan="5" style={{ textAlign: 'left', padding: '15px', verticalAlign: 'top' }}>
              <strong>Terms and Conditions:</strong><br />
              1. Payment is due within 30 days<br />
              2. Goods once sold will not be taken back<br />
              3. Interest will be charged at 18% PA if payment is not made within due date<br />
              4. All disputes are subject to local jurisdiction only<br />
              5. This is a computer generated invoice
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginBottom: '30px' }}></div>
      <div className="invoice__button">
        <button onClick={() => window.history.back()} className="invoice__back-button">← Back</button>
        <button onClick={() => window.print()} className="invoice__print-button">Print this page</button>
        

      </div>
    </div>
  );
};

export default InvoicePdf;
