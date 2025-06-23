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
    // Generate access token
    const accessToken = jwt.sign(
        { 
            userId: user.user_id || user.id,
            email: user.email,
            userName: user.userName || user.username
        },
        process.env.JWTKEY,
        { expiresIn: '1h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
        { userId: user.user_id || user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    return {
        accessToken,
        refreshToken
    };
}

export const generateEmailVerificationToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.EMAIL_VERIFICATION_SECRET,
        { expiresIn: '24h' }
    );
};

//export all
export { generateHashedPassword, comparePassword, generateToken };
