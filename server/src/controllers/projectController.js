import { createProject, getAllProjects, getProjectById, updateProject, deleteProject } from "../models/projectModel.js";

export const handleCreateProject = async (req, res) => {
  try {
    await createProject(req.body);
    res.status(201).json({ message: "Project created successfully" });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
};

export const handleGetProjects = async (req, res) => {
  try {
    const projects = await getAllProjects();
    res.status(200).json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const handleGetProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching project with ID:', id);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "Invalid project ID format" });
    }

    const project = await getProjectById(id);
    console.log('Project data:', project);

    if (!project) {
      console.log('Project not found for ID:', id);
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json(project);
  } catch (err) {
    console.error("Error in handleGetProjectById:", err);
    res.status(500).json({ 
      error: "Failed to fetch project",
      details: err.message 
    });
  }
};

export const handleUpdateProject = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating project:', id, req.body);

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "Invalid project ID format" });
    }

    // Validate required fields
    const requiredFields = ['projectName', 'projectCode', 'clientName', 'status'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: "Missing required fields",
        fields: missingFields 
      });
    }

    const updated = await updateProject(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({ message: "Project updated successfully" });
  } catch (err) {
    console.error("Error in handleUpdateProject:", err);
    res.status(500).json({ 
      error: "Failed to update project",
      details: err.message 
    });
  }
};

export const handleDeleteProject = async (req, res) => {
  try {
    const deleted = await deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
};