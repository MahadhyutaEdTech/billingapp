import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEmployeeById, updateEmployee } from '../../controllers/employeeController';
import { FaArrowLeft, FaSave, FaUser, FaCalendarAlt } from 'react-icons/fa';
import "../../css/modules/employee/EmployeeUpdate.css";

const EmployeeUpdate = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    joinDate: '',
    salary: '',
    address: '',
    emergencyContact: ''
  });

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

    setIsDarkMode(document.documentElement.classList.contains('dark-mode'));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const parsedId = parseInt(employeeId);
    if (!parsedId || isNaN(parsedId)) {
      setError('Invalid employee ID');
      setTimeout(() => navigate('/dashboard/employee-page'), 2000);
      return;
    }
    fetchEmployee(parsedId);
  }, [employeeId, navigate]);

  const fetchEmployee = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeeById(id);
      
      if (!data) {
        throw new Error('Employee not found');
      }

      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        position: data.position || '',
        department: data.department || '',
        joinDate: data.joinDate?.split('T')[0] || '',
        salary: data.salary || '',
        address: data.address || '',
        emergencyContact: data.emergencyContact || ''
      });
    } catch (err) {
      setError(err.message);
      setTimeout(() => navigate('/dashboard/employee-page'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      const formattedData = {
        id: parseInt(employeeId),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        position: formData.position.trim(),
        department: formData.department.trim(),
        joinDate: formatDate(formData.joinDate),
        salary: formData.salary ? parseFloat(formData.salary).toFixed(2) : '0.00',
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim()
      };

      const requiredFields = ['firstName', 'lastName', 'email', 'position'];
      const missingFields = requiredFields.filter(field => !formattedData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Please fill in required fields: ${missingFields.join(', ')}`);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formattedData.email)) {
        throw new Error('Please enter a valid email address');
      }

      await updateEmployee(employeeId, formattedData);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard/employee-page'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to update employee');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && !formData.firstName) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading employee data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <p>Redirecting to employee list...</p>
          <button 
            onClick={() => navigate('/dashboard/employee-page')}
            className="cancel-btn"
          >
            <FaArrowLeft style={{ marginRight: '5px' }} /> Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`employee-update-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="employee-update-header">
        <h2>
          <FaUser style={{ marginRight: '10px', verticalAlign: 'middle' }} /> 
          Update Employee
        </h2>
        <p className="subtitle">Review and modify employee details below</p>
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        <div className="form-sections">
          <div className="form-section main-info">
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter first name"
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <div className="form-section employment-info">
            <div className="form-grid">
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  placeholder="Enter position"
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
              </div>

              <div className="form-group">
                <label>Join Date</label>
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <FaCalendarAlt className="date-icon" />
                </div>
              </div>

              <div className="form-group">
                <label>Salary</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter salary"
                />
                <small className="field-note">Annual salary in currency</small>
              </div>
            </div>
          </div>

          <div className="form-section contact-info">
            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                placeholder="Enter full address"
              />
            </div>

            <div className="form-group full-width">
              <label>Emergency Contact</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Name: John Doe, Relation: Spouse, Phone: 123-456-7890"
              />
              <small className="field-note">Include name, relation, and contact number</small>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/dashboard/employee-page')}
            disabled={loading}
          >
            <FaArrowLeft style={{ marginRight: '5px' }} /> Back
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div> Updating...
              </>
            ) : (
              <>
                <FaSave style={{ marginRight: '5px' }} /> Update Employee
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeUpdate;
