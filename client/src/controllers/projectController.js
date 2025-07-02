import axios from "axios";
import { API_BASE } from "../config/config";

const getAuthHeaders = () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authorization token found");
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
  } catch (error) {
    console.error("Auth header error:", error);
    throw new Error("Authorization failed");
  }
};

export const getProjects = async () => {
  try {
    //console.log("Fetching projects from API...");
    const response = await axios.get(`${API_BASE}/proj/projects`, {
      headers: getAuthHeaders()
    });

    if (!response.data) {
      throw new Error("No data received from server");
    }

    // Transform and validate the data
    const projects = Array.isArray(response.data) ? response.data : [response.data];
    
    // Ensure all required fields are present and properly formatted
    const validatedProjects = projects.map(project => ({
      id: project.id,
      projectName: project.projectName || '',
      projectCode: project.projectCode || '',
      clientName: project.clientName || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString() : null,
      estimatedEndDate: project.estimatedEndDate ? new Date(project.estimatedEndDate).toISOString() : null,
      status: project.status || 'Unknown',
      budget: typeof project.budget === 'string' ? parseFloat(project.budget) : project.budget || 0,
      projectManager: project.projectManager || '',
      teamMembers: project.teamMembers || '',
      priority: project.priority || 'Medium',
      description: project.description || ''
    }));

   // console.log("Validated projects:", validatedProjects);
    return validatedProjects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    // Validate required fields
    const requiredFields = ['projectName', 'projectCode', 'clientName', 'startDate', 'status'];
    const missingFields = requiredFields.filter(field => !projectData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const response = await axios.post(
      `${API_BASE}/proj/projects`,
      projectData,
      { 
        headers: getAuthHeaders(),
        validateStatus: status => status < 500
      }
    );

    if (!response.data) {
      throw new Error('No response data received');
    }

    // Clear cache and return
    localStorage.removeItem("projects");
    return response.data;
  } catch (error) {
    console.error('Create project error:', error);
    throw new Error(error.response?.data?.message || 'Failed to create project');
  }
};

export const getProjectById = async (projectId) => {
  try {
    // Validate projectId
    if (!projectId || isNaN(projectId)) {
      throw new Error(`Invalid project ID: ${projectId}`);
    }

    const response = await axios.get(`${API_BASE}/proj/projects/${projectId}`, {
      headers: getAuthHeaders(),
      validateStatus: status => status >= 200 && status < 300
    });

    if (!response.data) {
      throw new Error('No project data received');
    }

    // Transform dates and budget to expected format
    return {
      ...response.data,
      startDate: response.data.startDate || null,
      estimatedEndDate: response.data.estimatedEndDate || null,
      budget: response.data.budget?.toString() || '0'
    };
  } catch (error) {
    console.error('Get project error:', error);
    throw new Error(error.response?.data?.message || `Failed to fetch project: ${error.message}`);
  }
};

export const updateProject = async (projectId, data) => {
  try {
    if (!projectId || isNaN(projectId)) {
      throw new Error(`Invalid project ID: ${projectId}`);
    }

    // Format dates to YYYY-MM-DD for MySQL
    const formatDate = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    const formattedData = {
      ...data,
      startDate: formatDate(data.startDate),
      estimatedEndDate: formatDate(data.estimatedEndDate),
      budget: typeof data.budget === 'number' ? data.budget.toFixed(2) : data.budget
    };

    const response = await axios.put(
      `${API_BASE}/proj/projects/${projectId}`,
      formattedData,
      { 
        headers: getAuthHeaders(),
        validateStatus: (status) => status >= 200 && status < 300
      }
    );

    if (!response.data) {
      throw new Error('No data received from server');
    }

    localStorage.removeItem("projects");
    return response.data;
  } catch (error) {
    console.error('Update project error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Failed to update project');
  }
};

export const deleteProject = async (projectId) => {
  try {
    if (!projectId || projectId === 'undefined' || isNaN(Number(projectId))) {
      throw new Error('Invalid project ID format');
    }

    //console.log('Deleting project:', projectId);
    const response = await axios.delete(
      `${API_BASE}/proj/projects/${projectId}`,
      { 
        headers: getAuthHeaders(),
        validateStatus: status => status < 500 
      }
    );

    if (response.status === 404) {
      throw new Error('Project not found');
    }

    if (response.status !== 200) {
      throw new Error('Failed to delete project');
    }

    localStorage.removeItem("projects");
    return response.data;
  } catch (error) {
    console.error('Delete project error:', error);
    throw new Error(error.response?.data?.message || error.message);
  }
};
