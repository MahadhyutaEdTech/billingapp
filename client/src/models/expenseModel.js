export class ExpenseModel {
  constructor(data) {
    this.expenseId = data._id || data.expenseId;
    this.project = data.project || "";
    this.employee = data.employee || "";
    this.natureOfFund = this.parseNatureOfFund(data.natureOfFund);
    this.debit = this.parseAmount(data.debit);
    this.credit = this.parseAmount(data.credit);
    this.remarks = data.remarks || "";
    this.date = this.parseDate(data.date);
    this.updatedDate = this.parseDate(data.updatedDate);
    this.createdDate = this.parseDate(data.createdDate);
    this.paidby = data.paidby || "";
    this.paidbyDetails = data.paidbyDetails || "";
  }

  parseAmount(value) {
    if (!value) return 0;
    return parseFloat(value).toFixed(2);
  }

  parseDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  }

  getFormattedDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  parseNatureOfFund(raw) {
    if (!raw) return [];
    
    try {
      if (typeof raw === 'string') {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      return Array.isArray(raw) ? raw : [raw];
    } catch (e) {
      console.warn("Failed to parse natureOfFund:", raw);
      return Array.isArray(raw) ? raw : [raw];
    }
  }

  formatNatureOfFund(data) {
    if (Array.isArray(data)) {
      return data.map(item => {
        if (typeof item === 'object' && item !== null) {
          return item.type || item.name || item.value || JSON.stringify(item);
        }
        return String(item);
      });
    }
    if (typeof data === 'object' && data !== null) {
      return [data.type || data.name || data.value || JSON.stringify(data)];
    }
    return [String(data)];
  }

  // Get formatted nature of fund for display
  getNatureOfFundDisplay() {
    if (!Array.isArray(this.natureOfFund)) return '';
    return this.natureOfFund.map(item => 
      typeof item === 'object' ? item.type || JSON.stringify(item) : String(item)
    ).join(', ');
  }

  // Add validation methods
  isValid() {
    return {
      project: !!this.project,
      employee: !!this.employee,
      natureOfFund: Array.isArray(this.natureOfFund) && this.natureOfFund.length > 0,
      amount: this.debit > 0 || this.credit > 0
    };
  }

  // Add error handling methods
  static handleAPIError(error) {
    if (error.response?.status === 500) {
      return {
        error: true,
        message: "Server error occurred. Please try again later.",
        details: error.response?.data || "Unknown server error"
      };
    }
    return {
      error: true,
      message: error.message || "An error occurred",
      details: error.response?.data
    };
  }

  static ERROR_TYPES = {
    SERVER_ERROR: 'SERVER_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR'
  };

  static PAYMENT_STATUSES = {
    PENDING: "Pending",
    PAID: "Paid",
    REJECTED: "Rejected",
    PROCESSING: "Processing",
  };
}
