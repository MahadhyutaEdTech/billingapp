import connectionPool from "../config/databaseConfig.js";

// Function to add a new user
export const createUser = async (userName, email, hashedPassword) => {
  const sqlQuery = "INSERT INTO users (userName, email, password) VALUES (?, ?, ?)";
  await connectionPool.execute(sqlQuery, [userName, email, hashedPassword]);
};

// Function to get a user by email
export const getUserByEmail = async (email) => {
  const sqlQuery = "SELECT * FROM users WHERE email = ?";
  const rows = await connectionPool.query(sqlQuery, [email]);
  return rows[0].length > 0 ? rows[0] : null;
};

// Function to get a user by ID
export const getUserById = async (user_id) => {
  if (!user_id) {
    throw new Error('User ID is required');
  }
  const sqlQuery = "SELECT * FROM users WHERE user_id = ?";
  const [result] = await connectionPool.execute(sqlQuery, [user_id]);
  return result;
};

// Function to update user image URL
export const updateUserImage = async (user_id, imageUrl) => {
  const sql = "UPDATE users SET profile_image = ? WHERE user_id = ?";
  const [result] = await connectionPool.execute(sql, [imageUrl, user_id]);
  return result;
};

// Function to update user password
export const updateUserPassword = async (user_id, hashedPassword) => {
  if (!user_id || !hashedPassword) {
    throw new Error('User ID and password are required');
  }
  const sql = "UPDATE users SET password = ? WHERE user_id = ?";
  const [result] = await connectionPool.execute(sql, [hashedPassword, user_id]);
  
  if (result.affectedRows === 0) {
    throw new Error('User not found');
  }
  
  return true;
};
