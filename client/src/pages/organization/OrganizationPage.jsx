import React, { useState, useEffect } from "react";
import { FaSearch, FaTrash, FaEdit, FaBuilding, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import '../../css/modules/organization/OrganizationTable.css';
import organizationModel from "../../models/organizationModel";
import OrganizationController from "../../controllers/organizationController";
import UpdateOrganizationPage from "./UpdateOrganizationPage";
import OrganizationDetailsPage from "./OrganizationDetailsPage";

const OrganizationPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedorgId, setSelectedorgId] = useState(null);
  const [clickedOrg, setClickedOrg] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  
  const itemsPerPage = 10;

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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await OrganizationController.fetchOrganizations(navigate);
      if (!data || data.length === 0) {
        setError("No organizations found");
      } else {
        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        setTotalPages(totalPages);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = data.slice(startIndex, endIndex);
        setOrganizations(pageData);
        setFilteredOrganizations(pageData);
      }
    } catch (err) {
      setError("Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, refreshTrigger]);

  useEffect(() => {
    setFilteredOrganizations(
      organizations.filter((org) =>
        org.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, organizations]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleUpdate = (orgId) => {
    setSelectedorgId(orgId);
    setIsDialogOpen(true);
  };

  const closeClickedOrg = () => {
    setClickedOrg(null);
  };

  const handleRowClick = (org, event) => {
    // Check if click came from action buttons
    if (event.target.closest('.actions-cell')) {
      return; // Don't handle row click if action button was clicked
    }
    
    setClickedOrg(org);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className={`org-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <section className="org-section">
        <div className="org-header">
          <div className="org-header-content">
            <div className="org-header-left">
              <h2 className="org-title">
                <FaBuilding /> Organizations
              </h2>
              <div className="org-search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <button className="org-create-btn" onClick={() => navigate("/dashboard/add-organization")}>
              <FaPlus />
              Create New
            </button>
          </div>
        </div>

        <div className="org-table-container">
          {loading ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
            </div>
          ) : error ? (
            <p className="error-message">❌ {error}</p>
          ) : (
            <>
              <div className="table-scroll-wrapper">
                <table className="org-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Website</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrganizations.length > 0 ? (
                      filteredOrganizations.map((org) => (
                        <tr
                          key={org.org_id}
                          className={`org-row ${clickedOrg && clickedOrg.org_id === org.org_id ? 'selected' : ''}`}
                          onClick={(e) => handleRowClick(org, e)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>{org.org_id || "N/A"}</td>
                          <td>{org.name || "N/A"}</td>
                          <td>{org.type || "N/A"}</td>
                          <td>{org.email || "N/A"}</td>
                          <td>{org.phone || "N/A"}</td>
                          <td>{org.website || "N/A"}</td>
                          <td className="actions-cell">
                            <div className="org-action-buttons">
                              <button 
                                className="action-btn edit-btn" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdate(org.org_id);
                                }}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  organizationModel.deleteOrganization(org.org_id, setOrganizations);
                                }}
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-data">No organizations found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="simple-pagination">
                <div className="page-info">
                  Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, organizations.length)} of {organizations.length} entries
                </div>
                <div className="pagination-controls">
                 
                  <button 
                    className="control-btn" 
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={page}
                    onChange={(e) => {
                      const newPage = parseInt(e.target.value);
                      if (newPage >= 1 && newPage <= totalPages) {
                        setPage(newPage);
                      }
                    }}
                  />
                  <button 
                    className="control-btn" 
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                  </button>
                  
                </div>
              </div>
            </>
          )}
        </div>

        {isDialogOpen && selectedorgId && (
          <UpdateOrganizationPage
            organization={organizations.find((org) => org.org_id === selectedorgId)}
            onClose={closeDialog}
            setOrganizations={setOrganizations}
          />
        )}
      </section>

      {clickedOrg && (
        <OrganizationDetailsPage 
          organization={clickedOrg}
          onClose={closeClickedOrg}
        />
      )}
    </div>
  );
};

export default OrganizationPage;