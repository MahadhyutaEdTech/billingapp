import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Keep useNavigate for potential future redirects if needed, but remove useParams
import axios from 'axios';
import { API_BASE } from '../../config/config';
import '../../css/modules/invoice/InvoiceDetailsPage.css'; // We will create this CSS file
import Spinner from '../../components/Spinner';

const InvoiceDetailsPage = ({ invoice, onClose }) => {
    // Remove invoiceId from useParams and internal state management for invoice, loading, error
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Assume invoice prop contains the data, no need to fetch here
    useEffect(() => {
        // Dark mode detection
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDarkMode(document.documentElement.classList.contains('dark-mode'));
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

    // If no invoice prop is provided, return null (dialog is not open)
    if (!invoice) return null;

    const handlePrint = () => {
        window.print();
    };

    // Safely parse JSON fields if they are strings
    const customerDetails = typeof invoice.customer_details === 'string' 
        ? JSON.parse(invoice.customer_details) 
        : invoice.customer_details;
    const products = typeof invoice.products === 'string' 
        ? JSON.parse(invoice.products) 
        : invoice.products;

    return (
        <div className={`invoice-detail-dialog-overlay ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className="invoice-detail-dialog-container">
                <div className="invoice-detail-dialog-header">
                    <h3>Invoice Details</h3>
                    <button className="invoice-detail-close-button" onClick={onClose}>×</button>
                </div>
                <div className="invoice-detail-dialog-body">
                    <div className="invoice-detail-grid-container">
                        <div className="invoice-detail-box">
                            <h4>Invoice Information</h4>
                            <p className="invoice-detail-label">Invoice Number</p>
                            <p className="invoice-detail-value">{invoice.invoice_number || 'N/A'}</p>
                            <p className="invoice-detail-label">Date</p>
                            <p className="invoice-detail-value">{new Date(invoice.invoice_date).toLocaleDateString() || 'N/A'}</p>
                            <p className="invoice-detail-label">Due Date</p>
                            <p className="invoice-detail-value">{new Date(invoice.due_date).toLocaleDateString() || 'N/A'}</p>
                        </div>

                        <div className="invoice-detail-box">
                            <h4>Customer Information</h4>
                            <p className="invoice-detail-label">Name</p>
                            <p className="invoice-detail-value">{`${customerDetails?.first_name || ''} ${customerDetails?.last_name || ''}`}</p>
                            <p className="invoice-detail-label">Email</p>
                            <p className="invoice-detail-value">{customerDetails?.email || 'N/A'}</p>
                            <p className="invoice-detail-label">Phone</p>
                            <p className="invoice-detail-value">{customerDetails?.phone || 'N/A'}</p>
                        </div>

                        <div className="invoice-detail-box">
                            <h4>Payment Details</h4>
                            <p className="invoice-detail-label">Total Amount</p>
                            <p className="invoice-detail-value">₹{Number(invoice.total_amount).toFixed(2) || '0.00'}</p>
                            <p className="invoice-detail-label">Status</p>
                            <p className={`invoice-detail-value ${invoice.status === 'paid' ? 'invoice-detail-credit' : 'invoice-detail-debit'}`}>
                                {invoice.status || 'N/A'}
                            </p>
                        </div>

                        <div className="invoice-detail-box full-width">
                            <h4>Items</h4>
                            {products && products.length > 0 ? (
                                <table className="invoice-detail-items-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product, index) => (
                                            <tr key={index}>
                                                <td>{product.product_name}</td>
                                                <td>{product.quantity}</td>
                                                <td>₹{Number(product.unit_price).toFixed(2)}</td>
                                                <td>₹{Number(product.quantity * product.unit_price).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-data">No products found for this invoice.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="invoice-detail-dialog-footer">
                    <button className="invoice-detail-primary-button" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsPage; 