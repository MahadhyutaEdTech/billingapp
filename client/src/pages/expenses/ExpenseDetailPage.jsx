import React from "react";
import { useState, useEffect } from "react";
import "../../css/modules/expense/ExpenseDetailPage.css";

const ExpenseDetailsPage = ({ open, onClose, expense }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  if (!open || !expense) return null;

  const balance = Number(expense.credit || 0) - Number(expense.debit || 0);

  return (
    <div className={`dialog-overlay ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="dialog-container compact">
        <div className="dialog-header">
          <h3>Expense Details</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          <div className="grid-container compact">
            <div className="detail-box compact">
              <h4 className="box-title">Financial</h4>
              <hr />
              <p className="label">Debit</p>
              <p className="value debit">₹{Number(expense.debit || 0).toLocaleString()}</p>
              <p className="label">Credit</p>
              <p className="value credit">₹{Number(expense.credit || 0).toLocaleString()}</p>
              <p className="label">Balance</p>
              <p className={`value ${balance >= 0 ? "credit" : "debit"}`}>
                ₹{Math.abs(balance).toLocaleString()} {balance >= 0 ? "▲" : "▼"}
              </p>
            </div>

            <div className="detail-box compact">
              <h4 className="box-title">Employee</h4>
              <hr />
              <p className="label">Project: {expense.project}</p>
              <p className="label">Employee: {expense.employee}</p>
              <p className="label">Date: {new Date(expense.date).toLocaleDateString()}</p>
              <p className="label">Updated: {new Date(expense.updatedDate).toLocaleDateString()}</p>
            </div>

            <div className="detail-box compact">
              <h4 className="box-title">Other Info</h4>
              <hr />
              <p className="label">Fund: {expense.natureOfFund?.type || "N/A"}</p>
              <p className="label">Remarks: {expense.remarks || "N/A"}</p>
              <p className="label">Paid By: {expense.paidby || "N/A"}</p>
              {expense.paidbyDetails && <p className="label">Details: {expense.paidbyDetails}</p>}
              <p className="label">Created: {new Date(expense.createdDate).toLocaleDateString()}</p>
            </div>

            {expense.description && (
              <div className="detail-box compact full-width">
                <h4 className="box-title">Description</h4>
                <hr />
                <p className="label">{expense.description}</p>
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

export default ExpenseDetailsPage;
