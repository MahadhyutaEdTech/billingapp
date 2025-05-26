import React, { useState } from 'react';
import '../css/AddEmployee.css';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { API_BASE } from '../config/config';

const AddEmployee = () => {
  const [employee, setEmployee] = useState({
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

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitted(false);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication token not found');

      const response = await axiosInstance.post(
        `${API_BASE}/emp/employees`,
        employee,
        {
          headers: {
            Authorization: `Bearer ${token}`,
             
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        console.log('✅ Employee added:', response.data);
        setSubmitted(true);
        setEmployee({
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

        setTimeout(() => {
          setSubmitted(false);
          navigate('/dashboard/expenses-page'); // Change path if needed
        }, 2000);
      } else {
        throw new Error('Unexpected response from server');
      }

    } catch (err) {
      console.error('🚫 Failed to add employee:', err);
      setError(err.response?.data?.message || err.message);
    }
  };


  return (
    <div className="add-employee-container">
      <h2>Add Employee Details</h2>
      
      {submitted && (
        <div className="success-message">
          Employee details successfully added!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="employee-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={employee.firstName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={employee.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={employee.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={employee.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="position">Position</label>
            <input
              type="text"
              id="position"
              name="position"
              value={employee.position}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={employee.department}
              onChange={handleChange}
              required
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
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="joinDate">Join Date</label>
            <input
              type="date"
              id="joinDate"
              name="joinDate"
              value={employee.joinDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="salary">Salary</label>
            <input
              type="number"
              id="salary"
              name="salary"
              value={employee.salary}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group full-width">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={employee.address}
            onChange={handleChange}
            rows="2"
          ></textarea>
        </div>
        
        <div className="form-group full-width">
          <label htmlFor="emergencyContact">Emergency Contact</label>
          <input
            type="text"
            id="emergencyContact"
            name="emergencyContact"
            value={employee.emergencyContact}
            onChange={handleChange}
            placeholder="Name: John Doe, Relation: Spouse, Phone: 123-456-7890"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-btn">Add Employee</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/dashboard/expenses-page')}>
               Back
                </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;