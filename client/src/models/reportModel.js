export class ReportData {
  constructor(data = {}) {
    // Ensure all fields are captured
    Object.assign(this, {
      year: data.year,
      total_invoices: data.total_invoices || 0,
      total_sales: data.total_sales || '0.00',
      total_tax: data.total_tax || '0.00',
      total_due: data.total_due || '0.00',
      total_discount_given: data.total_discount_given || '0.00',
      total_advance_received: data.total_advance_received || '0.00',
      ...data // Preserve any additional fields
    });
  }
}

export const createReport = (data) => new ReportData(data);
