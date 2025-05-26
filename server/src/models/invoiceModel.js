import connectionPool from "../config/databaseConfig.js";
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
      o.reg_number,
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
  limit = Number(limit);
  offset = Number(offset);
  const sqlQuery = `
  SELECT 
    i.*, 
    c.first_name, 
    c.last_name 
FROM invoices i 
JOIN customers c ON i.customer_id = c.customer_id order by i.invoice_id
LIMIT ${limit} OFFSET ${offset};`;

  const [res] = await connectionPool.execute(sqlQuery);
  return res;

}

const updateInvoice = async (invoice_id, data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);
  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const sqlQuery = `UPDATE invoices SET ${setClause} WHERE invoice_id = ?`;
  const [result] = await connectionPool.execute(sqlQuery, [...values, invoice_id]);
  return result;
}

const deleteInvoice = async (invoice_id) => {
  const sqlQuery = 'delete from invoices where invoice_id= ?';
  const [result] = await connectionPool.execute(sqlQuery, [invoice_id]);
  return result;

}

const getfilterInvoices = async (status) => {
  const sqlQuery = `
  SELECT 
      i.*, 
      c.first_name, 
      c.last_name 
  FROM invoices i
  JOIN customers c ON i.customer_id = c.customer_id where i.status=?`;

  const [res] = await connectionPool.execute(sqlQuery, [status]);
  return res;

}

const searchInvoices = async (searchQuery) => {
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

  const sqlQuery = `select count(*) as TotalInvoices from invoices;`;
  const [result] = await connectionPool.execute(sqlQuery);
  return result;
}



const statusCount = async () => {

  const sqlQuery = `SELECT status, COUNT(*) as count 
FROM invoices 
GROUP BY status 
ORDER BY status;`;
  const [result] = await connectionPool.execute(sqlQuery);
  return result;
}

const amountStatus = async () => {
  const sqlQuery = `SELECT status, SUM(total_amount + tax_amount) AS total 
FROM invoices 
GROUP BY status 
ORDER BY status
`;
  const [result] = await connectionPool.execute(sqlQuery);
  return result;
}

export { createInvoice, getInvoice, updateInvoice, deleteInvoice, getAllInvoices, getfilterInvoices, searchInvoices, countInvoice, statusCount, amountStatus };




