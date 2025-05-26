export class ExpenseModel {
  constructor(data) {
    this.expenseId = data._id || data.expenseId;
    this.project = data.project || "";
    this.employee = data.employee || "";
    this.natureOfFund = this.parseNatureOfFund(data.natureOfFund);
    this.debit = data.debit || 0;
    this.credit = data.credit || 0;
    this.remarks = data.remarks || "";
    this.date = data.date;
    this.updatedDate = data.updatedDate;
    this.createdDate = data.createdDate;
    this.paidby = data.paidby || "";
    this.paidbyDetails = data.paidbyDetails || "";
  }

  parseNatureOfFund(raw) {
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.warn("Failed to parse natureOfFund:", raw);
        return raw;
      }
    }
    return raw;
  }





  static PAYMENT_STATUSES = {
    PENDING: "Pending",
    PAID: "Paid",
    REJECTED: "Rejected",
    PROCESSING: "Processing",
  };
}
