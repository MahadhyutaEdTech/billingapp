import connectionPool from "../config/databaseConfig.js";
import { uploadToS3 } from "../middlewares/s3.js";

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
   
    const sqlQuery = `SELECT * FROM organizations`;
    try {
        const [res] = await connectionPool.execute(sqlQuery);
        return res;
    } catch (error) {
        console.error('Error executing query:', error);
        throw new Error("Error executing the SQL query.");
    }
};

const getOrganizationById=async(org_id)=>{
    const sqlQuery = "SELECT * FROM organizations where org_id=?";
    const [res]=await  connectionPool.execute(sqlQuery,[org_id]);
    return res;
}


const updateOrganization = async (org_id, data) => {
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
}

const deleteOrganization=async(org_id)=>{
    const sqlQuery='delete from organizations where org_id= ?';
    const [result]=await connectionPool.execute(sqlQuery,[org_id]);
    return result;

}
export {createOrganization,getOrganization,updateOrganization,deleteOrganization,getOrganizationById} ;