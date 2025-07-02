import connectionPoolPromise from "../config/databaseConfig.js";
import { uploadToS3 } from "../middlewares/s3.js";

// Ensure organizations table exists at module load
const createOrganizationsTableIfNotExists = async () => {
  const connectionPool = await connectionPoolPromise;
  await connectionPool.query(`
    CREATE TABLE IF NOT EXISTS organizations (
      org_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(20) NOT NULL UNIQUE,
      website VARCHAR(255) UNIQUE,
      reg_number VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      logo_image VARCHAR(255),
      gst_details JSON DEFAULT (JSON_OBJECT()),
      bank_name VARCHAR(255),
      acc_name VARCHAR(255),
      ifsc VARCHAR(50),
      branch VARCHAR(100),
      acc_num VARCHAR(100),
      invoice_prefix VARCHAR(50),
      signature_image VARCHAR(255),
      pan_number VARCHAR(20),
      quotation_prefix VARCHAR(10) DEFAULT 'QT'
    )
  `);
};

(async () => {
  await createOrganizationsTableIfNotExists();
})();

const createOrganization = async (
  name,
  type,
  email,
  phone,
  website,
  reg_number,
  pan_number,
  gst_details,
  invoice_prefix,
  logo_image,
  signature_image,
  bank_name,
  acc_name,
  ifsc,
  branch,
  acc_num
) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = `
    INSERT INTO organizations 
    (name, type, email, phone, website, reg_number,pan_number, gst_details, invoice_prefix, logo_image, signature_image, bank_name, acc_name, ifsc, branch, acc_num) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
  `;

  const [result] = await connectionPool.execute(sqlQuery, [
    name,
    type,
    email,
    phone,
    website,
    reg_number,
    pan_number,
    JSON.stringify(gst_details),
    invoice_prefix,
    null, // placeholder for logo
    null, // placeholder for signature
    bank_name,
    acc_name,
    ifsc,
    branch,
    acc_num,
  ]);

  const organizationId = result.insertId;

  try {
    // Upload the logo to S3
    const logoUrl = await uploadToS3(logo_image.path, `logo_${organizationId}`);
    
    // Upload the signature to S3
    const signatureUrl = signature_image ? 
      await uploadToS3(signature_image.path, `signature_${organizationId}`) : 
      null;

    // Update logo_image and signature_image URLs in the DB
    const updateSql = `UPDATE organizations SET logo_image = ?, signature_image = ? WHERE org_id = ?`;
    await connectionPool.execute(updateSql, [logoUrl, signatureUrl, organizationId]);

    return { 
      id: organizationId, 
      logo_image: logoUrl,
      signature_image: signatureUrl 
    };
  } catch (error) {
    console.error("Error uploading images to S3", error);
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};

const getOrganization = async () => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = `SELECT * FROM organizations`;
  try {
    const [res] = await connectionPool.execute(sqlQuery);
    return res;
  } catch (error) {
    console.error('Error executing query:', error);
    throw new Error("Error executing the SQL query.");
  }
};

const getOrganizationById = async (org_id) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = "SELECT * FROM organizations where org_id=?";
  const [res] = await connectionPool.execute(sqlQuery, [org_id]);
  return res;
};

const updateOrganization = async (org_id, data) => {
  const connectionPool = await connectionPoolPromise;
  try {
    const { logo_image, signature_image, ...otherData } = data;
    let updateValues = { ...otherData };

    // Upload logo if new file provided
    if (logo_image?.path) {
      try {
        const logoUrl = await uploadToS3(logo_image.path, `logo_${org_id}`);
        updateValues.logo_image = logoUrl;
      } catch (err) {
        console.error('Logo upload error:', err);
      }
    }

    // Upload signature if new file provided
    if (signature_image?.path) {
      try {
        const signatureUrl = await uploadToS3(signature_image.path, `signature_${org_id}`);
        updateValues.signature_image = signatureUrl;
      } catch (err) {
        console.error('Signature upload error:', err);
      }
    }

    // Handle GST details
    if (updateValues.gst_details) {
      updateValues.gst_details = typeof updateValues.gst_details === 'string' 
        ? updateValues.gst_details 
        : JSON.stringify(updateValues.gst_details);
    }

    const fields = Object.keys(updateValues);
    const values = Object.values(updateValues);

    if (fields.length === 0) {
      throw new Error("No fields provided for update");
    }

    const setClause = fields.map(field => `${field} = ?`).join(", ");
    const sqlQuery = `UPDATE organizations SET ${setClause} WHERE org_id = ?`;
    
    const [result] = await connectionPool.execute(sqlQuery, [...values, org_id]);
    
    // Fetch and return updated organization
    const [updatedOrg] = await connectionPool.execute(
      'SELECT * FROM organizations WHERE org_id = ?', 
      [org_id]
    );
    
    return updatedOrg[0];
  } catch (error) {
    console.error("Error in updateOrganization:", error);
    throw error;
  }
};

const deleteOrganization = async (org_id) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = 'delete from organizations where org_id= ?';
  const [result] = await connectionPool.execute(sqlQuery, [org_id]);
  return result;
};

export { createOrganization, getOrganization, updateOrganization, deleteOrganization, getOrganizationById };