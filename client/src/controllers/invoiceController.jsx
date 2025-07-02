import { useState, useEffect } from "react";
import axios from "axios";
import { fetchInvoices ,searchInvoice, fetchInvoiceById} from "../models/invoiceModel";

const useInvoices = () => {
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [query,setQuery] =useState("");
  const [invoiceDetailsLoading, setInvoiceDetailsLoading] = useState(false); // New loading state for details
  const [invoiceDetailsError, setInvoiceDetailsError] = useState(null); // New error state for details

  // Fetch invoices when the page changes
  useEffect(() => {
    const getInvoices = async () => {
      setLoading(true);
      setError(null);

      try {
        const { invoices, total } = await fetchInvoices(page, 10);
        setInvoices(invoices);
        setFilteredInvoices(invoices);
        setTotalPages(Math.ceil(total / 10));
      } catch (err) {
        setError("Failed to load invoices");
        setInvoices([]);
        setFilteredInvoices([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    getInvoices();
  }, [page]);

  // Debounce search input (wait 500ms before setting query)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (debouncedQuery) {
      const fetchSearchResults = async () => {
        try {
          const result = await searchInvoice(debouncedQuery);
          //console.log("🔍 Setting Filtered Invoices:", result); // Debugging
          setFilteredInvoices(result); // ✅ Update table data
        } catch (error) {
          console.error("🔥 Error searching invoices:", error);
          setFilteredInvoices([]); // Show empty results if search fails
        }
      };
  
      fetchSearchResults();
    } else {
      setFilteredInvoices(invoices); // ✅ Reset to full list when search is cleared
    }
  }, [debouncedQuery, invoices]);
  
  const getInvoiceDetailsForDisplay = async (invoiceId) => {
    setInvoiceDetailsLoading(true);
    setInvoiceDetailsError(null);
    try {
      const details = await fetchInvoiceById(invoiceId);
      if (!details) {
        setInvoiceDetailsError("Invoice details not found.");
        return null;
      }
      return details;
    } catch (err) {
      console.error("Error fetching invoice details for display:", err);
      setInvoiceDetailsError("Failed to load invoice details.");
      return null;
    } finally {
      setInvoiceDetailsLoading(false);
    }
  };

  return {
    search,
    setSearch,
    filteredInvoices,
    loading,
    error,
    setInvoices,
    page,
    setPage,
    totalPages,
    getInvoiceDetailsForDisplay,
    invoiceDetailsLoading,
    invoiceDetailsError,
    setFilteredInvoices,
    fetchInvoices
  };
};

export default useInvoices;