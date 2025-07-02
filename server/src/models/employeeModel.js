import connectionPoolPromise from "../config/databaseConfig.js";

// Ensure employees table exist at module load
const createEmployeesTableIfNotExists = async () => {
  const connectionPool = await connectionPoolPromise;
  await connectionPool.query(`
  CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(100),
      lastName VARCHAR(100),
      email VARCHAR(150) UNIQUE,
      phone VARCHAR(20),
      position VARCHAR(100),
      department VARCHAR(100),
      joinDate DATE,
      salary DECIMAL(10,2),
      address TEXT,
      emergencyContact TEXT
    )
  `);
};

// Only ensure table exists at module load
(async () => {
  await createEmployeesTableIfNotExists();
})();

export const createEmployee = async (data) => {
  const connectionPool = await connectionPoolPromise;
  const {
    firstName, lastName, email, phone,
    position, department, joinDate,
    salary, address, emergencyContact,
  } = data;

  const sql = `
    INSERT INTO employees (firstName, lastName, email, phone, position, department, joinDate, salary, address, emergencyContact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await connectionPool.execute(sql, [
    firstName, lastName, email, phone, position, department, joinDate, salary, address, emergencyContact
  ]);
};

export const getAllEmployees = async () => {
  const connectionPool = await connectionPoolPromise;
  const [rows] = await connectionPool.execute("SELECT * FROM employees");
  return rows;
};

export const getEmployeeById = async (id) => {
  const connectionPool = await connectionPoolPromise;
  const [rows] = await connectionPool.execute(
    "SELECT * FROM employees WHERE id = ?",
    [id]
  );
  return rows[0];
};

export const updateEmployee = async (id, data) => {
  const connectionPool = await connectionPoolPromise;
  const {
    firstName, lastName, email, phone,
    position, department, joinDate,
    salary, address, emergencyContact
  } = data;

  const sql = `
    UPDATE employees 
    SET firstName=?, lastName=?, email=?, phone=?,
        position=?, department=?, joinDate=?,
        salary=?, address=?, emergencyContact=?
    WHERE id=?
  `;

  const [result] = await connectionPool.execute(sql, [
    firstName, lastName, email, phone,
    position, department, joinDate,
    salary, address, emergencyContact,
    id
  ]);

  return result.affectedRows > 0;
};

export const deleteEmployee = async (id) => {
  const connectionPool = await connectionPoolPromise;
  const [result] = await connectionPool.execute(
    "DELETE FROM employees WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};

