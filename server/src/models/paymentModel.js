import connectionPool from "../config/databaseConfig.js";


const getPayment=async()=>{
    const sqlQuery = "SELECT * FROM payments";
    const [res]=await  connectionPool.execute(sqlQuery);
    return res;
}

const createPayment=async(payment_id,invoice_id,payment_date,payment_amount,payment_method,payment_status)=>{
    const sqlQuery = "INSERT INTO payments(payment_id,invoice_id,payment_date,payment_amount,payment_method,payment_status) VALUES(?,?,?,?,?,?)";
    const [res]=await  connectionPool.execute(sqlQuery,[payment_id,invoice_id,payment_date,payment_amount,payment_method,payment_status]);
    return res;
}
export {getPayment,createPayment};