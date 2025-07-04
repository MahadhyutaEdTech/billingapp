import mysql from "mysql2";
import dotenv from "dotenv";
 dotenv.config();
 const connectionPool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    waitForConnections: true,
    queueLimit:0,
    connectionLimit:10
 }).promise();
 export default connectionPool;
