import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaCodeBranch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../../controllers/projectController';
import ProjectUpdate from './ProjectUpdate';
import Spinner from '../../components/Spinner';
import "@/css/modules/project/ProjectPage.css";

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const spinnerTimeout = useRef(null);
  const navigate = useNavigate();
  const didFetch = useRef(false);
  
  useEffect(() => {
    if (!didFetch.current) {
      fetchProjects();
      didFetch.current = true;
    }
    // Cleanup on unmount
    return () => {
      if (spinnerTimeout.current) clearTimeout(spinnerTimeout.current);
    };
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    // Debounce spinner: only show if loading takes >200ms
    spinnerTimeout.current = setTimeout(() => setShowSpinner(true), 200);
    try {
      const data = await getProjects();
      if (!Array.isArray(data)) {
        throw new Error('Invalid project data received');
      }
      setProjects(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load projects';
      setError(errorMessage);
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
      if (spinnerTimeout.current) clearTimeout(spinnerTimeout.current);
      setShowSpinner(false);
    }
  };

  const handleError = (error) => {
    console.error('API Error:', error);
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      errorMessage = error.response.data.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'No response from server';
    }
    
    setError(errorMessage);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        setLoading(true);
        await deleteProject(projectId);
        await fetchProjects();
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to delete project');
        console.error('Delete error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredProjects = projects.filter(project => 
    project?.projectName?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleUpdate = (project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="project-container">
      <section className="project-section">
        <div className="project-header">
          <div className="project-header-content">
            <div className="project-header-left">
              <h2 className="project-title">
                <FaCodeBranch /> Projects
              </h2>
              <div className="project-search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <button 
              className="project-create-btn"
              onClick={() => navigate('/dashboard/add-project')}
            >
              <FaPlus /> 
              Create New
            </button>
          </div>
        </div>

        <div className="project-table-container">
          <div className="table-scroll-wrapper">
            <table className="project-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Project Code</th>
                  <th>Client</th>
                  <th>Start Date</th>
                  <th>Status</th>
                  <th>Budget</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {showSpinner && loading ? (
                  <tr>
                    <td colSpan="7" className="loading-cell">
                      <div className="table-spinner">
                        <Spinner />
                        <span>Loading projects...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="error-cell">
                      <div className="error-message">{error}</div>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map(project => (
                    <tr key={project.id || 'unknown'}>
                      <td>{project.projectName || 'Untitled'}</td>
                      <td>{project.projectCode || 'N/A'}</td>
                      <td>{project.clientName || 'No Client'}</td>
                      <td>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'No Date'}</td>
                      <td>
                        <span className={`project-table status ${(project.status || '').toLowerCase().replace(' ', '-')}`}>
                          {project.status || 'Unknown'}
                        </span>
                      </td>
                      <td>₹{(project.budget || 0).toLocaleString()}</td>
                      <td>
                        <span className="action-buttons">
                          <span className="project-update-btn" onClick={() => handleUpdate(project)}>
                            <FaEdit />
                          </span>
                          <span className="project-delete-btn" onClick={() => handleDelete(project.id)}>
                            <FaTrash />
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data-cell">
                      <div className="no-data-message">No projects available</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="simple-pagination">
            <div className="page-info">
              Showing {filteredProjects.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredProjects.length)} of {filteredProjects.length} entries
            </div>
            <div className="pagination-controls">
              <button 
                className="control-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <input
                type="number"
                value={currentPage}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value > 0 && value <= totalPages) {
                    handlePageChange(value);
                  }
                }}
                min="1"
                max={totalPages}
              />
              <span className="page-info">of {totalPages}</span>
              <button 
                className="control-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {isDialogOpen && selectedProject && (
        <ProjectUpdate
          project={selectedProject}
          onClose={closeDialog}
          setProjects={setProjects}
        />
      )}
    </div>
  );
};

export default ProjectPage;