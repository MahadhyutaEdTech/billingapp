import connectionPoolPromise from "../config/databaseConfig.js";

// Ensure users table exists at module load
const createUsersTableIfNotExists = async () => {
  const connectionPool = await connectionPoolPromise;
  await connectionPool.query(`
       CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      profile_image VARCHAR(512)
    )
  `);
};

(async () => {
  await createUsersTableIfNotExists();
})();

// Function to add a new user
export const createUser = async (userName, email, hashedPassword) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = "INSERT INTO users (userName, email, password) VALUES (?, ?, ?)";
  await connectionPool.execute(sqlQuery, [userName, email, hashedPassword]);
};

// Function to get a user by email
export const getUserByEmail = async (email) => {
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = "SELECT * FROM users WHERE email = ?";
  const [rows] = await connectionPool.execute(sqlQuery, [email]);
  return rows.length > 0 ? rows : null;
};

// Function to get a user by ID
export const getUserById = async (user_id) => {
  if (!user_id) {
    throw new Error('User ID is required');
  }
  const connectionPool = await connectionPoolPromise;
  const sqlQuery = "SELECT * FROM users WHERE user_id = ?";
  const [result] = await connectionPool.execute(sqlQuery, [user_id]);
  return result;
};

// Function to update user image URL
export const updateUserImage = async (user_id, imageUrl) => {
  const connectionPool = await connectionPoolPromise;
  const sql = "UPDATE users SET profile_image = ? WHERE user_id = ?";
  const [result] = await connectionPool.execute(sql, [imageUrl, user_id]);
  return result;
};

// Function to update user password
export const updateUserPassword = async (user_id, hashedPassword) => {
  if (!user_id || !hashedPassword) {
    throw new Error('User ID and password are required');
  }
  const connectionPool = await connectionPoolPromise;
  const sql = "UPDATE users SET password = ? WHERE user_id = ?";
  const [result] = await connectionPool.execute(sql, [hashedPassword, user_id]);
  
  if (result.affectedRows === 0) {
    throw new Error('User not found');
  }
  
  return true;
};
