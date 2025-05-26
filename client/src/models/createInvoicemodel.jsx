export const initialInvoiceData = {
  customer_id: "",
  client: "",
  clientEmail: "",
  clientPhone: "",
  clientAddress: "",
  clientCity: "",
  clientPincode: "",
  clientGst: "",
  clientCountry: "",  
  // Add any other client details you ne
  invoiceStatus: "Pending",
  issueDate: "",
  dueDate: "",
  receivedAmount: 0,
  products: [], // Ensure this is always an array
  discountType: "percent",
  discountValue: 0,
};


 
  
export const initialOrganizationData = {
  org_id: null, // Set to null if expecting a number
};
