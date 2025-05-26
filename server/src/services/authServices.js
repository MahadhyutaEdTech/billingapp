import jwt from "jsonwebtoken";
import bcrypt  from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
//function for generating hashed password
const generateHashedPassword= async(password)=>{
    const saltRounds = 10; 
    const salt = await bcrypt.genSalt(saltRounds);
    const hashPassword= await bcrypt.hash(password,salt);
    return hashPassword;
}

//function for comparing passwords

const comparePassword= async(password, hashPassword)=>{
    const isTrue=await bcrypt.compare(password,hashPassword);
    return isTrue;
}

//function for generating jwt token

const generateToken= async(user)=>{
    return jwt.sign({username:user.userName,email:user.email},
        process.env.JWTKEY,
        {expiresIn:"2h"}

    );
}

//export all
export { generateHashedPassword, comparePassword, generateToken };
