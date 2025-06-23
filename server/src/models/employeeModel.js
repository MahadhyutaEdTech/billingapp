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

export const getEmployeeById = async (id) => {
  const [rows] = await connectionPool.execute(
    "SELECT * FROM employees WHERE id = ?",
    [id]
  );
  return rows[0];
};

export const updateEmployee = async (id, data) => {
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
  const [result] = await connectionPool.execute(
    "DELETE FROM employees WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};
