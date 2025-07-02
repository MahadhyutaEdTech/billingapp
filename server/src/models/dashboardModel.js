import connectionPoolPromise from "../config/databaseConfig.js";

const createDashboardTables = async () => {
    const connectionPool = await connectionPoolPromise;
    await connectionPool.query(`
        CREATE TABLE IF NOT EXISTS product (
            product_id INT AUTO_INCREMENT PRIMARY KEY,
            product_name VARCHAR(255) NOT NULL,
            cost_price DECIMAL(10,2) NOT NULL
        )
    `);
    await connectionPool.query(`
        CREATE TABLE IF NOT EXISTS invoices (
            invoice_id INT AUTO_INCREMENT PRIMARY KEY,
            created_at DATETIME NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL
        )
    `);
    await connectionPool.query(`
        CREATE TABLE IF NOT EXISTS invoice_items (
            item_id INT AUTO_INCREMENT PRIMARY KEY,
            invoice_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            unit_price DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
            FOREIGN KEY (product_id) REFERENCES product(product_id)
        )
    `);
};

// Optionally, call createDashboardTables() here if you want tables created at module load
// await createDashboardTables();

const monthlyRevenue = async () => {
    const connectionPool = await connectionPoolPromise;
    const sqlQuery = `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month, 
        SUM(total_amount) AS revenue 
        FROM invoices 
        GROUP BY month 
        ORDER BY month DESC`;
    const [res] = await connectionPool.execute(sqlQuery);
    return res;
};

const highestSale = async () => {
    const connectionPool = await connectionPoolPromise;
    const sqlQuery = `SELECT 
        p.product_name, 
        SUM(ii.quantity) AS total_sold 
        FROM invoice_items ii
        JOIN product p ON ii.product_id = p.product_id 
        GROUP BY p.product_id, p.product_name 
        ORDER BY total_sold DESC
        LIMIT 5`;
    const [res] = await connectionPool.execute(sqlQuery);
    return res;
};

const profitTrend = async () => {
    const connectionPool = await connectionPoolPromise;
    const sqlQuery = `SELECT 
        DATE_FORMAT(i.created_at, '%Y-%m') AS month, 
        SUM((ii.unit_price - p.cost_price) * ii.quantity) AS profit 
        FROM invoices i
        JOIN invoice_items ii ON i.invoice_id = ii.invoice_id 
        JOIN product p ON ii.product_id = p.product_id 
        GROUP BY month
        ORDER BY month DESC`;
    const [res] = await connectionPool.execute(sqlQuery);
    return res;
};

export { monthlyRevenue, highestSale, profitTrend, createDashboardTables };