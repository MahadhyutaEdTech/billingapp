// db.js
import mysql from "mysql2";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT
} = process.env;

const port = DB_PORT || 3306;

// Step 1: Create a connection without database
const tempConnection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  port: port,
});

async function ensureDatabaseAndGetPool() {
  return new Promise((resolve, reject) => {
    tempConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``,
      (err) => {
        if (err) {
          console.error('❌ Error creating database:', err.message);
          tempConnection.end();
          reject(err);
        } else {
         
          tempConnection.end();

          // Step 3: Create the pool with the database
          const connectionPool = mysql.createPool({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
            port: port,
            waitForConnections: true,
            connectionLimit: 15,
            queueLimit: 0,
          }).promise();

          // Optional: test the DB connection
          connectionPool.query('SELECT 1')
            .then(() => {
              console.log('✅ MySQL database connected');
              resolve(connectionPool);
            })
            .catch(err => {
              console.error('❌ MySQL connection error:', err.message);
              process.exit(1);
            });
        }
      }
    );
  });
}

const connectionPoolPromise = ensureDatabaseAndGetPool();

export default connectionPoolPromise;
