import connectionPool from "../config/databaseConfig.js";

export const getReports = async (reportType) => {
  try {
    let sqlQuery = "";

    switch (reportType) {
      case "monthly":
        sqlQuery = `
          SELECT 
            DATE_FORMAT(invoice_date, '%Y-%m') AS month,
            COUNT(invoice_id) AS total_invoices,
            SUM(total_amount) AS total_sales,
            SUM(tax_amount) AS total_tax,
            SUM(due_amount) AS total_due
          FROM invoices
          GROUP BY month
          ORDER BY month DESC;
        `;
        break;

      case "quarterly":
        sqlQuery = `
          SELECT 
            CONCAT(YEAR(invoice_date), '-Q', QUARTER(invoice_date)) AS quarter,
            COUNT(invoice_id) AS total_invoices,
            SUM(total_amount) AS total_sales,
            SUM(tax_amount) AS total_tax,
            SUM(due_amount) AS total_due
          FROM invoices
          GROUP BY quarter
          ORDER BY quarter DESC;
        `;
        break;

      case "yearly":
        sqlQuery = `
          SELECT 
            YEAR(invoice_date) AS year,
            COUNT(invoice_id) AS total_invoices,
            SUM(total_amount) AS total_sales,
            SUM(tax_amount) AS total_tax,
            SUM(due_amount) AS total_due,
            SUM(discount) AS total_discount_given,
            SUM(advance) AS total_advance_received
          FROM invoices
          GROUP BY year
          ORDER BY year DESC;
        `;
        break;

      case "outstanding":
        sqlQuery = `
          SELECT 
            invoice_id,
            customer_id,
            total_amount,
            due_amount,
            due_date,
            status
          FROM invoices
          WHERE status != 'Paid'
          ORDER BY due_date ASC;
        `;
        break;

      case "customerwise":
        sqlQuery = `
          SELECT 
            customer_id,
            COUNT(invoice_id) AS total_invoices,
            SUM(total_amount) AS total_invoiced_amount,
            SUM(due_amount) AS total_due_amount
          FROM invoices
          GROUP BY customer_id
          ORDER BY total_invoiced_amount DESC;
        `;
        break;

      case "organizationwise":
        sqlQuery = `
          SELECT 
            i.org_id,
            o.name AS org_name,
            COUNT(i.invoice_id) AS total_invoices,
            SUM(i.total_amount) AS total_invoiced_amount,
            SUM(i.tax_amount) AS total_tax_collected
          FROM invoices i
          LEFT JOIN organizations o ON i.org_id = o.org_id
          GROUP BY i.org_id, o.name
          ORDER BY total_invoiced_amount DESC;
        `;
        break;

      case "gstreport":
        sqlQuery = `
          SELECT 
            DATE_FORMAT(invoice_date, '%Y-%m') AS month,
            gst_no,
            gst_type,
            gst_number,
            SUM(tax_amount) AS total_tax_collected
          FROM invoices
          GROUP BY month, gst_no, gst_type, gst_number
          ORDER BY month DESC;
        `;
        break;

      case "statuswise":
        sqlQuery = `
          SELECT 
            status,
            COUNT(invoice_id) AS total_invoices,
            SUM(total_amount) AS total_amount
          FROM invoices
          GROUP BY status;
        `;
        break;

      case "overdue":
        sqlQuery = `
          SELECT 
            invoice_id,
            customer_id,
            due_date,
            total_amount,
            due_amount
          FROM invoices
          WHERE due_date < NOW() 
            AND status != 'Paid'
          ORDER BY due_date ASC;
        `;
        break;

      default:
        throw new Error("Invalid report type");
    }

    const [rows] = await connectionPool.query(sqlQuery);
    return rows;
  } catch (error) {
    console.error("Error generating report:", error.message);
    throw error;
  }
};
