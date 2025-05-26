import connectionPool from "../config/databaseConfig.js";

export const createEmployee = async (data) => {
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
  const [rows] = await connectionPool.execute("SELECT * FROM employees");
  return rows;
};
