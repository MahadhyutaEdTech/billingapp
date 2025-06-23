// db.js
import mysql from "mysql2";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Create a MySQL connection pool
const connectionPool = mysql.createPool({
  host: process.env.DB_HOST,           // e.g., "localhost" or your cloud host
  user: process.env.DB_USER,           // your MySQL username
  password: process.env.DB_PASSWORD,   // your MySQL password
  database: process.env.DB_NAME,       // your database name
  port: process.env.DB_PORT || 3306,   // default MySQL port
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
}).promise();

// Optional: test the DB connection
connectionPool.query('SELECT 1')
  .then(() => console.log('✅ MySQL database connected'))
  .catch(err => {
    console.error('❌ MySQL connection error:', err.message);
    process.exit(1);
  });

export default connectionPool;
