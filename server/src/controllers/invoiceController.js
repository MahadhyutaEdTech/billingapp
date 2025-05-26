import { createInvoice, getInvoice,updateInvoice,deleteInvoice, getAllInvoices ,getfilterInvoices,searchInvoices,countInvoice,statusCount,amountStatus} from "../models/invoiceModel.js";
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
    const page = parseInt(req.query.page) || 1; 1
const limit = parseInt(req.query.limit) || 10; 
const offset = (page - 1) * limit;

    try {
        const result = await getAllInvoices(limit,offset);
        res.status(200).json(result);

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

export {createInvoices, getInvoices, updateInvoices, deleteInvoices,getAllInvoice,getfilerInvoice,searchInvoicesAPI,countInvoices,statusCounts,amountStatuses};
