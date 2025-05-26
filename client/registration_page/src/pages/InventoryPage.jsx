import React, { useEffect, useState, useCallback } from "react";
import { FaEdit, FaSearch } from "react-icons/fa";
import InventoryUpdate from "../components/InventoryUpdate";
import "../css/Inventory.css"; // Include styles
import { API_BASE } from "../config/config";

const InventoryPage = () => {
  const [products, setProducts] = useState([]); // ✅ Ensure products starts as an array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState(""); // New state for search input

  // ✅ Wrap fetchProducts in useCallback to prevent unnecessary re-renders
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/products/get`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Uses dynamic token
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data); // ✅ Ensure response is an array
        } else {
          console.error("Unexpected API response:", data);
          setError("Invalid response from server.");
          setProducts([]); // Prevent crashes
        }
      } else {
        console.error("Error fetching products:", response.statusText);
        setError("Failed to load products.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // ✅ Now correctly updates when dependencies change

  const handleUpdateClick = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="inventory-container">
      <section className="inventory-section">
        <div className="inventory-fix-header">
          <div className="inventory-title">
            <h2>Inventory</h2>
          </div>
          
          <div className="inventory-controls">
            <div className="inventory-search-bar">
              <input
                type="text"
                placeholder="Search Product"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="inventory-search-icon">
                <FaSearch className="search-icon" />
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <p className="error-message">❌ Error: {error}</p>
        ) : (
          <div className="inventory-table-container">
            <div className="table-scroll-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Stock</th>
                    <th>Current Stock</th>
                    <th>Unit Price</th>
                    <th>Cost Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product._id}>
                        <td>{product.product_name}</td>
                        <td>{product.sku}</td>
                        <td>{product.quantity}</td>
                        <td>{product.current_stock || "N/A"}</td>
                        <td className="text-right">₹{product.unit_price}</td>
                        <td className="text-right">₹{product.cost_price}</td>
                        <td className="inventory-action">
                          <span className="icon-btn" onClick={() => handleUpdateClick(product)}>
                            <FaEdit className="icon" />
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-products">No products found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
      
      
      {selectedProduct && (
        <InventoryUpdate
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdate={fetchProducts}
        />
      )}
    </div>
  );
};

export default InventoryPage;