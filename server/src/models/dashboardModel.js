import connectionPool from "../config/databaseConfig.js";

const monthlyRevenue=async()=>{
    const sqlQuery=`SELECT 
    DATE_FORMAT(created_at, '%Y-%m') AS month, 
    SUM(total_amount) AS revenue 
FROM invoices 
GROUP BY month 
ORDER BY month DESC`;
const [res]=await connectionPool.execute(sqlQuery);
return res;
}

const highestSale=async()=>{
    const sqlQuery=`SELECT 
    p. product_name , 
    SUM(ii.quantity) AS total_sold 
FROM invoice_items ii
JOIN product p ON ii.product_id = p.product_id 
GROUP BY p.product_id 
ORDER BY total_sold DESC
LIMIT 1`;
const [res]=await connectionPool.execute(sqlQuery);
return res;
}


const profitTrend=async()=>{
    const sqlQuery=`SELECT 
    DATE_FORMAT(i.created_at, '%Y-%m') AS month, 
    SUM((ii.unit_price - p.cost_price) * ii.quantity) AS profit 
FROM invoices i
JOIN invoice_items ii ON i.invoice_id = ii.invoice_id 
JOIN product p ON ii.product_id = p.product_id 
GROUP BY month
ORDER BY month DESC`;
const [res]=await connectionPool.execute(sqlQuery);
return res;
}

export{monthlyRevenue,highestSale,profitTrend};