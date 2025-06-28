import connectionPoolPromise from "../config/databaseConfig.js";



const createInvoiceTablesIfNotExists = async () => {
  const connectionPool = await connectionPoolPromise;
  // Create invoices table
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      invoice_id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      org_id BIGINT UNSIGNED NULL,
      invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      due_date TIMESTAMP NULL,
      advance DECIMAL(10,2) NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      discount DECIMAL(10,2) NULL,
      due_amount DECIMAL(10,2) NULL,
      tax_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      gst_no VARCHAR(255) NULL,
      gst_type VARCHAR(100) NULL,
      gst_number VARCHAR(100) NULL,
      invoice_number VARCHAR(50) NULL,
      UNIQUE(invoice_number)
    )
  `);
  // Create invoice_items table
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
  // Create product table if not exists (minimal columns)
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS product (
      product_id INT AUTO_INCREMENT PRIMARY KEY,
      product_name VARCHAR(255) NOT NULL,
      hsn_sac VARCHAR(255),
      tax DECIMAL(10,2),
      current_stock INT DEFAULT 0
    )
  `);
  // Create customers table if not exists (minimal columns)
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      customer_id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      cust_gst_details TEXT,
      shipping_addresses TEXT,
      email VARCHAR(255),
      phone VARCHAR(20)
    )
  `);
  // Create organizations table if not exists (minimal columns)
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS organizations (
      org_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      gst_details TEXT,
      invoice_prefix VARCHAR(255),
      email VARCHAR(255),
      logo_image TEXT,
      signature_image TEXT,
      pan_number VARCHAR(255),
      acc_num VARCHAR(255),
      acc_name VARCHAR(255),
      ifsc VARCHAR(255),
      branch VARCHAR(255),
      bank_name VARCHAR(255),
      phone VARCHAR(20)
    )
  `);
};

(async () => {
  await createInvoiceTablesIfNotExists();
})();

const createInvoice = async (
  customer_id,
  org_id,
  invoice_date,
  due_date,
  advance,
  total_amount,
  discount,
  due_amount,
  tax_amount,
  status,
  created_at,
  gst_no,
  gst_number,
  gst_type,
  shippingAddresses,
  products,
) => {
  const connectionPool = await connectionPoolPromise;
  const connection = await connectionPool.getConnection();
  try {
    await connection.beginTransaction();
 const [orgRows] = await connection.execute(
      "SELECT name, gst_details, invoice_prefix FROM organizations WHERE org_id = ?",
      [org_id]
    );
    const orgData = orgRows[0];
    if (!orgData) throw new Error("Organization not found");

    // Use the invoice_prefix from organization or fall back to 'MDET'
    const orgPrefix = orgData.invoice_prefix || 'MDET'; 
    const gstDetails = typeof orgData.gst_details === 'string'
      ? JSON.parse(orgData.gst_details)
      : orgData.gst_details;
    // 2. Match GST number (no state matching)
    let matched = false;
    let matchedDetails = null;
    for (const details of Object.values(gstDetails)) {
      if (details.gst_number === gst_number) {
        matched = true;
        matchedDetails = details;
        break;
      }
    }

    if (!matched) {
      throw new Error("GST number not found in organization's GST details");
    }

    // 3. Increment last_invoice_number for the matched gst_number
    const lastNum = matchedDetails.last_invoice_number || 0;
    const nextInvoiceNumber = lastNum + 1;

    // 4. Generate formatted invoice number
    const now = new Date();
    const monthAbbr = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = now.getFullYear();
    const gstPrefix = gst_number.substring(0, 2);  // Extract the first two letters from gst_number
    const formattedInvoiceNumber = `${orgPrefix}/${gstPrefix}/${monthAbbr}/${year}/${String(nextInvoiceNumber).padStart(4, '0')}`;
   console.log("Formatted Invoice Number:", formattedInvoiceNumber);
   console.log("Gst prfix:", gstPrefix);

    // 5. Insert the new invoice into the invoices table
    const invoiceQuery = `
      INSERT INTO invoices (customer_id, org_id, invoice_date, due_date, advance, total_amount, discount, due_amount, tax_amount, status,gst_type, gst_no,gst_number,created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?,?,?, ?)
    `;
    const [invoiceResult] = await connection.execute(invoiceQuery, [
      customer_id, org_id, invoice_date, due_date, advance, total_amount, discount, due_amount, tax_amount, status,gst_type, gst_no,gst_number, created_at
    ]);

    const invoice_id = invoiceResult.insertId;

    // 6. Update the invoice with the formatted invoice number
    await connection.execute(
      "UPDATE invoices SET invoice_number = ? WHERE invoice_id = ?",
      [formattedInvoiceNumber, invoice_id]
    );

    // 7. Insert invoice items into the invoice_items table
    const productValues = products.map(product => [invoice_id, product.product_id, product.quantity, product.unit_price]);
    await connection.query(
      "INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price) VALUES ?",
      [productValues]
    );

    // 8. Update gst_details with new last_invoice_number
    matchedDetails.last_invoice_number = nextInvoiceNumber;
    await connection.execute(
      "UPDATE organizations SET gst_details = ? WHERE org_id = ?",
      [JSON.stringify(gstDetails), org_id]
    );
    await connection.execute(`UPDATE customers
           SET shipping_addresses = ?
          WHERE customer_id = ?`,
      [JSON.stringify(shippingAddresses), customer_id]);
    
      for (const product of products) {
        const quantity = Number(product.quantity);
      
        if (!product.product_id || isNaN(quantity)) {
          throw new Error(`Invalid product data: ${JSON.stringify(product)}`);
        }
      
        const [result] = await connection.execute(
          'UPDATE product SET current_stock = current_stock - ? WHERE product_id = ? AND current_stock >= ?',
          [quantity, product.product_id, quantity]
        );
      
        if (result.affectedRows === 0) {
          throw new Error(`Insufficient stock for product_id ${product.product_id}`);
        }
      } 
    await connection.commit();
    return { success: true, invoice_id, invoice_number: formattedInvoiceNumber };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getInvoice = async (invoice_id) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = `
    SELECT 
      i.invoice_id,
      i.invoice_date,
      i.total_amount,
      i.due_amount,
      i.tax_amount,
      i.advance,
      i.gst_number,
      i.gst_no,
      i.gst_type,
      i.discount,
      i.invoice_number, 
      
      -- Customer Details
      c.customer_id,
      c.first_name,
      c.last_name,
      c.cust_gst_details,
      c.shipping_addresses,
      c.email AS customer_email,
      c.phone AS customer_phone,
      
      -- Product Details
      ii.product_id,
      p.product_name,
      p.hsn_sac,
      p.tax,
      ii.quantity,
      ii.unit_price,
      
      -- Organization Details
      o.org_id,
      o.name,
      o.email,
      o.gst_details,
      o.logo_image,
      o.signature_image,
      o.pan_number,
      o.acc_num,
      o.acc_name,
      o.ifsc,
      o.branch,
      o.bank_name,
      o.phone
    FROM invoices i
    JOIN customers c ON i.customer_id = c.customer_id
    JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
    JOIN product p ON ii.product_id = p.product_id
    JOIN organizations o ON i.org_id = o.org_id  
    WHERE i.invoice_id = ?
  `;

  const [rows] = await connectionPool.execute(sqlQuery, [invoice_id]);

  const result = rows.map(row => {
    let gstDetails = row.gst_details;

    try {
      if (typeof gstDetails === 'string') {
        gstDetails = JSON.parse(gstDetails);
      }

      const matchedGst = Object.values(gstDetails).find(
        detail => detail.gst_number === row.gst_number
      );

      row.gst_details = matchedGst || null;
    } catch (err) {
      console.error("Failed to parse gst_details JSON:", err);
      row.gst_details = null;
    }

    return row;
  });

  return result;
};

const getAllInvoices = async (limit, offset) => {
  const connectionPool = await connectionPoolPromise;
  limit = Number(limit);
  offset = Number(offset);
  const sqlQuery = `
    SELECT 
      i.*, 
      c.first_name, 
      c.last_name 
    FROM invoices i 
    JOIN customers c ON i.customer_id = c.customer_id 
    ORDER BY i.invoice_id
    LIMIT ${limit} OFFSET ${offset};`;
  const [res] = await connectionPool.execute(sqlQuery);
  return res;
};

const updateInvoice = async (invoice_id, data) => {
  const connectionPool = await connectionPoolPromise;
  const fields = Object.keys(data);
  const values = Object.values(data);
  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const sqlQuery = `UPDATE invoices SET ${setClause} WHERE invoice_id = ?`;
  const [result] = await connectionPool.execute(sqlQuery, [...values, invoice_id]);
  return result;
};

const deleteInvoice = async (invoice_id) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = 'DELETE FROM invoices WHERE invoice_id= ?';
  const [result] = await connectionPool.execute(sqlQuery, [invoice_id]);
  return result;
};

const getfilterInvoices = async (status) => {
  const connectionPool = await connectionPoolPromise;
  console.log("🔍 Received status in backend:", status);
  let sqlQuery = `
    SELECT i.*, c.first_name, c.last_name
    FROM invoices i
    JOIN customers c ON i.customer_id = c.customer_id
  `;
  const values = [];
  if (status && status.trim() !== "") {
    sqlQuery += ` WHERE LOWER(TRIM(i.status)) = LOWER(TRIM(?))`;
    values.push(status);
  }
  const [res] = await connectionPool.execute(sqlQuery, values);
  return res;
};

const searchInvoices = async (searchQuery) => {
  const connectionPool = await connectionPoolPromise;
  // Split the search query into first name and last name
  const searchTerms = searchQuery.split(" ");

  let sqlQuery = `
  SELECT 
      i.*, 
      c.first_name, 
      c.last_name, 
      c.email, 
      c.phone
  FROM invoices i
  JOIN customers c ON i.customer_id = c.customer_id
  WHERE`;

  let values = [];

  if (searchTerms.length === 1) {
    // Only one term, search in both first and last names
    sqlQuery += `
      (i.invoice_number LIKE ? OR 
      c.first_name LIKE ? OR 
      c.last_name LIKE ? OR 
      c.email LIKE ? OR 
      c.phone LIKE ?)`;
    values = [
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      `%${searchQuery}%`
    ];
  } else if (searchTerms.length === 2) {
    const firstName = `%${searchTerms[0]}%`;
    const lastName = `%${searchTerms[1]}%`;
    sqlQuery += `
      (i.invoice_number LIKE ? OR 
      c.first_name LIKE ? OR 
      c.last_name LIKE ? OR 
      c.email LIKE ? OR 
      c.phone LIKE ?) 
      AND 
      (c.first_name LIKE ? AND c.last_name LIKE ?)`;

    values = [
      firstName,
      firstName,
      lastName,
      `%${searchQuery}%`,
      `%${searchQuery}%`,
      firstName,
      lastName
    ];
  }

  const [result] = await connectionPool.execute(sqlQuery, values);
  return result;
};


const countInvoice = async () => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = `SELECT count(*) as TotalInvoices FROM invoices;`;
  const [result] = await connectionPool.execute(sqlQuery);
  return result;
};

const statusCount = async () => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = `SELECT status, COUNT(*) as count FROM invoices GROUP BY status ORDER BY status;`;
  const [result] = await connectionPool.execute(sqlQuery);
  return result;
};

const amountStatus = async () => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = `SELECT status, SUM(total_amount + tax_amount) AS total FROM invoices GROUP BY status ORDER BY status`;
  const [result] = await connectionPool.execute(sqlQuery);
  return result;
};

// Function to get total unique customers
const getTotalCustomers = async () => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = `
    SELECT COUNT(DISTINCT customer_id) as total_customers 
    FROM invoices;
  `;
  const [result] = await connectionPool.execute(sqlQuery);
  return result[0]?.total_customers || 0;
};

// Function to get average invoice value
const getAverageInvoiceValue = async () => {
  const connectionPool = await connectionPoolPromise;
  try {
    // First, let's check what data we have
    const checkQuery = `
      SELECT 
        COUNT(*) as total_invoices,
        MIN(total_amount) as min_amount,
        MAX(total_amount) as max_amount,
        SUM(total_amount) as sum_amount
      FROM invoices 
      WHERE total_amount > 0;
    `;
    
    const [checkResult] = await connectionPool.execute(checkQuery);
    console.log("📊 Invoice Amount Statistics:", checkResult[0]);

    // Now get the average
    const sqlQuery = `
      SELECT 
        ROUND(AVG(CAST(total_amount AS DECIMAL(10,2))), 2) as average_value 
      FROM invoices 
      WHERE total_amount > 0;
    `;
    
    const [result] = await connectionPool.execute(sqlQuery);
    console.log("💰 Average Invoice Value Result:", result[0]);
    
    return result[0]?.average_value || 0;
  } catch (error) {
    console.error("❌ Error calculating average invoice value:", error);
    return 0;
  }
};

// Function to get highest sale product
const getHighestSaleProduct = async () => {
  const connectionPool = await connectionPoolPromise;
  try {
    const sqlQuery = `
      SELECT 
        p.product_name,
        SUM(ii.quantity) as total_sold,
        SUM(ii.quantity * ii.unit_price) as total_revenue
      FROM invoice_items ii
      JOIN product p ON ii.product_id = p.product_id
      GROUP BY p.product_id, p.product_name
      ORDER BY total_sold DESC
      LIMIT 5;
    `;
    
    const [result] = await connectionPool.execute(sqlQuery);
    console.log("📊 Highest Sale Products:", result);
    return result;
  } catch (error) {
    console.error("❌ Error fetching highest sale products:", error);
    return [];
  }
};

export {
  createInvoice,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  getAllInvoices,
  getfilterInvoices,
  searchInvoices,
  countInvoice,
  statusCount,
  amountStatus,
  getTotalCustomers,
  getAverageInvoiceValue,
  getHighestSaleProduct
};




