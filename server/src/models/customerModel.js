import connectionPool from "../config/databaseConfig.js";
const createCustomers=async(first_name,last_name,email,phone,cust_gst_details,created_at,updated_at)=>{
    const sqlQuery =  "INSERT INTO customers (first_name,last_name,email,phone,cust_gst_details,created_at,updated_at) VALUES (?, ?, ?,?, ?,?, ?)";
    await connectionPool.execute(sqlQuery,[first_name,last_name,email,phone,cust_gst_details,created_at,updated_at]);
}


const getCustomers=async(limit,offset)=>{
  limit = Number(limit);
  offset = Number(offset);
    const sqlQuery = `SELECT * FROM customers ORDER BY created_at limit ${limit} offset ${offset}`;
    const [res]=await  connectionPool.execute(sqlQuery);
    return res;
}


const updateCustomers=async(customer_id,data)=>{
    const fields = Object.keys(data);
    const values = Object.values(data);
  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }
  const setClause = fields.map((field) => `${field} = ?`).join(", ");  
  const sqlQuery = `UPDATE customers SET ${setClause} WHERE customer_id = ?`;
  const [result] = await connectionPool.execute(sqlQuery, [...values, customer_id]);
  return result;
}
const deleteCustomers=async(customer_id)=>{
    const sqlQuery='delete from customers where customer_id= ?';
    const [result]=await connectionPool.execute(sqlQuery,[customer_id]);
    return result;

}
const searchCustomers = async (searchQuery) => {
  const sqlQuery = `
  SELECT * FROM customers
  WHERE 
      first_name LIKE ? OR 
      last_name LIKE ? OR 
      email LIKE ? OR 
      phone LIKE ?`;

  const searchTerm = `%${searchQuery}%`;
  const values = [searchTerm, searchTerm, searchTerm, searchTerm]; // Only 4 values

  const [result] = await connectionPool.execute(sqlQuery, values);
  return result;
};


export {createCustomers,getCustomers,updateCustomers,deleteCustomers,searchCustomers} ;