import { generateHashedPassword, comparePassword, generateToken } from "../services/authServices.js"
import {validateName,validateEmail} from "../services/validation.js"
import { createUser,getUserByEmail, getUserById,updateUserImage} from "../models/userModel.js";
import { uploadToS3 } from "../middlewares/s3.js";


const registerUser = async(req,res) =>{

  const{userName,email,password} = req.body;
  
  try {
      if(!validateEmail(email)){
          return res.status(400).json({message:"Invalid Email"});
      }
      
      if(!validateName(userName)){
          return res.status(400).json({message:"Invalid Name"});
      }
      
      const userExist = await getUserByEmail(email);
      
      if(userExist){
          return res.status(400).json({message:"Email already exist"});
      }
      const hashedPassword = await generateHashedPassword(password);
      await createUser(userName,email,hashedPassword);
      const token = await generateToken({userName,email});
      res.status(201).json({message:"User registered successfully ",token});
  } catch (error) {
      console.log(error);
      res.status(500).json({message:"Server Error",error});
  }
}
//Controller for user login...
 const loginUser = async(req,res) =>{
  console.log(req.body);
  const{email,password} = req.body;
  try {
      const [user,...other] = await getUserByEmail(email);
      console.log(user);
      if(!user){
          return res.status(404).json({message:"User not found"});
      }
      const isTrue = await comparePassword(password,user.password);
      if(!isTrue){
          return res.status(400).json({message:"Invalid Password"});
      }
      const token = await generateToken(user);
      res.status(200).json({message:"Login Sucessful",token,user});
  } catch (error) {
      res.status(500).json({message:"Server Error",error});
  }
}

const getUserDetails=async(req,res) =>{
    const user_id=req.query.user_id;
    try{
        const userExist = await getUserById(user_id);
        if(userExist!=null){
            return res.status(200).json({ message: "User Details", userExist })
        }
    }
    catch(e){
        res.status(500).json({message:"Server Error",e});

    }
}
// controller.js
const updateUserImageController = async (req, res) => {
    try {
      const {user_id} = req.body; 
      const imagePath = req.file.path; 
      
      // Stage 1: Upload image to S3
      const imageUrl = await uploadToS3(imagePath, user_id);
    
      if (!imageUrl) {
        return res.status(500).json({ message: "Failed to upload image to S3" });
      }
  
      // Stage 2: Update user image URL in database
      const result = await updateUserImage(user_id, imageUrl);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found, image not updated" });
      }
  
      // Success: All steps completed successfully
      res.status(200).json({ message: "User profile image updated successfully", result });
    } catch (error) {
      // Error handling at each step with different error messages
      if (error.message.includes('S3')) {
        res.status(500).json({ message: "Error uploading image to S3", error: error.message });
      } else if (error.message.includes('database')) {
        res.status(500).json({ message: "Error updating user image in database", error: error.message });
      } else {
        res.status(500).json({ message: "Unexpected error occurred", error: error.message });
      }
    }
  };
  
  


export {registerUser,loginUser,getUserDetails,updateUserImageController};