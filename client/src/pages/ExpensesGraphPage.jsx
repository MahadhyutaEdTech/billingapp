import React, { useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import "../css/ExpensesGraphPage.css";

const ExpensesGraphPage = ({ onClose, expenses }) => {
  // Add keyboard support for closing
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Calculate totals and balance
  const totals = expenses.reduce((acc, exp) => {
    acc.expenses += Number(exp.debit || 0);
    acc.income += Number(exp.credit || 0);
    return acc;
  }, { expenses: 0, income: 0 });
  
  const balance = totals.income - totals.expenses;

  // Process category-wise expenses
  const categoryExpenses = expenses.reduce((acc, expense) => {
    const natureOfFund = Array.isArray(expense.natureOfFund) 
      ? expense.natureOfFund[0] 
      : (typeof expense.natureOfFund === 'object' ? expense.natureOfFund.type : expense.natureOfFund);
    
    acc[natureOfFund] = (acc[natureOfFund] || 0) + Number(expense.debit || 0);
    return acc;
  }, {});

  const categoryData = Object.entries(categoryExpenses).map(([name, amount]) => ({
    name,
    amount: Number(amount.toFixed(2))
  }));

  // Process monthly expenses
  const monthlyExpenses = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    acc[monthYear] = (acc[monthYear] || 0) + Number(expense.debit || 0);
    return acc;
  }, {});

  const monthlyData = Object.entries(monthlyExpenses).map(([name, amount]) => ({
    name,
    amount: Number(amount.toFixed(2))
  })).sort((a, b) => new Date(a.name) - new Date(b.name));

  const COLORS = ["#3182ce", "#38a169", "#805ad5", "#d69e2e", "#e53e3e", "#319795"];

  return (
    <div className="expenses-graph-overlay" onClick={(e) => e.target.className === 'expenses-graph-overlay' && onClose()}>
      <div className="expenses-graph-content">
        <div className="graph-header">
          <h2>Expenses Analysis</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Close expenses graph"
            title="Close (Esc)"
          >
            <span className="close-icon">×</span>
            <span className="close-text">Close</span>
          </button>
        </div>
        
        <div className="balance-summary">
          <div className="balance-item income">
            <h4>Total Income</h4>
            <p>₹{totals.income.toLocaleString()}</p>
          </div>
          <div className="balance-item expenses">
            <h4>Total Expenses</h4>
            <p>₹{totals.expenses.toLocaleString()}</p>
          </div>
          <div className="balance-item balance">
            <h4>Balance</h4>
            <p className={balance >= 0 ? 'positive' : 'negative'}>
              ₹{Math.abs(balance).toLocaleString()}
              <span className="balance-indicator" aria-hidden="true">
                {balance >= 0 ? '▲' : '▼'}
              </span>
            </p>
          </div>
        </div>

        <div className="charts-wrapper">
          <div className="chart-container">
            <h3>Monthly Expense Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  labelStyle={{ color: '#4a5568', fontSize: '11px' }}
                  contentStyle={{ fontSize: '11px' }}
                />
                <Bar dataKey="amount" fill="#3182ce" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Category-wise Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#82ca9d"
                  dataKey="amount"
                  label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}
                  labelLine={{ strokeWidth: 1 }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="graph-summary">
          <div className="summary-item">
            <h4>Categories</h4>
            <p>{Object.keys(categoryExpenses).length}</p>
          </div>
          <div className="summary-item">
            <h4>Highest Category</h4>
            <p>{categoryData.sort((a, b) => b.amount - a.amount)[0]?.name || 'N/A'}</p>
          </div>
          <div className="summary-item">
            <h4>Last Transaction</h4>
            <p>{new Date(Math.max(...expenses.map(e => new Date(e.date)))).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesGraphPage;