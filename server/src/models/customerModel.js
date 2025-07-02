import connectionPoolPromise from "../config/databaseConfig.js";

// Ensure the customers table exists at module load
(async () => {
  const connectionPool = await connectionPoolPromise;
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      customer_id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      phone VARCHAR(20),
      shipping_addresses JSON NULL,
      cust_gst_details JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
})();

const createCustomers = async (first_name, last_name, email, phone, cust_gst_details, created_at, updated_at) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = "INSERT INTO customers (first_name,last_name,email,phone,cust_gst_details,created_at,updated_at) VALUES (?, ?, ?,?, ?,?, ?)";
  await connectionPool.execute(sqlQuery, [first_name, last_name, email, phone, cust_gst_details, created_at, updated_at]);
};

const getCustomers = async (limit, offset) => {
  const connectionPool = await connectionPoolPromise;
  limit = Number(limit);
  offset = Number(offset);
  const sqlQuery = `SELECT * FROM customers ORDER BY created_at limit ${limit} offset ${offset}`;
  const [res] = await connectionPool.execute(sqlQuery);
  return res;
};

const updateCustomers = async (customer_id, data) => {
  const connectionPool = await connectionPoolPromise;
  const fields = Object.keys(data);
  const values = Object.values(data);
  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const sqlQuery = `UPDATE customers SET ${setClause} WHERE customer_id = ?`;
  const [result] = await connectionPool.execute(sqlQuery, [...values, customer_id]);
  return result;
};

const deleteCustomers = async (customer_id) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = 'delete from customers where customer_id= ?';
  const [result] = await connectionPool.execute(sqlQuery, [customer_id]);
  return result;
};

const searchCustomers = async (searchQuery) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = `
  SELECT * FROM customers
  WHERE 
      first_name LIKE ? OR 
      last_name LIKE ? OR 
      email LIKE ? OR 
      phone LIKE ?`;

  const searchTerm = `%${searchQuery}%`;
  const values = [searchTerm, searchTerm, searchTerm, searchTerm];

  const [result] = await connectionPool.execute(sqlQuery, values);
  return result;
};

export { createCustomers, getCustomers, updateCustomers, deleteCustomers, searchCustomers };