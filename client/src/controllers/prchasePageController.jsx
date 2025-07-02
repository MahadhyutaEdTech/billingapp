import { useState, useEffect } from "react";
import axiosInstance from '../utils/axiosConfig';
import { API_BASE } from '../config/config';

// API calls for purchases
const api = {
  fetchPurchases: async () => {
    const userId = localStorage.getItem("userId");
    const response = await axiosInstance.get(`/purchase/purchases?user_id=${userId}`);
    return response.data;
  },

  updatePurchase: async (id, purchaseData) => {
    const userId = localStorage.getItem("userId");
    const response = await axiosInstance.put(`/purchase/purchases/${id}?user_id=${userId}`, purchaseData);
    return response.data;
  },

  deletePurchase: async (id) => {
    const userId = localStorage.getItem("userId");
    const response = await axiosInstance.delete(`/purchase/purchases/${id}?user_id=${userId}`);
    return response.data;
  },

  getPurchaseById: async (id) => {
    const userId = localStorage.getItem("userId");
    const response = await axiosInstance.get(`/purchase/purchases/${id}?user_id=${userId}`);
    return response.data;
  }
};

// Hook for purchase page controller
export const usePurchaseController = () => {
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter purchases based on search term
  const filteredPurchases = purchases.filter((purchase) => {
    if (!search) return true;
    
    const searchTerm = search.toLowerCase().trim();
    return (
      purchase.expenses_number?.toLowerCase().includes(searchTerm) ||
      purchase.supplier_name?.toLowerCase().includes(searchTerm) ||
      purchase.payment_status?.toLowerCase().includes(searchTerm) ||
      purchase.total_amount?.toString().includes(searchTerm)
    );
  });

  // Fetch purchases from API
  const fetchPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchPurchases();
      setPurchases(data);
    } catch (error) {
      setError(error.message);
      console.error("Failed to fetch purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create new purchase
  const createPurchase = async (purchaseData) => {
    setLoading(true);
    setError(null);
    try {
      const newPurchase = await api.createPurchase(purchaseData);
      setPurchases([...purchases, newPurchase]);
      return newPurchase;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update purchase
  const updatePurchase = async (id, purchaseData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPurchase = await api.updatePurchase(id, purchaseData);
      setPurchases(purchases.map(p => p._id === id ? updatedPurchase : p));
      return updatedPurchase;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete purchase
  const deletePurchase = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.deletePurchase(id);
      setPurchases(purchases.filter(p => p._id !== id));
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch purchases on component mount
  useEffect(() => {
    fetchPurchases();
  }, []);

  return {
    purchases,
    setPurchases,
    search,
    setSearch,
    filteredPurchases,
    loading,
    error,
    fetchPurchases,
    createPurchase,
    updatePurchase,
    deletePurchase
  };
};