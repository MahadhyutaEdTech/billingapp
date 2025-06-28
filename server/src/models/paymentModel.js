import connectionPoolPromise from "../config/databaseConfig.js";



const createPaymentsTableIfNotExists = async () => {
  const connectionPool = await connectionPoolPromise;
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      payment_id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id INT,
      payment_date DATE,
      payment_amount DECIMAL(10,2),
      payment_method VARCHAR(255),
      payment_status VARCHAR(255)
    )
  `);
};

(async () => {
  await createPaymentsTableIfNotExists();
})();

const getPayment = async () => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = "SELECT * FROM payments";
  const [res] = await connectionPool.execute(sqlQuery);
  return res;
};

const createPayment = async (payment_id, invoice_id, payment_date, payment_amount, payment_method, payment_status) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = "INSERT INTO payments(payment_id,invoice_id,payment_date,payment_amount,payment_method,payment_status) VALUES(?,?,?,?,?,?)";
  const [res] = await connectionPool.execute(sqlQuery, [payment_id, invoice_id, payment_date, payment_amount, payment_method, payment_status]);
  return res;
};

export { getPayment, createPayment };