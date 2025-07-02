import React, { useState, useEffect } from 'react';
import "@/css/modules/project/AddProject.css";
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { API_BASE } from '../../config/config';

const AddProject = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [project, setProject] = useState({
    projectName: '',
    projectCode: '',
    clientName: '',
    startDate: '',
    estimatedEndDate: '',
    budget: '',
    priority: 'Medium',
    projectManager: '',
    description: '',
    teamMembers: '',
    status: 'Not Started'
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Dark mode detection
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark-mode');
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Initial check
    setIsDarkMode(document.documentElement.classList.contains('dark-mode'));

    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitted(false);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authorization token not found.");

      const response = await axiosInstance.post(
        `${API_BASE}/proj/projects`,
        project,
        {
          headers: {
            Authorization: `Bearer ${token}`,
             "ngrok-skip-browser-warning": "true",
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        //console.log("✅ Project successfully added:", response.data);
        setSubmitted(true);
        setProject({
          projectName: '',
          projectCode: '',
          clientName: '',
          startDate: '',
          estimatedEndDate: '',
          budget: '',
          priority: 'Medium',
          projectManager: '',
          description: '',
          teamMembers: '',
          status: 'Not Started'
        });

        // Optionally redirect after success
        setTimeout(() => {
          navigate('/dashboard/project-page');
        }, 2000);
      } else {
        throw new Error("Unexpected response from the server.");
      }

    } catch (err) {
      console.error("🚫 Error adding project:", err);
      setError(err.response?.data?.message || err.message);
    }
  };

 
  return (
    <div className={`add-project-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <h2>Add New Project</h2>
      
      {submitted && (
        <div className="success-message">
          Project successfully added!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="projectName">Project Name</label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              value={project.projectName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="projectCode">Project Code</label>
            <input
              type="text"
              id="projectCode"
              name="projectCode"
              value={project.projectCode}
              onChange={handleChange}
              placeholder="e.g. PRJ-2025-001"
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="clientName">Client Name</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={project.clientName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="projectManager">Project Manager</label>
            <input
              type="text"
              id="projectManager"
              name="projectManager"
              value={project.projectManager}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={project.startDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="estimatedEndDate">Estimated End Date</label>
            <input
              type="date"
              id="estimatedEndDate"
              name="estimatedEndDate"
              value={project.estimatedEndDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="budget">Budget</label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={project.budget}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={project.priority}
              onChange={handleChange}
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="teamMembers">Team Members</label>
            <textarea
              id="teamMembers"
              name="teamMembers"
              value={project.teamMembers}
              onChange={handleChange}
              placeholder="Add team members (comma separated)"
              rows="2"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Project Status</label>
            <select
              id="status"
              name="status"
              value={project.status}
              onChange={handleChange}
              required
            >
              <option value="Not Started">Not Started</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
     
        
        <div className="form-actions">
          <button type="submit" className="add-project-container-submit-btn ">Add Project</button>
           <button type="button" className="add-project-container-reset-btn" onClick={() => navigate('/dashboard/project-page')}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProject;