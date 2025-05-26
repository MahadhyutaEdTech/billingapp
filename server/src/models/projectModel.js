import connectionPool from "../config/databaseConfig.js";

export const createProject = async (data) => {
  const {
    projectName, projectCode, clientName,
    startDate, estimatedEndDate, budget,
    priority, projectManager, description,
    teamMembers, status,
  } = data;

  const sql = `
    INSERT INTO projects (projectName, projectCode, clientName, startDate, estimatedEndDate, budget, priority, projectManager, description, teamMembers, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await connectionPool.execute(sql, [
    projectName, projectCode, clientName, startDate,
    estimatedEndDate, budget, priority, projectManager,
    description, teamMembers, status
  ]);
};

export const getAllProjects = async () => {
  const [rows] = await connectionPool.execute("SELECT * FROM projects");
  return rows;
};
