import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../css/modules/expense/UpdateExpensePage.css';
import { updateExpense, getExpenseById } from '../../controllers/expenseController';
import { FaArrowLeft, FaSave, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import Spinner from '../../components/Spinner';

const UpdateExpensePage = () => {
  const navigate = useNavigate();
  const { expenseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formValid, setFormValid] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [expense, setExpense] = useState({
    expenseId: '',
    project: '',
    employee: '',
    paidby: '',
    natureOfFund: [''],
    debit: '',
    credit: '',
    date: '',
    updatedDate: '',
    createdDate: '',
    remarks: ''
  });

  const fundTypes = [
    "Salary",
    "Travel",
    "Equipment",
    "Office Supplies",
    "Misc",
    "Local Travel & Accommodation",
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const isValid = 
      expense.project?.trim() !== '' && 
      expense.employee?.trim() !== '' && 
      expense.paidby?.trim() !== '' && 
      expense.natureOfFund?.every(fund => fund?.trim() !== '') &&
      (expense.debit !== '' || expense.credit !== '') && 
      expense.date !== '';
    
    setFormValid(isValid);
  }, [expense]);

  useEffect(() => {
    const fetchExpenseData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getExpenseById(expenseId);
        
        let natureOfFundArray = [''];
        
        if (Array.isArray(data.natureOfFund)) {
          natureOfFundArray = data.natureOfFund.map(nf => 
            typeof nf === 'object' && nf !== null ? nf.type : nf
          );
        } else if (typeof data.natureOfFund === 'object' && data.natureOfFund !== null) {
          natureOfFundArray = [data.natureOfFund.type];
        } else if (data.natureOfFund) {
          natureOfFundArray = [data.natureOfFund];
        }

        if (natureOfFundArray.length === 0 || natureOfFundArray.every(fund => !fund)) {
          natureOfFundArray = [''];
        }

        const formattedExpense = {
          expenseId: data.expenseId || data._id || '',
          project: data.project || '',
          employee: data.employee || '',
          paidby: data.paidby || data.paidBy || '',
          natureOfFund: natureOfFundArray,
          debit: data.debit || '',
          credit: data.credit || '',
          date: formatDate(data.date),
          updatedDate: formatDate(data.updatedDate),
          createdDate: formatDate(data.createdDate),
          remarks: data.remarks || ''
        };

        setExpense(formattedExpense);
        
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load expense data';
        setError(errorMessage);
        
        setTimeout(() => {
          navigate('/dashboard/expenses-page');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    if (expenseId) {
      fetchExpenseData();
    } else {
      setError('No expense ID provided');
      navigate('/dashboard/expenses-page');
    }
  }, [expenseId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNatureOfFundChange = (type) => {
    setExpense(prev => ({
      ...prev,
      natureOfFund: [type]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formValid) return;
    
    setLoading(true);
    
    try {
      const formatSQLDate = (date) => {
        if (!date) return null;
        return new Date(date).toISOString().split('T')[0];
      };
      
      const updatedExpense = {
        ...expense,
        natureOfFund: expense.natureOfFund
          .filter(type => type.trim() !== '')
          .map(type => ({ type: type.trim() })),
        date: formatSQLDate(expense.date),
        updatedDate: formatSQLDate(new Date()),
        createdDate: formatSQLDate(expense.createdDate || new Date()),
        debit: expense.debit ? Number(expense.debit) : 0,
        credit: expense.credit ? Number(expense.credit) : 0
      };

      await updateExpense(expenseId, updatedExpense);
      alert('Expense updated successfully!');
      navigate('/dashboard/expenses-page');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update expense. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

  if (error) {
    return (
      <div className="update-expense-container error-container">
        <div className="error-message">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <p>Redirecting to expenses list...</p>
          <button 
            onClick={() => navigate('/dashboard/expenses-page')}
            className="update-exp-cancel-btn"
          >
            <FaArrowLeft style={{ marginRight: '5px' }} /> Back to Expenses
          </button>
        </div>
      </div>
    );
  }

  if (loading && !expense.project) {
    return (
      <div className="update-expense-container loading-container">
        <Spinner />
        <p>Loading expense data...</p>
      </div>
    );
  }

  return (
    <div className={`update-expense-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="update-expense-header">
        <h2>
          <FaMoneyBillWave style={{ marginRight: '10px', verticalAlign: 'middle' }} /> 
          Update Expense
        </h2>
        <p className="subtitle">Review and modify expense details below</p>
      </div>
      
      <form onSubmit={handleSubmit} className="update-expense-form">
        <div className="form-sections">
          <div className="form-section main-info">
            <div className="form-grid">
              <div className="form-group">
                <label>Expense ID</label>
                <input
                  type="text"
                  name="expenseId"
                  value={expense.expenseId}
                  readOnly
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    name="date"
                    value={expense.date}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                 
                </div>
              </div>

              <div className="form-group">
                <label>Project</label>
                <input
                  type="text"
                  name="project"
                  value={expense.project}
                  onChange={handleChange}
                  required
                  placeholder="Enter project name"
                />
              </div>

              <div className="form-group">
                <label>Employee</label>
                <input
                  type="text"
                  name="employee"
                  value={expense.employee}
                  onChange={handleChange}
                  required
                  placeholder="Enter employee name"
                />
              </div>
            </div>
          </div>

          <div className="form-section financial-info">
            <div className="form-grid">
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  name="paidby"
                  value={expense.paidby}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Check">Check</option>
                  <option value="Bill/Voucher">Bill/Voucher</option>
                </select>
              </div>

              <div className="form-group">
                <label>Debit Amount (₹)</label>
                <input
                  type="number"
                  name="debit"
                  value={expense.debit}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                <small className="field-note">Amount to be paid/spent</small>
              </div>

              <div className="form-group">
                <label>Credit Amount (₹)</label>
                <input
                  type="number"
                  name="credit"
                  value={expense.credit}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                <small className="field-note">Amount received/advance</small>
              </div>
            </div>
          </div>

          <div className="form-section fund-info">
            <div className="fund-section-header">
              <label className="section-label">Nature of Fund</label>
              <p className="section-description">Select the type of expense</p>
            </div>
            <div className="fund-types-grid">
              {fundTypes.map((type) => (
                <label key={type} className="fund-type-option">
                  <input
                    type="radio"
                    name="natureOfFund"
                    value={type}
                    checked={expense.natureOfFund[0] === type}
                    onChange={() => handleNatureOfFundChange(type)}
                  />
                  <span className="fund-type-label">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section remarks-info">
            <div className="form-group">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={expense.remarks}
                onChange={handleChange}
                rows="2"
                placeholder="Enter any additional notes..."
                maxLength={500}
              />
              <small className="field-note">
                {expense.remarks ? expense.remarks.length : 0}/500 characters
              </small>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/dashboard/expenses-page')}
            disabled={loading}
          >
            <FaArrowLeft style={{ marginRight: '5px' }} /> Back
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || !formValid}
          >
            {loading ? (
              <>
                <Spinner /> Updating...
              </>
            ) : (
              <>
                <FaSave style={{ marginRight: '5px' }} /> Update Expense
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateExpensePage;