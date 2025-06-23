import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectById, updateProject } from '../../controllers/projectController';
import "@/css/modules/project/ProjectUpdate.css";

const ProjectUpdate = ({ project, onClose, setProjects }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    projectCode: '',
    clientName: '',
    startDate: '',
    estimatedEndDate: '',
    status: 'In Progress',
    budget: '',
    projectManager: '',
    teamMembers: '',
    priority: 'Medium',
    description: ''
  });

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

  useEffect(() => {
    if (project) {
      setFormData({
        projectName: project.projectName || '',
        projectCode: project.projectCode || '',
        clientName: project.clientName || '',
        startDate: project.startDate?.split('T')[0] || '',
        estimatedEndDate: project.estimatedEndDate?.split('T')[0] || '',
        status: project.status || 'In Progress',
        budget: project.budget || '',
        projectManager: project.projectManager || '',
        teamMembers: project.teamMembers || '',
        priority: project.priority || 'Medium',
        description: project.description || ''
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Format dates to YYYY-MM-DD
      const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date format');
        }
        return date.toISOString().split('T')[0];
      };

      // Format data for submission
      const formattedData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget).toFixed(2) : '0.00',
        startDate: formatDate(formData.startDate),
        estimatedEndDate: formatDate(formData.estimatedEndDate),
        projectName: formData.projectName.trim(),
        projectCode: formData.projectCode.trim(),
        clientName: formData.clientName.trim(),
        projectManager: formData.projectManager.trim(),
        teamMembers: formData.teamMembers.trim(),
        description: formData.description.trim()
      };

      // Validate dates
      if (!formattedData.startDate) {
        throw new Error('Invalid start date');
      }

      if (formattedData.startDate > formattedData.estimatedEndDate) {
        throw new Error('Start date cannot be after end date');
      }

      await updateProject(project.id, formattedData);
      setSuccess(true);
      
      // Update the projects list
      if (setProjects) {
        const updatedProjects = await getProjects();
        setProjects(updatedProjects);
      }
      
      // Close the dialog after successful update
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update project');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (success) return <div className="success">Project updated successfully!</div>;

  return (
    <div className={`project-update-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="project-update-dialog">
        <div className="project-update-header">
          <h2>Update Project</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="project-update-form">
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Project Code</label>
              <input
                type="text"
                name="projectCode"
                value={formData.projectCode}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Client Name</label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Estimated End Date</label>
              <input
                type="date"
                name="estimatedEndDate"
                value={formData.estimatedEndDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Budget</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Project Manager</label>
            <input
              type="text"
              name="projectManager"
              value={formData.projectManager}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Team Members</label>
            <input
              type="text"
              name="teamMembers"
              value={formData.teamMembers}
              onChange={handleChange}
              placeholder="Comma separated names"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="update-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectUpdate;
