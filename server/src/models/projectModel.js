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

export const getProjectById = async (id) => {
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
