import { useState, useEffect } from "react";

// Sample static data - this would be replaced with API calls in a real application
const samplePurchaseData = [
  {
    purchase_id: 1,
    expenses_number: "INV-2025-001",
    supplier_name: "Tech Supplies Ltd.",
    purchase_date: "2025-01-15",
    due_date: "2025-02-15",
    total_amount: 45000.00,
    payment_status: "Paid",
    items_count: 12,
    notes: "Annual hardware refresh",
    items: Array(12).fill({ item_name: "", quantity: "", price: "", total: "" })
  },
  {
    purchase_id: 2,
    expenses_number: "INV-2025-002",
    supplier_name: "Office Solutions Inc.",
    purchase_date: "2025-02-10",
    due_date: "2025-03-10",
    total_amount: 12500.50,
    payment_status: "Pending",
    items_count: 8,
    notes: "Office supplies quarterly order",
    items: Array(8).fill({ item_name: "", quantity: "", price: "", total: "" })
  },
  {
    purchase_id: 3,
    expenses_number: "INV-2025-003",
    supplier_name: "Global Electronics",
    purchase_date: "2025-02-25",
    due_date: "2025-03-25",
    total_amount: 87350.25,
    payment_status: "Partially Paid",
    items_count: 15,
    notes: "New server equipment",
    items: Array(15).fill({ item_name: "", quantity: "", price: "", total: "" })
  },
  {
    purchase_id: 4,
    expenses_number: "INV-2025-004",
    supplier_name: "Digital Systems",
    purchase_date: "2025-03-05",
    due_date: "2025-04-05",
    total_amount: 22680.00,
    payment_status: "Paid",
    items_count: 7,
    notes: "Software licenses renewal",
    items: Array(7).fill({ item_name: "", quantity: "", price: "", total: "" })
  },
  {
    purchase_id: 5,
    expenses_number: "INV-2025-005",
    supplier_name: "Furniture Depot",
    purchase_date: "2025-03-15",
    due_date: "2025-04-15",
    total_amount: 35750.75,
    payment_status: "Pending",
    items_count: 10,
    notes: "Office furniture for new wing",
    items: Array(10).fill({ item_name: "", quantity: "", price: "", total: "" })
  },
  {
    purchase_id: 6,
    expenses_number: "INV-2025-006",
    supplier_name: "Network Solutions",
    purchase_date: "2025-04-01",
    due_date: "2025-05-01",
    total_amount: 18500.00,
    payment_status: "Paid",
    items_count: 5,
    notes: "Network hardware upgrade",
    items: Array(5).fill({ item_name: "", quantity: "", price: "", total: "" })
  },
  {
    purchase_id: 7,
    expenses_number: "INV-2025-007",
    supplier_name: "Tech Supplies Ltd.",
    purchase_date: "2025-04-10",
    due_date: "2025-05-10",
    total_amount: 9250.30,
    payment_status: "Pending",
    items_count: 3,
    notes: "Replacement parts",
    items: Array(3).fill({ item_name: "", quantity: "", price: "", total: "" })
  },
  {
    purchase_id: 8,
    expenses_number: "INV-2025-008",
    supplier_name: "Office Solutions Inc.",
    purchase_date: "2025-04-18",
    due_date: "2025-05-18",
    total_amount: 15680.45,
    payment_status: "Paid",
    items_count: 9,
    notes: "General office supplies",
    items: Array(9).fill({ item_name: "", quantity: "", price: "", total: "" })
  },
  {
    purchase_id: 9,
    expenses_number: "INV-2025-009",
    supplier_name: "Global Electronics",
    purchase_date: "2025-05-01",
    due_date: "2025-06-01",
    total_amount: 67890.00,
    payment_status: "Partially Paid",
    items_count: 20,
    notes: "IT department equipment",
    items: Array(20).fill({ item_name: "", quantity: "", price: "", total: "" })
  },
  {
    purchase_id: 10,
    expenses_number: "INV-2025-010",
    supplier_name: "Digital Systems",
    purchase_date: "2025-05-10",
    due_date: "2025-06-10",
    total_amount: 31420.75,
    payment_status: "Pending",
    items_count: 12,
    notes: "Annual software subscription",
    items: Array(12).fill({ item_name: "", quantity: "", price: "", total: "" })
  },
  {
    purchase_id: 11,
    expenses_number: "INV-2025-011",
    supplier_name: "Stationery Wholesale",
    purchase_date: "2025-05-15",
    due_date: "2025-06-15",
    total_amount: 4560.25,
    payment_status: "Paid",
    items_count: 25,
    notes: "Office stationery bulk order",
    items: Array(25).fill({ item_name: "", quantity: "", price: "", total: "" })
  },
  {
    purchase_id: 12,
    expenses_number: "INV-2025-012",
    supplier_name: "Maintenance Supplies Co.",
    purchase_date: "2025-05-17",
    due_date: "2025-06-17",
    total_amount: 7825.50,
    payment_status: "Pending",
    items_count: 18,
    notes: "Maintenance supplies quarterly order",
    items: Array(18).fill({ item_name: "", quantity: "", price: "", total: "" })
  }
];

// Mock API call to fetch purchases
const fetchPurchasesFromAPI = async () => {
  // In a real application, this would be an API call
  // Simulating API call with a timeout
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(samplePurchaseData);
    }, 500);
  });
};

// Mock API call to delete a purchase
export const deletePurchase = async (purchaseId) => {
  // In a real application, this would be an API call
  // Here we're just simulating the process
  console.log(`Delete purchase API called with ID: ${purchaseId}`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a sample response similar to what an API might return
      resolve({ success: true, message: "Purchase deleted successfully", purchaseId });
    }, 800);
  });
};

// Hook for purchase page controller
export const usePurchaseController = () => {
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter purchases based on search term
  const filteredPurchases = purchases.filter((purchase) => {
    const searchTerm = search.toLowerCase();
    return (
      purchase.expenses_number.toLowerCase().includes(searchTerm) ||
      purchase.supplier_name.toLowerCase().includes(searchTerm) ||
      purchase.payment_status.toLowerCase().includes(searchTerm)
    );
  });

  // Fetch purchases from API
  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const data = await fetchPurchasesFromAPI();
      setPurchases(data);
    } catch (error) {
      console.error("Failed to fetch purchases:", error);
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
    fetchPurchases
  };
};