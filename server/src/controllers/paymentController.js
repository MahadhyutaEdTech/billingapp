import {getPayment,createPayment} from "../models/paymentModel.js"

const getPayments=async(req,res)=>{
    
    try{
        const result=await getPayment();
        res.status(200).json(result);
    }
    catch(error){
        console.log(error);
      res.status(500).json({message:"Server Error",error});
    }
}


const createPaymets=async(req,res)=>{
    const{payment_id,invoice_id,payment_date,payment_amount,payment_method,payment_status}=req.body;
    try{
        const result=await createPayment(payment_id,invoice_id,payment_date,payment_amount,payment_method,payment_status);
        res.status(201).json({ message: "payment created successfully", data: res.body });

    }
    catch(error){

        console.log(error);
        res.status(500).json({message:"Server Error",error});
    }

}

export {getPayments,createPaymets};