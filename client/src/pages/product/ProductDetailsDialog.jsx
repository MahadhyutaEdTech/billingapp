import React, { useState, useEffect } from 'react';
import "@/css/modules/product/ProductDetailsDialog.css"; // We will create this CSS file

const ProductDetailsDialog = ({ product, onClose }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

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

    if (!product) return null; // If no product prop is provided, return null (dialog is not open)

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            console.error("Error formatting date:", e);
            return 'N/A';
        }
    };

    return (
        <div className={`product-dialog-overlay ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className="product-dialog-container">
                <div className="product-dialog-header">
                    <h3>Product Details</h3>
                    <div className="button-group">
                        <button className="close-button" onClick={onClose}>×</button>
                    </div>
                </div>
                <div className="product-dialog-body">
                    <div className="product-grid-container">
                        <div className="product-detail-box">
                            <div className="product-label">Product Name</div>
                            <div className="product-value">{product.product_name || 'N/A'}</div>
                        </div>
                        <div className="product-detail-box">
                            <div className="product-label">SKU</div>
                            <div className="product-value">{product.sku || 'N/A'}</div>
                        </div>
                        <div className="product-detail-box">
                            <div className="product-label">HSN/SAC</div>
                            <div className="product-value">{product.hsn_sac || 'N/A'}</div>
                        </div>
                        <div className="product-detail-box">
                            <div className="product-label">Unit Price</div>
                            <div className="product-value">₹{Number(product.unit_price).toFixed(2) || '0.00'}</div>
                        </div>
                        <div className="product-detail-box">
                            <div className="product-label">Cost Price</div>
                            <div className="product-value">₹{Number(product.cost_price).toFixed(2) || '0.00'}</div>
                        </div>
                        <div className="product-detail-box">
                            <div className="product-label">Tax (%)</div>
                            <div className="product-value">{Number(product.tax).toFixed(2) || '0.00'}%</div>
                        </div>
                        <div className="product-detail-box">
                            <div className="product-label">Quantity</div>
                            <div className="product-value">{product.quantity || '0'}</div>
                        </div>
                        <div className="product-detail-box">
                            <div className="product-label">Current Stock</div>
                            <div className="product-value">{product.current_stock || '0'}</div>
                        </div>
                        <div className="product-detail-box">
                            <div className="product-label">Product Type</div>
                            <div className="product-value">{product.product_type || 'N/A'}</div>
                        </div>
                        <div className="product-detail-box full-width">
                            <div className="product-label">Description</div>
                            <div className="product-value">{product.description || 'N/A'}</div>
                        </div>
                    </div>

                    <div className="product-grid-container">
                        
                        <h4>Timestamps</h4>
                        <div className="product-detail-box">
                            <div className="product-label">Created At</div>
                            <div className="product-value">{formatDate(product.created_at)}</div>
                        </div>
                        <div className="product-detail-box">
                            <div className="product-label">Last Updated</div>
                            <div className="product-value">{formatDate(product.updated_at)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsDialog; 