import connectionPoolPromise from "../config/databaseConfig.js";

// Ensure projects table exists at module load
const createProjectsTableIfNotExists = async () => {
  const connectionPool = await connectionPoolPromise;
  await connectionPool.query(`
CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      projectName VARCHAR(255),
      projectCode VARCHAR(100) UNIQUE,
      clientName VARCHAR(255),
      startDate DATE,
      estimatedEndDate DATE,
      budget DECIMAL(12,2),
      priority VARCHAR(50),
      projectManager VARCHAR(100),
      description TEXT,
      teamMembers TEXT,
      status VARCHAR(50)
    )
  `);
};

(async () => {
  await createProjectsTableIfNotExists();
})();

export const createProject = async (data) => {
  const connectionPool = await connectionPoolPromise;
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
  const connectionPool = await connectionPoolPromise;
  const [rows] = await connectionPool.execute("SELECT * FROM projects");
  return rows;
};

export const getProjectById = async (id) => {
  const connectionPool = await connectionPoolPromise;
  try {
    console.log('Executing getProjectById query for ID:', id);
    const [rows] = await connectionPool.execute(
      "SELECT * FROM projects WHERE id = ?",
      [id]
    );
    console.log('Query result:', rows);
    return rows[0];
  } catch (error) {
    console.error('Database error in getProjectById:', error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const updateProject = async (id, data) => {
  const connectionPool = await connectionPoolPromise;
  try {
    console.log('Updating project with ID:', id);

    if (!id) throw new Error('Project ID is required');

    // Validate required fields
    const requiredFields = ['projectName', 'projectCode', 'clientName', 'startDate', 'status'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }

    const [result] = await connectionPool.execute(
      `SELECT id FROM projects WHERE id = ?`,
      [id]
    );

    if (!result.length) {
      throw new Error('Project not found');
    }

    const sql = `
      UPDATE projects 
      SET projectName=?, projectCode=?, clientName=?, 
          startDate=?, estimatedEndDate=?, budget=?, 
          priority=?, projectManager=?, description=?, 
          teamMembers=?, status=?
      WHERE id=?
    `;

    const [updateResult] = await connectionPool.execute(sql, [
      data.projectName,
      data.projectCode,
      data.clientName,
      data.startDate,
      data.estimatedEndDate || null,
      data.budget || 0,
      data.priority || 'Medium',
      data.projectManager || '',
      data.description || '',
      data.teamMembers || '',
      data.status,
      id
    ]);
    
    console.log('Update result:', updateResult);
    if (!updateResult.affectedRows) {
      throw new Error('Failed to update project');
    }

    return true;
  } catch (error) {
    console.error('Database error in updateProject:', error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const deleteProject = async (id) => {
  const connectionPool = await connectionPoolPromise;
  try {
    if (!id) throw new Error('Project ID is required');

    const [exists] = await connectionPool.execute(
      `SELECT id FROM projects WHERE id = ?`,
      [id]
    );

    if (!exists.length) {
      throw new Error('Project not found');
    }

    const [result] = await connectionPool.execute(
      "DELETE FROM projects WHERE id = ?",
      [id]
    );

    if (!result.affectedRows) {
      throw new Error('Failed to delete project');
    }

    return true;
  } catch (error) {
    console.error('Delete project error:', error);
    throw error;
  }
};
