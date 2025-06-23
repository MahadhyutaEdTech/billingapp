import React from "react";
import "../../css/modules/employee/EmployeeDetailsPage.css";

const EmployeeDetailsPage = ({ open, onClose, employee }) => {
  if (!open || !employee) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-container compact">
        <div className="dialog-header">
          <h3>Employee Details</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          <div className="grid-container compact">
            <div className="detail-box compact">
              <h4 className="box-title">Personal Information</h4>
              <hr />
              <p className="label">Name</p>
              <p className="value">{employee.name}</p>
              <p className="label">Employee ID</p>
              <p className="value">{employee.employeeId}</p>
              <p className="label">Email</p>
              <p className="value">{employee.email}</p>
              <p className="label">Phone</p>
              <p className="value">{employee.phone}</p>
            </div>

            <div className="detail-box compact">
              <h4 className="box-title">Work Details</h4>
              <hr />
              <p className="label">Department</p>
              <p className="value">{employee.department}</p>
              <p className="label">Position</p>
              <p className="value">{employee.position}</p>
              <p className="label">Join Date</p>
              <p className="value">{new Date(employee.joinDate).toLocaleDateString()}</p>
              <p className="label">Status</p>
              <p className={`value ${employee.status === 'Active' ? 'active' : 'inactive'}`}>
                {employee.status}
              </p>
            </div>

            <div className="detail-box compact">
              <h4 className="box-title">Financial Information</h4>
              <hr />
              <p className="label">Salary</p>
              <p className="value">₹{Number(employee.salary).toLocaleString()}</p>
              <p className="label">Bank Account</p>
              <p className="value">{employee.bankAccount || 'N/A'}</p>
              <p className="label">PAN Number</p>
              <p className="value">{employee.panNumber || 'N/A'}</p>
            </div>

            {employee.address && (
              <div className="detail-box compact full-width">
                <h4 className="box-title">Address</h4>
                <hr />
                <p className="label">{employee.address}</p>
              </div>
            )}

            {employee.notes && (
              <div className="detail-box compact full-width">
                <h4 className="box-title">Additional Notes</h4>
                <hr />
                <p className="label">{employee.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="dialog-footer">
          <button className="primary-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsPage; 