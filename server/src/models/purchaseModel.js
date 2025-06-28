import connectionPoolPromise from "../config/databaseConfig.js";
import { createProduct, getProductById, updateProduct } from "./productModel.js";

// Create tables queries
const createPurchaseTableQuery = `
CREATE TABLE IF NOT EXISTS purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_id VARCHAR(255) NOT NULL UNIQUE,
    expenses_number VARCHAR(255) NOT NULL UNIQUE,
    supplier_name VARCHAR(255) NOT NULL,
    purchase_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('Pending', 'Paid', 'Overdue', 'Cancelled') DEFAULT 'Pending',
    items_count INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

const createPurchaseItemsTableQuery = `
CREATE TABLE IF NOT EXISTS purchase_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

// CRUD Operations
const createPurchase = async (data) => {
  const connectionPool = await connectionPoolPromise;
  const {
    purchase_id, expenses_number, supplier_name,
    purchase_date, due_date, total_amount,
    payment_status, items_count, notes, items
  } = data;

  const purchaseSQL = `
    INSERT INTO purchases (purchase_id, expenses_number, supplier_name, 
    purchase_date, due_date, total_amount, payment_status, items_count, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await connectionPool.execute(purchaseSQL, [
    purchase_id, expenses_number, supplier_name,
    purchase_date, due_date, total_amount,
    payment_status, items_count, notes
  ]);

  // Insert items if present
  if (items && items.length > 0) {
    const itemSQL = `
      INSERT INTO purchase_items (purchase_id, item_name, quantity, price, total)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      await connectionPool.execute(itemSQL, [
        purchase_id, item.item_name, item.quantity,
        item.price, item.total
      ]);

      // --- Product Table Logic ---
      // Try to find the product by SKU if available, else by name
      let existingProduct = null;
      if (item.sku) {
        const [skuRes] = await connectionPool.execute(
          "SELECT * FROM product WHERE sku = ?",
          [item.sku]
        );
        if (skuRes.length > 0) existingProduct = skuRes[0];
      }
      if (!existingProduct) {
        const [nameRes] = await connectionPool.execute(
          "SELECT * FROM product WHERE product_name = ?",
          [item.item_name]
        );
        if (nameRes.length > 0) existingProduct = nameRes[0];
      }
      if (existingProduct) {
        // Update the quantity/stock
        const newQuantity = (existingProduct.quantity || 0) + (item.quantity || 0);
        await updateProduct(existingProduct.product_id, { quantity: newQuantity });
      } else {
        // Create a new product
        await createProduct(
          item.item_name, // product_name
          item.description || '', // description
          item.sku || '', // sku
          item.hsn_sac || '', // hsn_sac
          item.price, // unit_price
          item.price, // cost_price
          'purchase', // product_type or your default
          item.tax || 0, // tax
          item.quantity // quantity
        );
      }
      // --- End Product Table Logic ---
    }
  }

  return result.insertId;
};

const getAllPurchases = async () => {
  const connectionPool = await connectionPoolPromise;
  const [rows] = await connectionPool.execute("SELECT * FROM purchases");
  return rows;
};

const getPurchaseById = async (id) => {
  const connectionPool = await connectionPoolPromise;
  const [purchase] = await connectionPool.execute(
    "SELECT * FROM purchases WHERE purchase_id = ?",
    [id]
  );
  
  if (purchase.length > 0) {
    const [items] = await connectionPool.execute(
      "SELECT * FROM purchase_items WHERE purchase_id = ?",
      [id]
    );
    purchase[0].items = items;
  }
  
  return purchase[0];
};

const updatePurchase = async (id, data) => {
  const connectionPool = await connectionPoolPromise;
  const {
    expenses_number, supplier_name, purchase_date,
    due_date, total_amount, payment_status,
    items_count, notes, items
  } = data;

  const sql = `
    UPDATE purchases 
    SET expenses_number=?, supplier_name=?, purchase_date=?,
        due_date=?, total_amount=?, payment_status=?,
        items_count=?, notes=?
    WHERE purchase_id=?
  `;

  await connectionPool.execute(sql, [
    expenses_number, supplier_name, purchase_date,
    due_date, total_amount, payment_status,
    items_count, notes, id
  ]);

  // Update items if present
  if (items && items.length > 0) {
    // Delete existing items
    await connectionPool.execute(
      "DELETE FROM purchase_items WHERE purchase_id = ?",
      [id]
    );

    // Insert new items
    const itemSQL = `
      INSERT INTO purchase_items (purchase_id, item_name, quantity, price, total)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      await connectionPool.execute(itemSQL, [
        id, item.item_name, item.quantity,
        item.price, item.total
      ]);

      // --- Product Table Logic ---
      // Try to find the product by SKU if available, else by name
      let existingProduct = null;
      if (item.sku) {
        const [skuRes] = await connectionPool.execute(
          "SELECT * FROM product WHERE sku = ?",
          [item.sku]
        );
        if (skuRes.length > 0) existingProduct = skuRes[0];
      }
      if (!existingProduct) {
        const [nameRes] = await connectionPool.execute(
          "SELECT * FROM product WHERE product_name = ?",
          [item.item_name]
        );
        if (nameRes.length > 0) existingProduct = nameRes[0];
      }
      if (existingProduct) {
        // Update the quantity/stock
        const newQuantity = (existingProduct.quantity || 0) + (item.quantity || 0);
        await updateProduct(existingProduct.product_id, { quantity: newQuantity });
      } else {
        // Create a new product
        await createProduct(
          item.item_name, // product_name
          item.description || '', // description
          item.sku || '', // sku
          item.hsn_sac || '', // hsn_sac
          item.price, // unit_price
          item.price, // cost_price
          'purchase', // product_type or your default
          item.tax || 0, // tax
          item.quantity // quantity
        );
      }
      // --- End Product Table Logic ---
    }
  }
};

const deletePurchase = async (id) => {
  const connectionPool = await connectionPoolPromise;
  await connectionPool.execute(
    "DELETE FROM purchases WHERE purchase_id = ?",
    [id]
  );
};

const initializeTables = async () => {
  const connectionPool = await connectionPoolPromise;
  try {
    await connectionPool.execute(createPurchaseTableQuery);
    await connectionPool.execute(createPurchaseItemsTableQuery);
    console.log('Purchase tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Initialize connection and export functions
export {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
  initializeTables
};
