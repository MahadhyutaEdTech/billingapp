import connectionPool from "../config/databaseConfig.js";
const createProduct=async(product_name, description, sku, hsn_sac, unit_price, cost_price, product_type,tax,quantity)=>{
    const sqlQuery =  "INSERT INTO product (product_name, description, sku, hsn_sac, unit_price, cost_price, product_type,tax,quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    await connectionPool.execute(sqlQuery,[product_name, description, sku, hsn_sac, unit_price, cost_price, product_type,tax,quantity]);
}


const getProduct = async (limit, offset) => {
    limit = Number(limit);
    offset = Number(offset);
    const sqlQuery = `SELECT * FROM product ORDER BY product_id LIMIT ${limit} OFFSET ${offset}`;
    try {
        const [res] = await connectionPool.execute(sqlQuery);
        return res;
    } catch (error) {
        console.error('Error executing query:', error);
        throw new Error("Error executing the SQL query.");
    }
};

const getProductById=async(product_id)=>{
    const sqlQuery = "SELECT * FROM product where product_id=?";
    const [res]=await  connectionPool.execute(sqlQuery,[product_id]);
    return res;
}


const updateProduct=async(product_id,data)=>{
    const fields = Object.keys(data);
    const values = Object.values(data);
  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }
  const setClause = fields.map((field) => `${field} = ?`).join(", ");  
  const sqlQuery = `UPDATE product SET ${setClause} WHERE product_id = ?`;
  const [result] = await connectionPool.execute(sqlQuery, [...values, product_id]);
  return result;
}
const deleteProduct=async(product_id)=>{
    const sqlQuery='delete from product where product_id= ?';
    const [result]=await connectionPool.execute(sqlQuery,[product_id]);
    return result;

}
export {createProduct,getProduct,updateProduct,deleteProduct,getProductById} ;