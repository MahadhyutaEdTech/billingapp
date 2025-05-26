import {createCustomers,getCustomers,updateCustomers,deleteCustomers,searchCustomers} from "../models/customerModel.js"

const registerCustomers=async(req,res)=>{
    const{first_name,last_name,email,phone,cust_gst_details,created_at,updated_at}= req.body;
    console.log(req.body);
    try{
        await createCustomers(first_name,last_name,email,phone,cust_gst_details,created_at,updated_at);
        res.status(201).json({message:"User registered successfully", data: res.body});

    }
    catch(error){
        console.log(error);
      res.status(500).json({message:"Server Error",error});

    }
}
const allCustomers=async(req,res)=>{
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const offset = (page - 1) * limit;

    if (isNaN(limit) || isNaN(offset)) {
        return res.status(400).json({ error: "Invalid page or limit values" });
    }
    try{
        const result=await getCustomers(limit,offset);
        res.status(200).json(result);
    }
    catch(error){
      
      res.status(500).json({message:"Server Error",error});

    }
}
const updatedCustomers= async(req,res)=>{
   try{
    const customer_id=req.query.customer_id;
    const data=req.body;
    if (!customer_id) {
        return res.status(400).json({ message: "Customer ID is required" });
    }
    const updatedData=await updateCustomers(customer_id,data);
    res.status(200).json({ message: "Customer Data updated successfully", updatedData });
   }
   catch(error){
    res.status(500).json({ message: "Server Error", error:"Error while updating data"});
   }
}

const deleteData= async(req,res)=>{
    try{
        const customer_id=req.query.customer_id;
        if (!customer_id) {
            return res.status(400).json({ message: "Customer ID is required" });
        }
        const updatedData=await deleteCustomers(customer_id);
        res.status(200).json({ message: "Customer Data deleted successfully", updatedData });

    }
    catch(error){
        res.status(500).json({ message: "Server Error", error:"Error while deleting data"});

    }
}
const searchCustomersAPI = async (req, res) => {
    try {
        const searchQuery = req.query.query;
        if (!searchQuery) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const results = await searchCustomers(searchQuery);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error in global search:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};
export {registerCustomers,allCustomers,updatedCustomers,deleteData,searchCustomersAPI} ;