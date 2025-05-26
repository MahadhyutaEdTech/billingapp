import { createProject,getAllProjects } from "../models/projectModel.js";

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