import connectionPoolPromise from "../config/databaseConfig.js";

// Ensure tax table exists at module load
const createTaxTableIfNotExists = async () => {
  const connectionPool = await connectionPoolPromise;
  await connectionPool.query(`
       CREATE TABLE IF NOT EXISTS tax (
      tax_id INT AUTO_INCREMENT PRIMARY KEY,
      tax_type VARCHAR(20) NOT NULL,
      tax_rate DECIMAL(5,2) NOT NULL,
      valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      valid_until TIMESTAMP NULL
    )
  `);
};

(async () => {
  await createTaxTableIfNotExists();
})();

const createTaxs = async (tax_type, tax_rate, valid_from, valid_untill) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = "Insert into tax (tax_type,tax_rate,valid_from,valid_until) values (?, ?, ?, ?)";
  await connectionPool.execute(sqlQuery, [tax_type, tax_rate, valid_from, valid_untill]);
};

const getTaxs = async () => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = "Select * from tax";
  const [res] = await connectionPool.execute(sqlQuery);
  return res;
};

const updateTaxs = async (tax_id, data) => {
  const connectionPool = await connectionPoolPromise;
  const fields = Object.keys(data);
  const values = Object.values(data);
  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const sqlQuery = `UPDATE tax SET ${setClause} WHERE tax_id = ?`;
  const [result] = await connectionPool.execute(sqlQuery, [...values, tax_id]);
  return result;
};

const deleteTaxs = async (tax_id) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = "Delete from tax where tax_id=?";
  const [result] = await connectionPool.execute(sqlQuery, [tax_id]);
  return result;
};

export { createTaxs, getTaxs, updateTaxs, deleteTaxs };