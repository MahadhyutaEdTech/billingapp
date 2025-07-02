import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import "../../css/modules/expense/ExpensesGraphPage.css";

const ExpensesGraphPage = ({ onClose, expenses }) => {
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
    let natureOfFund = '';
    
    if (Array.isArray(expense.natureOfFund)) {
      natureOfFund = expense.natureOfFund[0]?.type || expense.natureOfFund[0] || 'Other';
    } else if (typeof expense.natureOfFund === 'object' && expense.natureOfFund !== null) {
      natureOfFund = expense.natureOfFund.type || 'Other';
    } else {
      natureOfFund = expense.natureOfFund || 'Other';
    }
    
    // Ensure we're not using [object Object] as a category
    natureOfFund = typeof natureOfFund === 'object' ? 'Other' : natureOfFund;
    
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
    <div className={`expenses-graph-overlay ${isDarkMode ? 'dark-mode' : ''}`} onClick={(e) => e.target.className === 'expenses-graph-overlay' && onClose()}>
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
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                  dataKey="amount"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    name,
                    value
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 25;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize="11px"
                      >
                        {`${name}: ₹${value.toLocaleString()}`}
                      </text>
                    );
                  }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ fontSize: '11px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px' }}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
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