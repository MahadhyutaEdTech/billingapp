import { useState, useEffect, useMemo } from "react";
import axiosInstance from '../utils/axiosConfig';
import { Product } from "../models/productPageModel";
import { API_BASE } from "../config/config";
import { toast } from "react-toastify";

// Function to get the token from localStorage
const getAuthToken = () => localStorage.getItem("authToken");

export function useProductController() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch Products from API
  const fetchProducts = async () => {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      toast.error("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const url = `${API_BASE}/products/get`;
      console.log("Fetching:", url);

      const response = await axiosInstance.get(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      console.log("✅ API Response:", response.data);

      let productData = response.data;

      if (Array.isArray(productData)) {
        productData = { products: productData }; // Wrap array in object if necessary
      }

      if (productData && Array.isArray(productData.products)) {
        const formattedProducts = productData.products.map((item) => Product.fromData(item));
        setProducts(formattedProducts);
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error.message);
      toast.error("Error fetching products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Derived Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.product_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    search,
    setSearch,
    filteredProducts,
    setProducts,
    fetchProducts,
    loading,
    setLoading
  };
}

// 🔹 Fetch product by ID
export const fetchProductById = async (productId) => {
  const token = getAuthToken();
  if (!token) {
    toast.error("User not authenticated. Please log in.");
    return null;
  }

  try {
    const url = `${API_BASE}/products/get/${productId}`;
    console.log("Fetching Product:", url);
    
    const response = await axiosInstance.get(url, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    console.log("✅ Product Response:", response.data);
    return Product.fromData(response.data); // Convert to model if needed
  } catch (error) {
    console.error("❌ Error fetching product:", error.message);
    toast.error("Error fetching product details.");
    return null;
  }
};

// 🔹 Delete product
export const deleteProduct = async (id) => {
  const token = getAuthToken();
  if (!token) {
    toast.error("User not authenticated. Please log in.");
    return false;
  }

  try {
    const confirmDelete = window.confirm(`Are you sure you want to delete Product ID: ${id}?`);
    if (!confirmDelete) return false;

    const url = `${API_BASE}/products/delete?product_id=${id}`;
    console.log(`🛠 Sending DELETE request to:`, url);

    await axiosInstance.delete(url, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    toast.success("✅ Product deleted successfully!");
    return true;  // Successfully deleted
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    toast.error("Error deleting product. Please try again.");
    return false;  // Error in deleting
  }
};

// Export other functions as named exports
