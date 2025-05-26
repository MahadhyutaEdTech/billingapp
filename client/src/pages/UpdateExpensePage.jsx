import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'; // You can replace this with your custom Axios instance
import '../css/UpdateExpensePage.css';
import { updateExpense } from '../controllers/expenseController';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';

const UpdateExpensePage = () => {
  const navigate = useNavigate();
  const { expenseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Validate form whenever expense changes
  useEffect(() => {
    const isValid = 
      expense.project?.trim() !== '' && 
      expense.employee?.trim() !== '' && 
      expense.paidby?.trim() !== '' && 
      expense.natureOfFund?.every(fund => fund?.trim() !== '') &&
      expense.debit !== '' &&
      expense.date !== '';
    
    setFormValid(isValid);
  }, [expense]);

  useEffect(() => {
    const fetchExpenseData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/exp/expenses/${expenseId}`);
        const data = response.data;

        // Handle the natureOfFund data which might come in different formats
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

        setExpense({
          ...data,
          date: formatDate(data.date),
          updatedDate: formatDate(data.updatedDate),
          createdDate: formatDate(data.createdDate),
          natureOfFund: natureOfFundArray,
        });
      } catch (error) {
        console.error('Error fetching expense:', error);
        alert('Error loading expense data. Redirecting to expenses list.');
        navigate('/dashboard/expenses-page');
      } finally {
        setLoading(false);
      }
    };

    if (expenseId) {
      fetchExpenseData();
    }
  }, [expenseId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNatureOfFundChange = (index, value) => {
    const newNatureOfFund = [...expense.natureOfFund];
    newNatureOfFund[index] = value;
    setExpense(prev => ({
      ...prev,
      natureOfFund: newNatureOfFund
    }));
  };

  const addNatureOfFund = () => {
    setExpense(prev => ({
      ...prev,
      natureOfFund: [...prev.natureOfFund, '']
    }));
  };

  const removeNatureOfFund = (index) => {
    if (expense.natureOfFund.length > 1) {
      const updatedNatureOfFund = [...expense.natureOfFund];
      updatedNatureOfFund.splice(index, 1);
      setExpense(prev => ({
        ...prev,
        natureOfFund: updatedNatureOfFund
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formValid) return;
    
    setLoading(true);
    
    try {
      // Transform the natureOfFund array into the expected format for the API
      const updatedExpense = {
        ...expense,
        natureOfFund: expense.natureOfFund.map(type => ({ type })),
        date: new Date(expense.date),
        updatedDate: new Date(),
        createdDate: expense.createdDate ? new Date(expense.createdDate) : new Date()
      };

      await updateExpense(expenseId, updatedExpense);
      alert('Expense updated successfully!');
      navigate('/dashboard/expenses-page');
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !expense.project) {
    return (
      <div className="update-expense-container loading-container">
        <div className="loading-spinner"></div>
        <p>Loading expense data...</p>
      </div>
    );
  }

  return (
    <div className="update-expense-container">
      <div className="update-expense-header">
        <h2><FaMoneyBillWave style={{ marginRight: '10px', verticalAlign: 'middle' }} /> Update Expense</h2>
        <p>Review and modify expense details below</p>
      </div>
      
      <form onSubmit={handleSubmit} className="update-expense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Project <span className="required"></span></label>
            <input
              type="text"
              name="project"
              value={expense.project || ''}
              onChange={handleChange}
              placeholder="Enter project name"
              required
              className={expense.project ? 'valid-input' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Employee <span className="required"></span></label>
            <input
              type="text"
              name="employee"
              value={expense.employee || ''}
              onChange={handleChange}
              placeholder="Enter employee name"
              required
              className={expense.employee ? 'valid-input' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Paid By <span className="required"></span></label>
            <input
              type="text"
              name="paidby"
              value={expense.paidby || ''}
              onChange={handleChange}
              placeholder="Enter payer name"
              required
              className={expense.paidby ? 'valid-input' : ''}
            />
          </div>
          
          <div className="form-group full-width">
            <label>Nature of Fund <span className="required"></span></label>
            <div className="nature-fund-container">
              {expense.natureOfFund.map((type, index) => (
                <div key={index} className="nature-fund-row">
                  <input
                    type="text"
                    value={type || ''}
                    onChange={(e) => handleNatureOfFundChange(index, e.target.value)}
                    className={`nature-input ${type ? 'valid-input' : ''}`}
                    placeholder="Specify fund nature"
                    required
                  />
                  {expense.natureOfFund.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeNatureOfFund(index)} 
                      className="remove-btn"
                      title="Remove this item"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addNatureOfFund} className="add-btn">
              <FaPlus style={{ marginRight: '5px' }} /> Add Another Fund Type
            </button>
          </div>
          
          <div className="form-group">
            <label>Debit (₹) <span className="required"></span></label>
            <input
              type="number"
              name="debit"
              value={expense.debit || ''}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              className={expense.debit ? 'valid-input' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Credit (₹)</label>
            <input
              type="number"
              name="credit"
              value={expense.credit || ''}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={expense.credit ? 'valid-input' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Date <span className="required"></span></label>
            <div className="date-input-wrapper">
              <input
                type="date"
                name="date"
                value={expense.date || ''}
                onChange={handleChange}
                required
                className={expense.date ? 'valid-input' : ''}
              />
              <FaCalendarAlt className="date-icon" />
            </div>
          </div>
          
          <div className="form-group full-width">
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={expense.remarks || ''}
              onChange={handleChange}
              placeholder="Add any additional information about this expense"
              rows="3"
              className={expense.remarks ? 'valid-input' : ''}
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="update-exp-cancel-btn"
            onClick={() => navigate('/dashboard/expenses-page')}
            disabled={loading}
          >
            <FaArrowLeft style={{ marginRight: '5px' }} /> Back
          </button>
          <button 
            type="submit" 
            className={`update-exp-submit-btn ${formValid ? 'btn-enabled' : 'btn-disabled'}`}
            disabled={loading || !formValid}
          >
            {loading ? 'Updating...' : (
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