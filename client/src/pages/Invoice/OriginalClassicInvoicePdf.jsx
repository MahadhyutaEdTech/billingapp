import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import "../../css/modules/invoice/OriginalClassicInvoicePdf.css";
import "../../css/modules/invoice/InvoiceTemplateButtons.css";
import Spinner from '../../components/Spinner';

const OriginalClassicInvoicePdf = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const token = localStorage.getItem("authToken");

                if (!token) {
                    setError("User not authenticated. Please log in.");
                    setLoading(false);
                    return; // Exit if no token
                }
                const response = await axiosInstance.get(`/invoice/get`, {
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
                
                const rawInvoice = data[0];

                // Restructure the invoice data
                const restructuredInvoice = {
                    ...rawInvoice,
                    invoiceNumber: rawInvoice.invoice_number, // Map invoice_number to invoiceNumber
                    invoiceDate: rawInvoice.invoice_date,     // Map invoice_date to invoiceDate
                    dueDate: rawInvoice.invoice_date,         // Assuming due date is same as invoice date if not explicitly provided in rawInvoice
                    deliveryCharges: parseFloat(rawInvoice.deliveryCharges || 0), // Default to 0 if undefined
                    packingCharges: parseFloat(rawInvoice.packingCharges || 0),   // Default to 0 if undefined
                    roundOff: parseFloat(rawInvoice.roundOff || 0), // Default to 0 if undefined
                    totalDiscount: parseFloat(rawInvoice.discount || 0),
                    receivedAmount: parseFloat(rawInvoice.advance || 0), // Assuming 'advance' is received amount
                    balanceAmount: parseFloat(rawInvoice.due_amount || 0), // Assuming 'due_amount' is balance amount
                    
                    organization: {
                        name: rawInvoice.name,
                        address: rawInvoice.gst_details?.address || rawInvoice.address, // Prioritize gst_details address, fallback to organization address
                        gstin: rawInvoice.gst_details?.gst_number || rawInvoice.gst_no, // Prioritize gst_details, fallback to organization gst_no
                        contactNumber: rawInvoice.phone,
                        logo: rawInvoice.logo_image, // Map logo_image to logo
                        ifscCode: rawInvoice.ifsc,
                        bankAccountNumber: rawInvoice.acc_num,
                        bankName: rawInvoice.bank_name,
                        bankBranch: rawInvoice.branch,
                        signature_image: rawInvoice.signature_image,
                    },
                    customer: {
                        customerName: `${rawInvoice.first_name || ''} ${rawInvoice.last_name || ''}`.trim(),
                        address: rawInvoice.shipping_addresses?.address || rawInvoice.cust_gst_details?.address,
                        gstin: rawInvoice.cust_gst_details?.gst_no,
                        contactNo: rawInvoice.customer_phone,
                        placeOfSupply: rawInvoice.cust_gst_details?.state_code, // Assuming state_code represents place of supply
                    },
                    products: data.map(item => ({ // Map ALL items from the fetched data array to products
                        productName: item.product_name,
                        hsnSac: item.hsn_sac,
                        quantity: item.quantity,
                        unit: item.unit || 'PCS', // Use item.unit if available, fallback to PCS
                        mrp: parseFloat(item.unit_price || 0), // Assuming unit_price is MRP
                        rate: parseFloat(item.unit_price || 0), // Assuming unit_price is Rate
                        discount: parseFloat(item.discount || 0),
                        gstRate: parseFloat(item.tax || 0), // Assuming 'tax' is the GST rate
                        gstAmount: parseFloat(item.tax_amount || 0),
                        totalAmount: parseFloat(item.total_amount || 0),
                        imeiNumber: item.imei_number, // If available in future data
                        serialNumber: item.serial_number, // If available in future data
                    })),
                    gstSummary: data.map(item => ({ // Map ALL items to create GST summary entries
                        hsnSac: item.hsn_sac,
                        taxableValue: parseFloat(item.total_amount || 0) - parseFloat(item.tax_amount || 0) - parseFloat(item.discount || 0), // Calculated taxable value
                        cgstRate: parseFloat(item.tax || 0) / 2, // Assuming GST is split equally
                        cgstAmount: parseFloat(item.tax_amount || 0) / 2, // Assuming GST is split equally
                        sgstRate: parseFloat(item.tax || 0) / 2, // Assuming GST is split equally
                        sgstAmount: parseFloat(item.tax_amount || 0) / 2, // Assuming GST is split equally
                        totalTaxAmount: parseFloat(item.tax_amount || 0),
                    })),
                };

                setInvoice(restructuredInvoice);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching invoice:', err);
                let errorMessage = 'Failed to fetch invoice details. ';
                if (err.response) {
                    errorMessage += err.response.data?.message || 'Please check your connection and try again.';
                } else if (err.request) {
                    errorMessage += 'No response from server. Please check your connection.';
                } else {
                    errorMessage += err.message || 'Something went wrong.';
                }
                setError(errorMessage);
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [invoiceId]);

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

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <div className="original-classic-invoice--error">{error}</div>;
    }

    if (!invoice || !invoice.organization || !invoice.customer || !invoice.products) {
        return <div className="original-classic-invoice--error">Invoice data is incomplete or not available. Please ensure the invoice ID is correct and data exists.</div>;
    }

    //console.log("Invoice data after fetch:", invoice); // Debugging line

    const calculateTotalAmount = () => {
        return (invoice.products || []).reduce((sum, item) => sum + item.totalAmount, 0);
    };

    const calculateTotalGSTAmount = () => {
        return (invoice.products || []).reduce((sum, item) => sum + item.gstAmount, 0);
    };

    const formatCurrency = (amount) => {
        return `₹ ${parseFloat(amount).toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const convertNumberToWords = (num) => {
        const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
        const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        const numToWords = (n) => {
            if ((n = n.toString()).length > 9) return 'overflow';
            const n_string = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n_string) return '';
            let str = '';
            str += (parseInt(n_string[1]) !== 0) ? (a[Number(n_string[1])] || b[n_string[1][0]] + ' ' + a[n_string[1][1]]) + 'crore ' : '';
            str += (parseInt(n_string[2]) !== 0) ? (a[Number(n_string[2])] || b[n_string[2][0]] + ' ' + a[n_string[2][1]]) + 'lakh ' : '';
            str += (parseInt(n_string[3]) !== 0) ? (a[Number(n_string[3])] || b[n_string[3][0]] + ' ' + a[n_string[3][1]]) + 'thousand ' : '';
            str += (parseInt(n_string[4]) !== 0) ? (a[Number(n_string[4])] || b[n_string[4][0]] + ' ' + a[n_string[4][1]]) + 'hundred ' : '';
            str += (parseInt(n_string[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n_string[5])] || b[n_string[5][0]] + ' ' + a[n_string[5][1]]) : '';
            return str;
        };

        if (num === 0) return 'zero';
        const [integer, decimal] = num.toFixed(2).split('.');
        let words = numToWords(integer) + 'Rupees ';
        if (decimal && parseInt(decimal) > 0) {
            words += numToWords(decimal) + 'Paise ';
        }
        return words.trim() + 'Only';
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
                <div className="original-classic-invoice-gradient">
                    <div className="original-classic-invoice-container">
                        <div className="original-classic-invoice-header">
                            <div className="original-classic-invoice-header-top">
                                <div className="original-classic-invoice-header-text">TAX INVOICE</div>
                                <div className="original-classic-invoice-header-text-right">Business Karna Ka Naya Tarika</div>
                            </div>

                            <div className="original-classic-invoice-company-details">
                                <div className="original-classic-invoice-logo">
                                    {invoice.organization?.logo && (
                                        <img src={invoice.organization.logo} alt="Organization Logo" />
                                    )}
                                </div>
                                <div className="original-classic-invoice-company-info">
                                    <h2>{invoice.organization?.name}</h2>
                                    <p>{invoice.organization?.address}</p>
                                    <p>GSTIN: {invoice.organization?.gstin}</p>
                                    <p>Mobile: {invoice.organization?.contactNumber}</p>
                                </div>
                                <div className="original-classic-invoice-invoice-details">
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td>Invoice No.</td>
                                                <td>{invoice.invoiceNumber}</td>
                                            </tr>
                                            <tr>
                                                <td>Invoice Date</td>
                                                <td>{formatDate(invoice.invoiceDate)}</td>
                                            </tr>
                                            <tr>
                                                <td>Due Date</td>
                                                <td>{formatDate(invoice.dueDate)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="original-classic-invoice-bill-ship-to">
                                <div className="original-classic-invoice-bill-to">
                                    <h3>BILL TO</h3>
                                    <h4>{invoice.customer?.customerName}</h4>
                                    <p>Address: {invoice.customer?.address}</p>
                                    <p>GSTIN: {invoice.customer?.gstin}</p>
                                    <p>Mobile: {invoice.customer?.contactNo}</p>
                                    <p>Place of Supply: {invoice.customer?.placeOfSupply}</p>
                                </div>
                                <div className="original-classic-invoice-ship-to">
                                    <h3>SHIP TO</h3>
                                    <h4>{invoice.customer?.customerName}</h4>
                                    <p>Address: {invoice.customer?.address}</p>
                                    <p>GSTIN: {invoice.customer?.gstin}</p>
                                    <p>Mobile: {invoice.customer?.contactNo}</p>
                                </div>
                            </div>
                        </div>

                        <div className="original-classic-invoice-table-wrapper">
                            <table className="original-classic-invoice-table">
                                <thead>
                                    <tr>
                                        <th rowSpan="2">S.No.</th>
                                        <th rowSpan="2">ITEMS</th>
                                        <th rowSpan="2">HSN</th>
                                        <th rowSpan="2">QUANTITY</th>
                                        <th rowSpan="2">MRP</th>
                                        <th rowSpan="2">RATE/ITEM</th>
                                        <th rowSpan="2">DISC.</th>
                                        <th colSpan="2">TAX</th>
                                        <th rowSpan="2">AMOUNT</th>
                                    </tr>
                                    <tr>
                                        <th>(%)</th>
                                        <th>AMT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.products?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {item.productName}
                                                {item.imeiNumber && <span><br />IMEI: {item.imeiNumber}</span>}
                                                {item.serialNumber && <span><br />Serial: {item.serialNumber}</span>}
                                            </td>
                                            <td>{item.hsnSac}</td>
                                            <td>{item.quantity} {item.unit}</td>
                                            <td>{formatCurrency(item.mrp)}</td>
                                            <td>{formatCurrency(item.rate)}</td>
                                            <td>{formatCurrency(item.discount)}</td>
                                            <td>{item.gstRate}%</td>
                                            <td>{formatCurrency(item.gstAmount)}</td>
                                            <td>{formatCurrency(item.totalAmount)}</td>
                                        </tr>
                                    ))}
                                    {/* Dummy rows to fill space */}
                                    {Array.from({ length: Math.max(0, 10 - (invoice.products?.length || 0)) }).map((_, i) => (
                                        <tr key={`dummy-${i}`} className="original-classic-invoice-dummy-row">
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan="7" className="original-classic-invoice-summary-label">Delivery Charges</td>
                                        <td colSpan="3" className="original-classic-invoice-summary-value">{formatCurrency(invoice.deliveryCharges || 0)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="7" className="original-classic-invoice-summary-label">Packing Charges</td>
                                        <td colSpan="3" className="original-classic-invoice-summary-value">{formatCurrency(invoice.packingCharges || 0)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="7" className="original-classic-invoice-summary-label">Round Off</td>
                                        <td colSpan="3" className="original-classic-invoice-summary-value">{formatCurrency(invoice.roundOff || 0)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="7" className="original-classic-invoice-summary-label">Discount</td>
                                        <td colSpan="3" className="original-classic-invoice-summary-value">{formatCurrency(invoice.totalDiscount || 0)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="7" className="original-classic-invoice-total-label">TOTAL AMOUNT</td>
                                        <td colSpan="3" className="original-classic-invoice-total-value">{formatCurrency(calculateTotalAmount())}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="7" className="original-classic-invoice-received-label">RECEIVED AMOUNT</td>
                                        <td colSpan="3" className="original-classic-invoice-received-value">{formatCurrency(invoice.receivedAmount || 0)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="7" className="original-classic-invoice-balance-label">BALANCE AMOUNT</td>
                                        <td colSpan="3" className="original-classic-invoice-balance-value">{formatCurrency(invoice.balanceAmount || 0)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="original-classic-invoice-gst-summary">
                            <table className="original-classic-invoice-gst-table">
                                <thead>
                                    <tr>
                                        <th rowSpan="2">HSN/SAC</th>
                                        <th rowSpan="2">Taxable Value</th>
                                        <th colSpan="2">CGST</th>
                                        <th colSpan="2">SGST</th>
                                        <th rowSpan="2">Total Tax Amount</th>
                                    </tr>
                                    <tr>
                                        <th>Rate</th>
                                        <th>Amount</th>
                                        <th>Rate</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Assuming invoice.gstSummary is an array of objects like:
                                    { hsnSac: '123456', taxableValue: 15000, cgstRate: '9%', cgstAmount: 1350, sgstRate: '9%', sgstAmount: 1350, totalTaxAmount: 2700 }
                                    */}
                                    {invoice.gstSummary?.map((gstItem, index) => (
                                        <tr key={index}>
                                            <td>{gstItem.hsnSac}</td>
                                            <td>{formatCurrency(gstItem.taxableValue)}</td>
                                            <td>{gstItem.cgstRate}</td>
                                            <td>{formatCurrency(gstItem.cgstAmount)}</td>
                                            <td>{gstItem.sgstRate}</td>
                                            <td>{formatCurrency(gstItem.sgstAmount)}</td>
                                            <td>{formatCurrency(gstItem.totalTaxAmount)}</td>
                                        </tr>
                                    ))}
                                    {/* Dummy rows to fill space */}
                                    {Array.from({ length: Math.max(0, 3 - (invoice.gstSummary?.length || 0)) }).map((_, i) => (
                                        <tr key={`gst-dummy-${i}`} className="original-classic-invoice-dummy-row">
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="original-classic-invoice-amount-in-words">
                            <p>Amount Chargeable (in words)</p>
                            <b>{convertNumberToWords(calculateTotalAmount())}</b>
                        </div>

                        <div className="original-classic-invoice-footer">
                            <div className="original-classic-invoice-notes-bank">
                                <div className="original-classic-invoice-notes">
                                    <p>Notes</p>
                                    <p>Details of advances as well as adjustment of same against invoices to be adjusted and not shown separately</p>
                                </div>
                                <div className="original-classic-invoice-bank-details">
                                    <p>BANK DETAILS</p>
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td>IFSC CODE</td>
                                                <td>{invoice.organization?.ifscCode}</td>
                                            </tr>
                                            <tr>
                                                <td>Account Number</td>
                                                <td>{invoice.organization?.bankAccountNumber}</td>
                                            </tr>
                                            <tr>
                                                <td>Bank Name</td>
                                                <td>{invoice.organization?.bankName}</td>
                                            </tr>
                                            <tr>
                                                <td>Branch Name</td>
                                                <td>{invoice.organization?.bankBranch}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="original-classic-invoice-terms">
                                <p>Terms & Conditions</p>
                                <p>Details of advances as well as adjustment of same against invoices to be adjusted and not shown separately</p>
                            </div>
                            <div className="original-classic-invoice-signature">
                                {invoice.organization?.signature_image && (
                                     <img src={invoice.organization.signature_image} alt="Signature" className="original-classic-invoice-signature-img" />
                                )}
                                <p>Authorised Signatory for</p>
                                <p>{invoice.organization?.name}</p>
                            </div>
                            <div className="original-classic-invoice-page-number">
                                <p>Page 1</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OriginalClassicInvoicePdf; 