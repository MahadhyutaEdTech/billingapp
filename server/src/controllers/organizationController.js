import {createOrganization,getOrganization,updateOrganization,deleteOrganization,getOrganizationById} from "../models/organizationModel.js"

const createOrganizations = async (req, res) => {
    try {
      const {
        name,
        type,
        email,
        phone,
        website,
        reg_number,
        invoice_prefix,
        bank_name,
        acc_name,
        ifsc,
        branch,
        acc_num,
      } = req.body;
  
      // Parse gst_details from string to JSON
      const gst_details = JSON.parse(req.body.gst_details || '{}');
  
      // logo_image is in req.file
      const logo_image = req.file;
  
      if (!name || !logo_image) {
        return res.status(400).json({ message: "Missing required fields: name or logo_image" });
      }
  
      const result = await createOrganization(
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
      );
  
      res.status(201).json({ message: "Organization registered successfully", data: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error", error });
    }
  };

const getOrganizations=async(req,res)=>{
    try{
        const result=await getOrganization();
        res.status(200).json(result);

    }
    catch(error){
        console.log(error);
      res.status(500).json({message:"Server Error",error});

    }
}
const updateOrganizations= async(req,res)=>{
   try{
    const org_id=req.query.org_id;
    const data=req.body;
    if (!org_id) {
        return res.status(400).json({ message: "org_id is required" });
    }
    const updatedData=await updateOrganization(org_id,data);
    res.status(200).json({ message: "Organization Data updated successfully", updatedData });
   }
   catch(error){
    res.status(500).json({ message: "Server Error", error:"Error while updating data"});
   }
}

const deleteOrganizations= async(req,res)=>{
    try{
        const org_id=req.query.org_id;
        if (!org_id) {
            return res.status(400).json({ message: "org_id is required" });
        }
        const updatedData=await deleteOrganization(org_id);
        res.status(200).json({ message: "Organization Data deleted successfully", updatedData });
    }
    catch(error){
        res.status(500).json({ message: "Server Error", error:"Error while deleting data"});

    }
}


const getOrganizationsById=async(req,res)=>{
    try{
        const org_id=req.query.org_id;
        if (!org_id) {
            return res.status(400).json({ message: "org_id is required" });
        }
        const updatedData=await getOrganizationById(org_id);
        res.status(200).json(updatedData);

    }
    catch(error){
        res.status(500).json({ message: "Server Error", error:"Error while deleting data"});
    }
}
export {createOrganizations,getOrganizations,updateOrganizations,deleteOrganizations,getOrganizationsById};