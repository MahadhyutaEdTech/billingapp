import {createProduct,getProduct,updateProduct,deleteProduct,getProductById} from "../models/productModel.js"

const registerProducts=async(req,res)=>{
    const{product_name, description, sku, hsn_sac, unit_price, cost_price, product_type,tax,quantity}= req.body;
    try{
        await createProduct(product_name, description, sku, hsn_sac, unit_price, cost_price, product_type,tax,quantity);
        res.status(201).json({message:"Product registered successfully", data: res.body});
    }
    catch(error){
        console.log(error);
      res.status(500).json({message:"Server Error",error});
    }
}

const allProducts=async(req,res)=>{
const page = parseInt(req.query.page) || 1; // Default to page 1
const limit = parseInt(req.query.limit) || 10; // Default to 10 records per page
const offset = (page - 1) * limit;

    if (isNaN(limit) || isNaN(offset)) {
        return res.status(400).json({ error: "Invalid page or limit values" });
    }
    try{
        const result=await getProduct(limit,offset);
        res.status(200).json(result);

    }
    catch(error){
        console.log(error);
      res.status(500).json({message:"Server Error",error});

    }
}
const updatedProducts= async(req,res)=>{
   try{
    const product_id=req.query.product_id;
    const data=req.body;
    if (!product_id) {
        return res.status(400).json({ message: "product_id is required" });
    }
    const updatedData=await updateProduct(product_id,data);
    res.status(200).json({ message: "Product Data updated successfully", updatedData });
   }
   catch(error){
    res.status(500).json({ message: "Server Error", error:"Error while updating data"});
   }
}

const deleteProducts= async(req,res)=>{
    try{
        const product_id=req.query.product_id;
        if (!product_id) {
            return res.status(400).json({ message: "product_id is required" });
        }
        const updatedData=await deleteProduct(product_id);
        res.status(200).json({ message: "Product Data deleted successfully", updatedData });
    }
    catch(error){
        res.status(500).json({ message: "Server Error", error:"Error while deleting data"});

    }
}


const getProductsById=async(req,res)=>{
    try{
        const product_id=req.query.product_id;
        if (!product_id) {
            return res.status(400).json({ message: "product_id is required" });
        }
        const updatedData=await getProductById(product_id);
        res.status(200).json(updatedData);

    }
    catch(error){
        res.status(500).json({ message: "Server Error", error:"Error while deleting data"});
    }
}
export {registerProducts,allProducts,updatedProducts,deleteProducts,getProductsById};