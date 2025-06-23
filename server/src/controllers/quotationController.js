import { 
  createQuotation, 
  getQuotation, 
  updateQuotation, 
  deleteQuotation, 
  getAllQuotations, 
  getFilterQuotations, 
  searchQuotations, 
  countQuotations, 
  statusCount, 
  amountStatus, 
  getTotalCustomers, 
  getAverageQuotationValue,
  convertToInvoice
} from "../models/quotationModel.js";

const createQuotations = async (req, res) => {
  const { 
    customer_id, 
    org_id, 
    quotation_date, 
    valid_until, 
    total_amount, 
    discount, 
    tax_amount, 
    status, 
    created_at, 
    gst_no, 
    gst_number, 
    gst_type, 
    shippingAddresses, 
    products, 
    notes, 
    terms_conditions 
  } = req.body;
  
  console.log("Creating quotation with data:", req.body);
  
  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "Products are required and should be an array." });
  }

  try {
    const result = await createQuotation(
      customer_id, 
      org_id, 
      quotation_date, 
      valid_until, 
      total_amount, 
      discount, 
      tax_amount, 
      status, 
      created_at, 
      gst_no, 
      gst_number, 
      gst_type, 
      shippingAddresses, 
      products, 
      notes, 
      terms_conditions
    );
    res.status(201).json({ 
      message: "Quotation created successfully", 
      quotation_id: result.quotation_id,
      quotation_number: result.quotation_number 
    });
  } catch (error) {
    console.error("Error creating quotation:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getQuotations = async (req, res) => {
  const { quotation_id } = req.query;
  
  if (!quotation_id) {
    return res.status(400).json({ message: "Quotation ID is required" });
  }

  try {
    const result = await getQuotation(quotation_id);
    if (!result || result.length === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching quotation:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateQuotations = async (req, res) => {
  const { quotation_id } = req.query;
  const updateData = req.body;

  if (!quotation_id) {
    return res.status(400).json({ message: "Quotation ID is required" });
  }

  try {
    const result = await updateQuotation(quotation_id, updateData);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    res.status(200).json({ message: "Quotation Data updated successfully" });
  } catch (error) {
    console.error("Error updating quotation:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteQuotations = async (req, res) => {
  const { quotation_id } = req.query;

  if (!quotation_id) {
    return res.status(400).json({ message: "Quotation ID is required" });
  }

  try {
    const result = await deleteQuotation(quotation_id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    res.status(200).json({ message: "Quotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllQuotation = async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;

  try {
    const result = await getAllQuotations(limit, offset);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching all quotations:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getfilerQuotation = async (req, res) => {
  const { status } = req.query;

  try {
    const result = await getFilterQuotations(status);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error filtering quotations:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const searchQuotationsAPI = async (req, res) => {
  const { searchQuery } = req.query;

  if (!searchQuery) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const result = await searchQuotations(searchQuery);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error searching quotations:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const countQuotationsAPI = async (req, res) => {
  try {
    const result = await countQuotations();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error counting quotations:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const statusCounts = async (req, res) => {
  try {
    const result = await statusCount();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting status counts:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const amountStatuses = async (req, res) => {
  try {
    const result = await amountStatus();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting amount statuses:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getTotalCustomersCount = async (req, res) => {
  try {
    const result = await getTotalCustomers();
    res.status(200).json({ total_customers: result });
  } catch (error) {
    console.error("Error getting total customers:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAverageQuotation = async (req, res) => {
  try {
    const result = await getAverageQuotationValue();
    res.status(200).json({ average_value: result });
  } catch (error) {
    console.error("Error getting average quotation value:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const convertQuotationToInvoice = async (req, res) => {
  const { quotation_id } = req.query;

  if (!quotation_id) {
    return res.status(400).json({ message: "Quotation ID is required" });
  }

  try {
    const result = await convertToInvoice(quotation_id);
    res.status(200).json({ 
      message: "Quotation converted to invoice successfully", 
      invoice_id: result.invoice_id 
    });
  } catch (error) {
    console.error("Error converting quotation to invoice:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export {
  createQuotations,
  getQuotations,
  updateQuotations,
  deleteQuotations,
  getAllQuotation,
  getfilerQuotation,
  searchQuotationsAPI,
  countQuotationsAPI,
  statusCounts,
  amountStatuses,
  getTotalCustomersCount,
  getAverageQuotation,
  convertQuotationToInvoice
}; 