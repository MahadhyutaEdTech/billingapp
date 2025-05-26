import React, { useState, useEffect } from "react";
import { FaSearch, FaTrash, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../css/OrganizationTable.css"; // Update import path
import organizationModel from "../models/organizationModel";
import OrganizationController from "../controllers/OrganizationController";
import UpdateOrganizationPage from "../pages/UpdateOrganizationPage"; // Ensure correct import

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
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("📤 Fetching data for page:", page);
      const itemsPerPage = 10;
      const data = await OrganizationController.fetchOrganizations(navigate);
      
      if (!data || data.length === 0) {
        setError("No organizations found");
      } else {
        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        setTotalPages(totalPages);
        
        // Calculate start and end index for current page
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // Set organizations for current page
        setOrganizations(data.slice(startIndex, endIndex));
        // Keep all data for filtering
        setFilteredOrganizations(data.slice(startIndex, endIndex));
      }
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError("Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    setFilteredOrganizations(
      organizations.filter((org) =>
        org.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, organizations]);

  // Function to handle opening the update dialog
  const handleUpdate = (orgId) => {
    setSelectedorgId(orgId);
    setIsDialogOpen(true);
  };

  // Function to close the update dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const toggleRowExpansion = (orgId) => {
    setExpandedRow(expandedRow === orgId ? null : orgId);
  };

  // Reset to first page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="org-container">
      <section className="org-section">
        <div className="org-fix-header">
          <div className="org-title">
            <h2>Organizations</h2>
          </div>
          
          <div className="org-controls">
            <div className="org-search-bar">
              <input
                type="text"
                placeholder="Search Organization"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="org-search-icon">
                <FaSearch className="search-icon" />
              </span>
            </div>
            <button className="create-btn" onClick={() => navigate("/dashboard/add-organization")}>
              Create New
            </button>
          </div>
        </div>

        <div className="org-table-container">
          <div className="table-scroll-wrapper">
            {loading ? (
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
              </div>
            ) : error ? (
              <p className="error-message">❌ {error}</p>
            ) : (
              <table className="org-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && !error && filteredOrganizations.length > 0 ? (
                    filteredOrganizations.map((org) => (
                      <React.Fragment key={org.org_id}>
                        <tr 
                          onClick={() => toggleRowExpansion(org.org_id)}
                          className={`org-row ${expandedRow === org.org_id ? 'expanded' : ''}`}
                        >
                          <td>{org.org_id || "N/A"}</td>
                          <td className="org-name">{org.name || "N/A"}</td>
                          <td>{org.type || "N/A"}</td>
                          <td>{org.email || "N/A"}</td>
                          <td className="actions-cell">
                            <div className=".org-action-buttons">
                              <button 
                                className="action-btn edit-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdate(org.org_id);
                                }}
                                title="Edit Organization"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="action-btn delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  organizationModel.deleteOrganization(org.org_id, setOrganizations);
                                }}
                                title="Delete Organization"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRow === org.org_id && (
                          <tr className="expanded-details">
                            <td colSpan="5">
                              <div className="details-grid">
                                <div className="detail-section">
                                  <h4>Contact Details</h4>
                                  <p><strong>Phone:</strong> {org.phone || "N/A"}</p>
                                  <p><strong>Website:</strong> {org.website || "N/A"}</p>
                                  <p><strong>Registration:</strong> {org.reg_number || "N/A"}</p>
                                </div>
                                
                                <div className="detail-section">
                                  <h4>GST Information</h4>
                                  {org.gst_details && Object.entries(org.gst_details).map(([state, details]) => (
                                    <div key={state} className="gst-detail">
                                      <p><strong>{state}:</strong> {details.gst_number}</p>
                                      <p className="gst-address">{details.address}</p>
                                    </div>
                                  ))}
                                </div>

                                {org.logo_image && (
                                  <div className="detail-section">
                                    <h4>Organization Logo</h4>
                                    <img src={org.logo_image} alt={`${org.name} logo`} className="org-logo-large" />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No organizations found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Update Organization Dialog */}
        {isDialogOpen && selectedorgId && (
          <UpdateOrganizationPage
            organization={filteredOrganizations.find((org) => org.org_id === selectedorgId)}
            onClose={closeDialog}
            setOrganizations={setOrganizations}
          />
        )}

        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span> Page {page} of {totalPages} </span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </section>
    </div>
  );
};

export default OrganizationPage;
