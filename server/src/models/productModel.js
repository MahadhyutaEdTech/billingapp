import connectionPoolPromise from "../config/databaseConfig.js";

// Ensure product table exists at module load
const createProductTableIfNotExists = async () => {
  const connectionPool = await connectionPoolPromise;
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS product (
      product_id INT AUTO_INCREMENT PRIMARY KEY,
      product_name VARCHAR(100) NOT NULL,
      description TEXT,
      sku VARCHAR(50) NOT NULL,
      hsn_sac VARCHAR(50),
      unit_price DECIMAL(10,2) NOT NULL,
      cost_price DECIMAL(10,2) NOT NULL,
      product_type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      tax DECIMAL(10,2),
      quantity INT,
      current_stock INT
    )
  `);
};

(async () => {
  await createProductTableIfNotExists();
})();

const createProduct = async (product_name, description, sku, hsn_sac, unit_price, cost_price, product_type, tax, quantity) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = "INSERT INTO product (product_name, description, sku, hsn_sac, unit_price, cost_price, product_type, tax, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  await connectionPool.execute(sqlQuery, [product_name, description, sku, hsn_sac, unit_price, cost_price, product_type, tax, quantity]);
};

const getProduct = async (limit, offset) => {
  const connectionPool = await connectionPoolPromise;
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

const getProductById = async (product_id) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = "SELECT * FROM product where product_id=?";
  const [res] = await connectionPool.execute(sqlQuery, [product_id]);
  return res;
};

const updateProduct = async (product_id, data) => {
  const connectionPool = await connectionPoolPromise;
  const fields = Object.keys(data);
  const values = Object.values(data);
  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const sqlQuery = `UPDATE product SET ${setClause} WHERE product_id = ?`;
  const [result] = await connectionPool.execute(sqlQuery, [...values, product_id]);
  return result;
};

const deleteProduct = async (product_id) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = 'delete from product where product_id= ?';
  const [result] = await connectionPool.execute(sqlQuery, [product_id]);
  return result;
};

export { createProduct, getProduct, updateProduct, deleteProduct, getProductById };