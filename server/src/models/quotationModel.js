import connectionPoolPromise from "../config/databaseConfig.js";

// Ensure quotations and quotation_items tables exist at module load
const createQuotationTablesIfNotExists = async () => {
  const connectionPool = await connectionPoolPromise;
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS quotations (
      quotation_id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT,
     org_id BIGINT UNSIGNED,
      quotation_date DATE,
      valid_until DATE,
      total_amount DECIMAL(10,2),
      discount DECIMAL(10,2),
      tax_amount DECIMAL(10,2),
      status VARCHAR(50),
      gst_type VARCHAR(50),
      gst_no VARCHAR(50),
      gst_number VARCHAR(50),
      created_at DATETIME,
      notes TEXT,
      terms_conditions TEXT,
      quotation_number VARCHAR(255),
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
      FOREIGN KEY (org_id) REFERENCES organizations(org_id)
    )
  `);
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS quotation_items (
      item_id INT AUTO_INCREMENT PRIMARY KEY,
      quotation_id INT,
      product_id INT,
      quantity INT,
      unit_price DECIMAL(10,2),
      FOREIGN KEY (quotation_id) REFERENCES quotations(quotation_id),
      FOREIGN KEY (product_id) REFERENCES product(product_id)
    )
  `);
};

(async () => {
  await createQuotationTablesIfNotExists();
})();

const createQuotation = async (
  customer_id,
  org_id,
  quotation_date,
  valid_until,
  total_amount,
  discount,
  tax_amount,
  status,
  created_at,
  gst_no,
  gst_number,
  gst_type,
  shippingAddresses,
  products,
  notes,
  terms_conditions
) => {
  const connectionPool = await connectionPoolPromise;
  const connection = await connectionPool.getConnection();
  try {
    await connection.beginTransaction();
    
    const [orgRows] = await connection.execute(
      "SELECT name, gst_details, quotation_prefix FROM organizations WHERE org_id = ?",
      [org_id]
    );
    const orgData = orgRows[0];
    if (!orgData) throw new Error("Organization not found");

    // Use the quotation_prefix from organization or fall back to 'QT'
    const orgPrefix = orgData.quotation_prefix || 'QT'; 
    const gstDetails = typeof orgData.gst_details === 'string'
      ? JSON.parse(orgData.gst_details)
      : orgData.gst_details;
    
    // Match GST number
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

    // Increment last_quotation_number for the matched gst_number
    const lastNum = matchedDetails.last_quotation_number || 0;
    const nextQuotationNumber = lastNum + 1;

    // Generate formatted quotation number
    const now = new Date();
    const monthAbbr = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = now.getFullYear();
    const gstPrefix = gst_number.substring(0, 2);
    const formattedQuotationNumber = `${orgPrefix}/${gstPrefix}/${monthAbbr}/${year}/${String(nextQuotationNumber).padStart(4, '0')}`;
    
    console.log("Formatted Quotation Number:", formattedQuotationNumber);

    // Insert the new quotation into the quotations table
    const quotationQuery = `
      INSERT INTO quotations (customer_id, org_id, quotation_date, valid_until, total_amount, discount, tax_amount, status, gst_type, gst_no, gst_number, created_at, notes, terms_conditions) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [quotationResult] = await connection.execute(quotationQuery, [
      customer_id, org_id, quotation_date, valid_until, total_amount, discount, tax_amount, status, gst_type, gst_no, gst_number, created_at, notes, terms_conditions
    ]);

    const quotation_id = quotationResult.insertId;

    // Update the quotation with the formatted quotation number
    await connection.execute(
      "UPDATE quotations SET quotation_number = ? WHERE quotation_id = ?",
      [formattedQuotationNumber, quotation_id]
    );

    // Insert quotation items into the quotation_items table
    const productValues = products.map(product => [quotation_id, product.product_id, product.quantity, product.unit_price]);
    await connection.query(
      "INSERT INTO quotation_items (quotation_id, product_id, quantity, unit_price) VALUES ?",
      [productValues]
    );

    // Update gst_details with new last_quotation_number
    matchedDetails.last_quotation_number = nextQuotationNumber;
    await connection.execute(
      "UPDATE organizations SET gst_details = ? WHERE org_id = ?",
      [JSON.stringify(gstDetails), org_id]
    );
    
    // Update customer shipping addresses
    await connection.execute(`UPDATE customers
           SET shipping_addresses = ?
          WHERE customer_id = ?`,
      [JSON.stringify(shippingAddresses), customer_id]);
    
    await connection.commit();
    return { success: true, quotation_id, quotation_number: formattedQuotationNumber };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getQuotation = async (quotation_id) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = `
    SELECT 
      q.quotation_id,
      q.quotation_date,
      q.valid_until,
      q.total_amount,
      q.tax_amount,
      q.gst_number,
      q.gst_no,
      q.gst_type,
      q.discount,
      q.quotation_number,
      q.notes,
      q.terms_conditions,
      q.status,
      
      -- Customer Details
      c.customer_id,
      c.first_name,
      c.last_name,
      c.cust_gst_details,
      c.shipping_addresses,
      c.email AS customer_email,
      c.phone AS customer_phone,
      
      -- Product Details
      qi.product_id,
      p.product_name,
      p.hsn_sac,
      p.tax,
      qi.quantity,
      qi.unit_price,
      
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
    FROM quotations q
    JOIN customers c ON q.customer_id = c.customer_id
    JOIN quotation_items qi ON q.quotation_id = qi.quotation_id
    JOIN product p ON qi.product_id = p.product_id
    JOIN organizations o ON q.org_id = o.org_id  
    WHERE q.quotation_id = ?
  `;

  const [rows] = await connectionPool.execute(sqlQuery, [quotation_id]);

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

const getAllQuotations = async (limit, offset) => {
  const connectionPool = await connectionPoolPromise;
  limit = Number(limit);
  offset = Number(offset);
  const sqlQuery = `
  SELECT 
    q.*, 
    c.first_name, 
    c.last_name 
  FROM quotations q 
  JOIN customers c ON q.customer_id = c.customer_id 
  ORDER BY q.quotation_id DESC
  LIMIT ${limit} OFFSET ${offset};`;

  const [res] = await connectionPool.execute(sqlQuery);
  return res;
};

const updateQuotation = async (quotation_id, data) => {
  const connectionPool = await connectionPoolPromise;
  const fields = Object.keys(data);
  const values = Object.values(data);
  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const sqlQuery = `UPDATE quotations SET ${setClause} WHERE quotation_id = ?`;
  const [result] = await connectionPool.execute(sqlQuery, [...values, quotation_id]);
  return result;
};

const deleteQuotation = async (quotation_id) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = 'DELETE FROM quotations WHERE quotation_id = ?';
  const [result] = await connectionPool.execute(sqlQuery, [quotation_id]);
  return result;
};

const getFilterQuotations = async (status) => {
  const connectionPool = await connectionPoolPromise;
  console.log("🔍 Received status in backend:", status);

  let sqlQuery = `
    SELECT q.*, c.first_name, c.last_name
    FROM quotations q
    JOIN customers c ON q.customer_id = c.customer_id
  `;

  const values = [];

  // Only filter if status is passed and not empty
  if (status && status.trim() !== "") {
    sqlQuery += ` WHERE LOWER(TRIM(q.status)) = LOWER(TRIM(?))`;
    values.push(status);
  }

  const [res] = await connectionPool.execute(sqlQuery, values);
  return res;
};

const searchQuotations = async (searchQuery) => {
  const connectionPool = await connectionPoolPromise;
  // Split the search query into first name and last name
  const searchTerms = searchQuery.split(" ");

  let sqlQuery = `
  SELECT 
      q.*, 
      c.first_name, 
      c.last_name, 
      c.email, 
      c.phone
  FROM quotations q
  JOIN customers c ON q.customer_id = c.customer_id
  WHERE`;

  let values = [];

  if (searchTerms.length === 1) {
    // Only one term, search in both first and last names
    sqlQuery += `
      (q.quotation_number LIKE ? OR 
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
      (q.quotation_number LIKE ? OR 
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

const countQuotations = async () => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = `SELECT COUNT(*) as TotalQuotations FROM quotations;`;
  const [result] = await connectionPool.execute(sqlQuery);
  return result;
};

const statusCount = async () => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = `SELECT status, COUNT(*) as count 
    FROM quotations 
    GROUP BY status 
    ORDER BY status;`;
  const [result] = await connectionPool.execute(sqlQuery);
  return result;
};

const amountStatus = async () => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = `SELECT status, SUM(total_amount + tax_amount) AS total 
    FROM quotations 
    GROUP BY status 
    ORDER BY status`;
  const [result] = await connectionPool.execute(sqlQuery);
  return result;
};

// Function to get total unique customers for quotations
const getTotalCustomers = async () => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = `
    SELECT COUNT(DISTINCT customer_id) as total_customers 
    FROM quotations;
  `;
  const [result] = await connectionPool.execute(sqlQuery);
  return result[0]?.total_customers || 0;
};

// Function to get average quotation value
const getAverageQuotationValue = async () => {
  const connectionPool = await connectionPoolPromise;
  try {
    const sqlQuery = `
      SELECT 
        ROUND(AVG(CAST(total_amount AS DECIMAL(10,2))), 2) as average_value 
      FROM quotations 
      WHERE total_amount > 0;
    `;
    
    const [result] = await connectionPool.execute(sqlQuery);
    console.log("💰 Average Quotation Value Result:", result[0]);
    
    return result[0]?.average_value || 0;
  } catch (error) {
    console.error("❌ Error calculating average quotation value:", error);
    return 0;
  }
};

// Convert quotation to invoice
const convertToInvoice = async (quotation_id) => {
  const connectionPool = await connectionPoolPromise;
  const connection = await connectionPool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Get quotation details
    const [quotationRows] = await connection.execute(
      "SELECT * FROM quotations WHERE quotation_id = ?",
      [quotation_id]
    );
    
    if (quotationRows.length === 0) {
      throw new Error("Quotation not found");
    }
    
    const quotation = quotationRows[0];
    
    // Get quotation items
    const [itemRows] = await connection.execute(
      "SELECT * FROM quotation_items WHERE quotation_id = ?",
      [quotation_id]
    );
    
    // Create invoice
    const invoiceQuery = `
      INSERT INTO invoices (customer_id, org_id, invoice_date, due_date, advance, total_amount, discount, due_amount, tax_amount, status, gst_type, gst_no, gst_number, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now
    
    const [invoiceResult] = await connection.execute(invoiceQuery, [
      quotation.customer_id,
      quotation.org_id,
      new Date().toISOString().split('T')[0],
      dueDate.toISOString().split('T')[0],
      0, // advance
      quotation.total_amount,
      quotation.discount,
      quotation.total_amount + quotation.tax_amount - quotation.discount,
      quotation.tax_amount,
      'Pending',
      quotation.gst_type,
      quotation.gst_no,
      quotation.gst_number,
      new Date().toISOString().split('T')[0]
    ]);
    
    const invoice_id = invoiceResult.insertId;
    
    // Insert invoice items
    const productValues = itemRows.map(item => [invoice_id, item.product_id, item.quantity, item.unit_price]);
    await connection.query(
      "INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price) VALUES ?",
      [productValues]
    );
    
    // Update quotation status to 'Converted'
    await connection.execute(
      "UPDATE quotations SET status = 'Converted' WHERE quotation_id = ?",
      [quotation_id]
    );
    
    await connection.commit();
    return { success: true, invoice_id };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export { 
  createQuotation, 
  getQuotation, 
  updateQuotation, 
  deleteQuotation, 
  getAllQuotations, 
  getFilterQuotations, 
  searchQuotations, 
  countQuotations, 
  statusCount, 
  amountStatus, 
  getTotalCustomers, 
  getAverageQuotationValue,
  convertToInvoice
};