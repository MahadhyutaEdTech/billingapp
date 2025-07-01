import { createInvoice, getInvoice,updateInvoice,deleteInvoice, getAllInvoices ,getfilterInvoices,searchInvoices,countInvoice,statusCount,amountStatus,getTotalCustomers,getAverageInvoiceValue,getHighestSaleProduct} from "../models/invoiceModel.js";
import connectionPoolPromise from "../config/databaseConfig.js";

const createInvoices = async (req, res) => {
    const { customer_id, org_id,invoice_date, due_date, advance,total_amount,discount,due_amount, tax_amount, status, created_at,gst_no,gst_number,gst_type, shippingAddresses, products } = req.body;
  console.log(req.body);
    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: "Products are required and should be an array." });
    }

    try {
        const result = await createInvoice(customer_id,org_id, invoice_date, due_date,advance, total_amount,discount,due_amount, tax_amount, status, created_at,gst_no,gst_number,gst_type,shippingAddresses, products);
        res.status(201).json({ message: "Invoice created successfully", invoice_id: result.invoice_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


const getInvoices = async (req, res) => {
    const invoice_id = req.query.invoice_id;
    try {
        const result = await getInvoice(invoice_id);
        res.status(200).json(result);

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error", error });
    }


}

const getAllInvoice=async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const result = await getAllInvoices(limit,offset);
        // Get total count
        const connectionPool = await connectionPoolPromise;
        const [[{ total }]] = await connectionPool.execute('SELECT COUNT(*) as total FROM invoices');
        res.status(200).json({ invoices: result, total });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error", error });
    }
}

const countInvoices=async(req,res)=>{
    try {
        const result = await countInvoice();
        res.status(200).json(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error", error });
    }

}
const statusCounts=async(req,res)=>{
    try {
        const result = await statusCount();
        res.status(200).json(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error", error });
    }

}
const amountStatuses=async(req,res)=>{
    try {
        const result = await amountStatus();
        res.status(200).json(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error", error });
    }

}
const updateInvoices = async (req, res) => {

    try{
        const invoice_id=req.query.invoice_id;
        const data=req.body;
        if (!invoice_id) {
            return res.status(400).json({ message: "Invoice ID is required" });
        }
        const updatedInvoice=await updateInvoice(invoice_id,data);
        res.status(200).json({ message: "Invoice Data updated successfully", updatedInvoice });
       }
       catch(error){
        res.status(500).json({ message: "Server Error", error:"Error while updating data"});
       }


}

const deleteInvoices = async (req, res) => {

    try{
        const invoice_id=req.query.invoice_id;
        if (!invoice_id) {
            return res.status(400).json({ message: "Invoice ID is required" });
        }
        const deletedData=await deleteInvoice(invoice_id);
        res.status(200).json({ message: "Invoice Data deleted successfully", deletedData });

    }
    catch(error){
        res.status(500).json({ message: "Server Error", error:"Error while deleting data"});

    }

}

const getfilerInvoice=async(req,res)=>{
    const status=req.query.status;
    try {
        const result = await getfilterInvoices(status);
        res.status(200).json(result);

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error", error });
    }
}

const searchInvoicesAPI = async (req, res) => {
    try {
        const searchQuery = req.query.query;
    

        if (!searchQuery) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const results = await searchInvoices(searchQuery);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error in invoice search:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

const getTotalCustomersCount = async (req, res) => {
  try {
    const result = await getTotalCustomers();
    res.status(200).json({ total_customers: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

const getAverageInvoice = async (req, res) => {
  try {
    console.log("📤 Fetching average invoice value...");
    const result = await getAverageInvoiceValue();
    console.log("✅ Average invoice value:", result);
    
    // Ensure we're sending a number
    const averageValue = parseFloat(result) || 0;
    console.log("💰 Formatted average value:", averageValue);
    
    res.status(200).json({ 
      average_value: averageValue,
      message: "Average invoice value calculated successfully"
    });
  } catch (error) {
    console.error("❌ Error in getAverageInvoice:", error);
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message,
      average_value: 0 
    });
  }
};

const getHighestSaleProducts = async (req, res) => {
  try {
    console.log("📤 Fetching highest sale products...");
    const result = await getHighestSaleProduct();
    console.log("✅ Highest sale products:", result);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error in getHighestSaleProducts:", error);
    res.status(500).json({ 
      message: "Server Error", 
      error: error.message,
      data: [] 
    });
  }
};

export {createInvoices, getInvoices, updateInvoices, deleteInvoices,getAllInvoice,getfilerInvoice,searchInvoicesAPI,countInvoices,statusCounts,amountStatuses,getTotalCustomersCount,getAverageInvoice,getHighestSaleProducts};
