import { createTaxs, updateTaxs,getTaxs,deleteTaxs } from "../models/taxModel.js";
const createTax=async(req,res)=>{
    const {tax_type,tax_rate,valid_from,valid_untill}=req.body;
    try{
        await createTaxs(tax_type,tax_rate,valid_from,valid_untill);
        res.status(201).json({message:"Tax created",data:res.body});
    }
    catch(e){
        console.log(error);
      res.status(500).json({message:"Server Error",error});
    }
}

//getting all tax
const getTax=async(req,res)=>{
    try{
       const result= await getTaxs();
        res.status(200).json(result);
    }
    catch(error){
        console.log(error);
      res.status(500).json({message:"Server Error",error});
    }
}
//updating taxes
const updateTax=async(req,res)=>{
    try{
        const tax_id=req.query.tax_id;
        const data=req.body;
        const updatedData=await updateTaxs(tax_id,data);
        res.status(200).json({ message: "Tax Data updated successfully", updatedData });

    }
    catch(e){
        console.log(error);
      res.status(500).json({message:"Server Error",error});

    }
}

const deleteTax=async(req,res)=>{

    try{
        
        const tax_id=req.query.tax_id;
        if (!tax_id) {
            return res.status(400).json({ message: "tax_id is required" });
        }
        const updatedData=await deleteTaxs(tax_id);
        res.status(200).json({ message: "Tax deleted successfully", updatedData });

    }
    catch(e){
        console.log(error);
      res.status(500).json({message:"Server Error",error});

    }
}

export {createTax,getTax,updateTax,deleteTax};