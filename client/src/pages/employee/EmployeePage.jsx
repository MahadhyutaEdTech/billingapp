import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getEmployees, deleteEmployee } from '../../controllers/employeeController';
import Spinner from '../../components/Spinner';
import "../../css/modules/employee/EmployeePage.css";
import EmployeeDetailsPage from './EmployeeDetailsPage';

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Filter employees based on search term
    const filtered = employees.filter((employee) => {
      if (!employee) {
        return false;
      }
      const employeeFirstName = employee.firstName || '';
      const employeeLastName = employee.lastName || '';
      const employeeEmail = employee.email || '';
      const employeePhone = employee.phone || '';
      const employeePosition = employee.position || '';

      const fullName = `${employeeFirstName} ${employeeLastName}`.trim();

      return (
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        employeeEmail.toLowerCase().includes(search.toLowerCase()) ||
        employeePhone.toLowerCase().includes(search.toLowerCase()) ||
        employeePosition.toLowerCase().includes(search.toLowerCase())
      );
    });
    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page on search/filter change
  }, [search, employees]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployees();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (err) {
      setError("Failed to load employees");
      console.error("Error loading employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId) => {
    const confirmed = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteEmployee(employeeId);
      fetchEmployees();
    } catch (err) {
      setError("Failed to delete employee");
      console.error("Error deleting employee:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleUpdate = (employeeId) => {
    navigate(`/dashboard/update-employee/${employeeId}`);
  };

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="employee-container">
      <section className="employee-section">
        <div className="employee-header">
          <div className="employee-header-content">
            <div className="employee-header-left">
              <h2 className="employee-title">
                <FaUser /> Employees
              </h2>
              <div className="employee-search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <button className="employee-create-btn" onClick={() => navigate("/dashboard/add-employee")}>
              <FaPlus />
              Create New
            </button>
          </div>
        </div>

        <div className="employee-table-container">
          {(loading) ? (
            <div className="spinner-overlay">
              <Spinner />
            </div>
          ) : error ? (
            <div className="error-message">Error: {error}</div>
          ) : (
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.length > 0 ? (
                  currentEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      onClick={() => handleRowClick(employee)}
                      className="employee-row hover-row"
                      style={{ cursor: "pointer" }}
                    >
                      <td>{`${employee.firstName || ''} ${employee.lastName || ''}`}</td>
                      <td>{employee.email || 'N/A'}</td>
                      <td>{employee.phone || 'N/A'}</td>
                      <td>{employee.position || 'N/A'}</td>
                      <td>
                        <span className="action-buttons">
                          <span className="employee-update-btn" onClick={() => handleUpdate(employee.id)}>
                            <FaEdit />
                          </span>
                          <span className="employee-delete-btn" onClick={() => handleDelete(employee.id)}>
                            <FaTrash />
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No employees available</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="simple-pagination">
              <div className="page-info">
                Showing {filteredEmployees.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} entries
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
          )}
        </div>
      </section>
      <EmployeeDetailsPage 
        open={isDialogOpen} 
        onClose={handleCloseDialog} 
        employee={selectedEmployee} 
      />
    </div>
  );
};

export default EmployeePage;
