"use client"

import  React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import ExcelJS from "exceljs"
import { FaSearch, FaTrash, FaEdit, FaFilter, FaFileExcel, FaMoneyBillWave, FaPlus, FaChartBar, FaChevronDown, FaChevronUp, FaRedo } from "react-icons/fa"
import Spinner from "../../components/Spinner"
import ExpensesGraphPage from "./ExpensesGraphPage"
import ExpenseDetailPage from "./ExpenseDetailPage"
import { ExpenseModel } from "../../models/expenseModel"
import "../../css/modules/expense/ExpensesPage.css"
import { getExpenses, deleteExpense } from "../../controllers/expenseController"

const ExpensesPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [projectFilter, setProjectFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [itemsPerPage] = useState(10);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  const categories = ["All", "Salary", "Advance", "Personal Expense", "Project Expense", "Misc"];
  const navigate = useNavigate();

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

  const getLastTwelveMonths = () => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthYear = date.toLocaleString("default", { month: "long", year: "numeric" });
      const value = date.toISOString().slice(0, 7); // YYYY-MM format
      months.push({ label: monthYear, value });
    }

    return months;
  };

  const months = getLastTwelveMonths();

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line
  }, []); // Only on mount

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpenses();
      const mappedExpenses = data.map((exp) => new ExpenseModel(exp));
      setExpenses(mappedExpenses);
      setFilteredExpenses(mappedExpenses);
      setTotalPages(10); // Adjust if paginated data
    } catch (err) {
      setError("Failed to load expenses");
      console.error("Error loading expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Helper to get a lowercased and trimmed string value
    const getNormalizedString = (value) => {
      return String(value || "").toLowerCase().trim();
    };

    // Helper to get normalized, lowercased, and trimmed natureOfFund values as an array
    const getNormalizedNatureOfFunds = (fund) => {
      if (!fund) return [];
      if (Array.isArray(fund)) {
        return fund.map(item => (typeof item === "object" && item.type) ? item.type.toLowerCase().trim() : String(item).toLowerCase().trim());
      }
      if (typeof fund === "object" && fund.type) {
        return [fund.type.toLowerCase().trim()];
      }
      return [String(fund).toLowerCase().trim()];
    };

    const filtered = expenses.filter((expense) => {
      const searchLower = search.toLowerCase().trim();

      // Normalize expense properties for comparison
      const projectLower = getNormalizedString(expense.project);
      const employeeLower = getNormalizedString(expense.employee);
      const expenseNatureOfFundsNormalized = getNormalizedNatureOfFunds(expense.natureOfFund);

      // Search match: Check if search term exists in project, employee, or any nature of fund
      const searchMatch =
        projectLower.includes(searchLower) ||
        employeeLower.includes(searchLower) ||
        expenseNatureOfFundsNormalized.some(fund => fund.includes(searchLower));

      // Category filter match: Check if selected category is 'All' or if any normalized fund matches
      const selectedCategoryLower = selectedCategory.toLowerCase().trim();
      const categoryMatch =
        selectedCategoryLower === "all" ||
        expenseNatureOfFundsNormalized.includes(selectedCategoryLower);

      // Project filter match: Check if project filter is empty or if normalized project matches
      const projectFilterLower = projectFilter.toLowerCase().trim();
      const projectMatch = !projectFilterLower || projectLower === projectFilterLower;

      // Employee filter match: Check if employee filter is empty or if normalized employee matches
      const employeeFilterLower = employeeFilter.toLowerCase().trim();
      const employeeMatch = !employeeFilterLower || employeeLower === employeeFilterLower;

      // Month filter match: Check if selected month is empty or if expense date starts with selected month
      const monthMatch = !selectedMonth || expense.date.startsWith(selectedMonth);

      // All conditions must be met for an expense to be included
      return searchMatch && categoryMatch && projectMatch && employeeMatch && monthMatch;
    });

    setFilteredExpenses(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1);
  }, [search, expenses, selectedCategory, projectFilter, employeeFilter, selectedMonth, itemsPerPage]);

  const handleRowClick = (expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedExpense(null);
  };

  const handleDelete = async (expenseId) => {
    const confirmed = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteExpense(expenseId);
      await fetchExpenses();
    } catch (err) {
      setError("Failed to delete expense");
      console.error("Error deleting expense:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalDebit = filteredExpenses.reduce((sum, exp) => sum + (Number(exp.debit) || 0), 0);
  const totalCredit = filteredExpenses.reduce((sum, exp) => sum + (Number(exp.credit) || 0), 0);

  const displayNatureOfFund = (natureOfFund) => {
    if (!natureOfFund) return "";
    try {
      return Array.isArray(natureOfFund)
        ? natureOfFund.map((item) => (typeof item === "object" ? item.type : String(item))).join(", ")
        : typeof natureOfFund === "object"
        ? natureOfFund.type || JSON.stringify(natureOfFund)
        : String(natureOfFund);
    } catch (e) {
      console.warn("Error displaying natureOfFund:", e);
      return String(natureOfFund);
    }
  };

  const resetFilters = () => {
    setProjectFilter("")
    setEmployeeFilter("")
    setSelectedMonth("")
    setSelectedCategory("All")
    setSearch("")
  }

  const handleExportToExcel = async () => {
    try {
      // Create a new workbook
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Expenses")

      // Set worksheet properties
      worksheet.properties.defaultRowHeight = 20

      // Define columns with headers and formatting
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Project", key: "project", width: 25 }, // Increased width
        { header: "Employee", key: "employee", width: 25 }, // Increased width
        { header: "Nature of Fund", key: "natureOfFund", width: 30 }, // Increased width
        { header: "Description", key: "description", width: 40 }, // Increased width
        { header: "Debit", key: "debit", width: 15 },
        { header: "Credit", key: "credit", width: 15 },
        { header: "Balance", key: "balance", width: 15 },
      ]

      // Style the header row
      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } }
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "366092" },
      }
      headerRow.alignment = { horizontal: "center", vertical: "middle" }
      headerRow.height = 25

      // Add data rows
      filteredExpenses.forEach((expense, index) => {
        const balance = Number(expense.credit || 0) - Number(expense.debit || 0)

        const row = worksheet.addRow({
          date: new Date(expense.date).toLocaleDateString(),
          project: expense.project,
          employee: expense.employee,
          natureOfFund: displayNatureOfFund(expense.natureOfFund),
          description: expense.description,
          debit: Number(expense.debit || 0),
          credit: Number(expense.credit || 0),
          balance: balance,
        })

        // Format currency columns
        row.getCell("debit").numFmt = "₹#,##0.00"
        row.getCell("credit").numFmt = "₹#,##0.00"
        row.getCell("balance").numFmt = "₹#,##0.00"
        row.getCell("description").alignment = { wrapText: true }

        // Color code the balance
        if (balance < 0) {
          row.getCell("balance").font = { color: { argb: "DC2626" } }
        } else if (balance > 0) {
          row.getCell("balance").font = { color: { argb: "059669" } }
        }

        // Alternate row colors
        if (index % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F9FAFB" },
          }
        }
      })

      // Add totals row
      const totalRow = worksheet.addRow({
        date: "",
        project: "",
        employee: "TOTAL",
        natureOfFund: "",
        description: "",
        debit: totalDebit,
        credit: totalCredit,
        balance: totalCredit - totalDebit,
      })

      // Style totals row
      totalRow.font = { bold: true }
      totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "E5E7EB" },
      }

      // Format currency in totals
      totalRow.getCell("debit").numFmt = "₹#,##0.00"
      totalRow.getCell("credit").numFmt = "₹#,##0.00"
      totalRow.getCell("balance").numFmt = "₹#,##0.00"

      // Color code total balance
      const totalBalance = totalCredit - totalDebit
      if (totalBalance < 0) {
        totalRow.getCell("balance").font = { color: { argb: "DC2626" }, bold: true }
      } else if (totalBalance > 0) {
        totalRow.getCell("balance").font = { color: { argb: "059669" }, bold: true }
      }

      // Add borders to all cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          }
        })
      })

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        if (column.values) {
          const lengths = column.values.map((v) => (v ? v.toString().length : 0))
          const maxLength = Math.max(...lengths.filter((v) => typeof v === "number"))
          column.width = Math.min(Math.max(maxLength + 2, 10), 50)
        }
      })

      // Generate filename with current date
      const filename = `expenses_${new Date().toISOString().split("T")[0]}.xlsx`

      // Write to buffer and download
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log("Excel file exported successfully")
    } catch (error) {
      console.error("Error exporting Excel file:", error)
      setError("Failed to export Excel file")
    }
  }

  const getPaginatedData = () => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredExpenses.slice(startIndex, endIndex)
  }

  return (
    <div className={`expense-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="expense-header">
        <div className="expense-header-content">
          <div className="expense-header-left">
            <h2>
              <FaMoneyBillWave />
              Expenses
            </h2>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => {
                  console.debug("[ExpensesPage] Search changed to:", e.target.value)
                  setSearch(e.target.value)
                }}
              />
              <span className="search-icon">
                <FaSearch className="search-icon" />
              </span>
            </div>
          </div>

          <div className="expense-header-right">
            <select
              value={selectedCategory}
              onChange={(e) => {
                console.debug("[ExpensesPage] Category changed to:", e.target.value)
                setSelectedCategory(e.target.value)
              }}
              className="filter-dropdown"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              className="create-btn"
              onClick={() => {
                console.debug("[ExpensesPage] Navigate to Create Expense page")
                navigate("/dashboard/create-expense")
              }}
            >
              <FaPlus />
              Create New
            </button>
            <button 
              className="collapse-btn"
              onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
              title={isHeaderCollapsed ? "Expand" : "Collapse"}
            >
              {isHeaderCollapsed ? <FaChevronDown /> : <FaChevronUp />}
            </button>
            {isHeaderCollapsed && (
              <>
                <button className="icon-btn" onClick={handleExportToExcel}>
                  <FaFilter />
                </button>
                <button className="icon-btn" onClick={handleExportToExcel}>
                  <FaFileExcel />
                </button>
                <button className="icon-btn" onClick={() => setIsGraphOpen(true)}>
                  <FaChartBar />
                </button>
              </>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-group">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Projects</option>
                {[...new Set(expenses.map((exp) => exp.project))].map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>

              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Employees</option>
                {[...new Set(expenses.map((exp) => exp.employee))].map((employee) => (
                  <option key={employee} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="filter-select"
              >
                <option value="">All Months</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>

              <button className="reset-btn" onClick={resetFilters}>
                <FaRedo />
                <span style={{ display: 'none', '@media (min-width: 769px)': { display: 'inline' } }}>Reset Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content wrapper for proper flex layout */}
      <div className="expense-content-wrapper">
        <div className="table-container">
          {loading ? (
            <div className="spinner-overlay">
              <Spinner />
            </div>
          ) : error ? (
            <p className="error-message">❌ Error: {error}</p>
          ) : (
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Employee Name</th>
                  <th>Funds</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && !error && filteredExpenses.length > 0 ? (
                  getPaginatedData().map((expense) => (
                    <tr
                      key={expense.expenseId}
                      onClick={() => handleRowClick(expense)}
                      className="expense-row hover-row"
                      style={{ cursor: "pointer" }}
                    >
                      <td>{expense.project}</td>
                      <td>{expense.employee}</td>
                      <td>{displayNatureOfFund(expense.natureOfFund)}</td>
                      <td>₹{expense.debit}</td>
                      <td>₹{expense.credit}</td>
                      <td className="expense-action">
                        <span className="action-buttons">
                          <button
                            className="expense-update-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              console.debug(`[ExpensesPage] Edit clicked for expenseId: ${expense.expenseId}`)
                              navigate(`/dashboard/update-expense/${expense.expenseId}`)
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="expense-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(expense.expenseId)
                            }}
                          >
                            <FaTrash />
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">
                      No expenses found.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="summary-row">
                  <td colSpan={2} style={{ textAlign: "right", fontWeight: "bold" }}>
                    Total:
                  </td>
                  <td style={{ fontWeight: "bold", textAlign: "right" }}>
                    Balance:
                    <span
                      style={{
                        color: totalCredit - totalDebit >= 0 ? "#059669" : "#dc2626",
                        marginLeft: "8px",
                      }}
                    >
                      ₹{Math.abs(totalCredit - totalDebit).toLocaleString()}
                      <span className="balance-indicator" aria-hidden="true" style={{ marginLeft: "4px" }}>
                        {totalCredit - totalDebit >= 0 ? "▲" : "▼"}
                      </span>
                    </span>
                  </td>
                  <td style={{ fontWeight: "bold", color: "#dc2626" }}>₹{totalDebit.toLocaleString()}</td>
                  <td style={{ fontWeight: "bold", color: "#059669" }}>₹{totalCredit.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Pagination inside content wrapper */}
        <div className="pagination-container">
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => {
                console.debug(`[ExpensesPage] Previous page clicked. Current page: ${page}`)
                setPage(page - 1)
              }}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => {
                console.debug(`[ExpensesPage] Next page clicked. Current page: ${page}`)
                setPage(page + 1)
              }}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Expense Details Dialog */}
      <ExpenseDetailPage open={isDialogOpen} onClose={handleCloseDialog} expense={selectedExpense} />

      {isGraphOpen && (
        <ExpensesGraphPage
          onClose={() => {
            console.debug("[ExpensesPage] Close graph view")
            setIsGraphOpen(false)
          }}
          expenses={filteredExpenses}
        />
      )}
    </div>
  )
}

export default ExpensesPage


