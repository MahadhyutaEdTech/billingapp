import connectionPool from "../config/databaseConfig.js";
import { uploadToS3 } from "../middlewares/s3.js";

const createOrganization = async (
  name,
  type,
  email,
  phone,
  website,
  reg_number,
  gst_details,
  invoice_prefix,
  logo_image,
  bank_name,
  acc_name,
  ifsc,
  branch,
  acc_num
) => {
  const sqlQuery = `
    INSERT INTO organizations 
    (name, type, email, phone, website, reg_number, gst_details, invoice_prefix, logo_image, bank_name, acc_name, ifsc, branch, acc_num) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await connectionPool.execute(sqlQuery, [
    name,
    type,
    email,
    phone,
    website,
    reg_number,
    JSON.stringify(gst_details),
    invoice_prefix,
    null, // placeholder for logo, updated later
    bank_name,
    acc_name,
    ifsc,
    branch,
    acc_num,
  ]);

  const organizationId = result.insertId;

  try {
    // Upload the logo to S3
    const imageUrl = await uploadToS3(logo_image.path, organizationId);

    // Update logo_image URL in the DB
    const updateSql = `UPDATE organizations SET logo_image = ? WHERE org_id = ?`;
    await connectionPool.execute(updateSql, [imageUrl, organizationId]);

    return { id: organizationId, logo_image: imageUrl };
  } catch (error) {
    console.error("Error uploading logo to S3", error);
    throw new Error(`Failed to upload logo image: ${error.message}`);
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


const updateOrganization=async(org_id,data)=>{
    const fields = Object.keys(data);
    const values = Object.values(data);
  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }
  const setClause = fields.map((field) => `${field} = ?`).join(", ");  
  const sqlQuery = `UPDATE organizations SET ${setClause} WHERE org_id = ?`;
  const [result] = await connectionPool.execute(sqlQuery, [...values, org_id]);
  return result;
}
const deleteOrganization=async(org_id)=>{
    const sqlQuery='delete from organizations where org_id= ?';
    const [result]=await connectionPool.execute(sqlQuery,[org_id]);
    return result;

}
export {createOrganization,getOrganization,updateOrganization,deleteOrganization,getOrganizationById} ;