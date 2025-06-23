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

  //updated code to fetch distinct value by name
  /*
  const sqlQuery = `SELECT e.*
FROM expenses e
JOIN (
  SELECT employee, MIN(expenseId) AS minId
  FROM expenses
  GROUP BY employee
) AS t ON e.employee = t.employee AND e.expenseId = t.minId
ORDER BY e.expenseId
LIMIT ${limit} OFFSET ${offset}`;
  */
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

const getExpenseById = async (expenseId) => {
  const sqlQuery = 'SELECT * FROM expenses WHERE expenseId = ?';
  const [rows] = await connectionPool.execute(sqlQuery, [expenseId]);
  
  if (rows.length === 0) {
    return null;
  }

  const expense = rows[0];
  
  try {
    if (expense.natureOfFund) {
      if (typeof expense.natureOfFund === 'object') {
        return expense;
      }
      expense.natureOfFund = JSON.parse(expense.natureOfFund);
    } else {
      expense.natureOfFund = [];
    }
  } catch (error) {
    expense.natureOfFund = [{ type: expense.natureOfFund }];
  }
  
  return expense;
};

export {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getExpenseById
};
