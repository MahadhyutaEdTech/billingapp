import connectionPool from "../config/databaseConfig.js";

const createExpense = async (
  expenseId,
  project,
  employee,
  paidby,
  natureOfFund, 
  debit,
  credit,
  date,
  updatedDate,
  remarks,
  createdDate
) => {
  const sqlQuery = `
    INSERT INTO expenses (
      expenseId, project, employee, paidby, natureOfFund, debit, credit, date, updatedDate, remarks, createdDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const natureOfFundJson = JSON.stringify(natureOfFund);

  await connectionPool.execute(sqlQuery, [
    expenseId,
    project,
    employee,
    paidby,
    natureOfFundJson,
    debit,
    credit,
    date,
    updatedDate,
    remarks,
    createdDate
  ]);
};

const getExpenses = async (limit, offset) => {
  limit = Number(limit);
  offset = Number(offset);
  const sqlQuery = `SELECT * FROM expenses ORDER BY expenseId LIMIT ${limit} OFFSET ${offset}`;
  try {
    const [res] = await connectionPool.execute(sqlQuery);
    return res;
  } catch (error) {
    console.error('Error executing query:', error);
    throw new Error("Error executing the SQL query.");
  }
};

const updateExpense = async (expenseId, data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);

  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  const index = fields.indexOf("natureOfFund");
  if (index !== -1) {
    values[index] = JSON.stringify(values[index]);
  }

  const sqlQuery = `UPDATE expenses SET ${setClause} WHERE expenseId = ?`;
  const [result] = await connectionPool.execute(sqlQuery, [...values, expenseId]);
  return result;
};


const deleteExpense = async (expenseId) => {
  const sqlQuery = 'DELETE FROM expenses WHERE expenseId = ?';
  const [result] = await connectionPool.execute(sqlQuery, [expenseId]);
  return result;
};

export {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense
};
