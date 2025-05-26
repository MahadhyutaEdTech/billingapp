import { useEffect, useState } from "react";
import { fetchAllCustomers, fetchSearchedCustomers, deleteCustomer } from "../models/CustomerModel";

const useCustomerController = (searchTerm, page) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const data = searchTerm ? await fetchSearchedCustomers(searchTerm) : await fetchAllCustomers(page);
        setCustomers(data.customers || data || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        setError("Error fetching customers.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [page, searchTerm]);

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteCustomer(customerId);
        setCustomers(customers.filter(customer => customer.customer_id !== customerId));
      } catch (error) {
        // handle error if needed
      }
    }
  };

  return {
    customers,
    setCustomers, // <-- add this
    loading,
    error,
    totalPages,
    handleDeleteCustomer,
    
  };
};

// Default export for Fast Refresh compatibility
export default useCustomerController;
