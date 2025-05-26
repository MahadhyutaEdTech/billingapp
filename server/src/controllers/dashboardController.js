import {monthlyRevenue,highestSale,profitTrend} from '../models/dashboardModel.js';

const monthlyRevenues= async(req,res)=>{
    try{
        const result= await monthlyRevenue();
        res.status(200).json(result);
    }
    catch(e){
        res.status(500).json({message:"Server Error",e});

    }

}


const highestSales=async(req,res)=>{
    try{
        const result= await highestSale();
        res.status(200).json(result);
    }
    catch(e){
        
        res.status(500).json({message:"Server Error",e});
    }
    
}



const profitTrends=async(req,res)=>{
    try{
        const result= await profitTrend();
        res.status(200).json(result);
    }
    catch(e){
        res.status(500).json({message:"Server Error",e});
        
    }
    
}


export{monthlyRevenues,highestSales,profitTrends};