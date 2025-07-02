import {monthlyRevenue,highestSale,profitTrend} from '../models/dashboardModel.js';

const monthlyRevenues = async(req,res)=>{
    try{
        const { user_id } = req.query;
        if (!user_id) return res.status(400).json({ message: "User ID is required" });
        
        const result = await monthlyRevenue(user_id);
        if (!result) return res.status(404).json({ message: "No data found" });
        
        res.status(200).json(result);
    }
    catch(e){
        console.error('Monthly Revenue Error:', e);
        res.status(500).json({message: "Server Error", error: e.message});
    }
}

const highestSales = async(req,res)=>{
    try{
        const { user_id } = req.query;
        if (!user_id) return res.status(400).json({ message: "User ID is required" });
        
        const result = await highestSale(user_id);
        if (!result) return res.status(404).json({ message: "No data found" });
        
        res.status(200).json(result);
    }
    catch(e){
        console.error('Highest Sale Error:', e);
        res.status(500).json({message: "Server Error", error: e.message});
    }
}

const profitTrends = async(req,res)=>{
    try{
        const { user_id } = req.query;
        if (!user_id) return res.status(400).json({ message: "User ID is required" });
        
        const result = await profitTrend(user_id);
        if (!result) return res.status(404).json({ message: "No data found" });
        
        res.status(200).json(result);
    }
    catch(e){
        console.error('Profit Trend Error:', e);
        res.status(500).json({message: "Server Error", error: e.message});
    }
}

export{monthlyRevenues,highestSales,profitTrends};