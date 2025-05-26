import connectionPool  from "../config/databaseConfig.js";
const createTaxs=async(tax_type,tax_rate,valid_from,valid_untill)=>{
    const sqlQuery="Insert into tax (tax_type,tax_rate,valid_from,valid_until) values (?, ?, ?, ?)";
    await connectionPool.execute(sqlQuery,[tax_type,tax_rate,valid_from,valid_untill]);
}

const getTaxs=async()=>{
    const sqlQuery="Select * from tax";
    const [res] =await connectionPool.execute(sqlQuery);
    return res;
}

const updateTaxs=async(tax_id,data)=>{
    const fields=Object.keys(data);
    const values=Object.values(data);
    if(fields.length===0){
        throw new Error("No fields provided for update");
    }
    const setClause = fields.map((field) => `${field} = ?`).join(", ");  
  const sqlQuery = `UPDATE tax SET ${setClause} WHERE tax_id = ?`;
    
   const [result] =await connectionPool.execute(sqlQuery,[...values,tax_id]);
    return result;
}

const deleteTaxs=async(tax_id)=>{
    const sqlQuery="Delete from tax where tax_id=?";
    const [result] =await connectionPool.execute(sqlQuery,[tax_id]);
    return result;
}

export {createTaxs,getTaxs,updateTaxs,deleteTaxs};