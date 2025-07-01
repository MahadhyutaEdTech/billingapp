const determineGstType = (req, res) => {
  // Accept multiple possible keys for robustness
  const orgGst = (req.body.orgGst || req.body.gst_number || "").toString().trim().toUpperCase();
  const customerGst = (req.body.customerGst || req.body.clientGst || "").toString().trim().toUpperCase();

  // Check if orgGst is provided and valid
  if (!orgGst || orgGst.length < 2) {
    return res.status(400).json({ error: 'Invalid org GST number' });
  }

  // If customerGst is not provided, return 'CGST + SGST'
  if (!customerGst || customerGst.length < 2) {
    return res.status(200).json({
      orgGst,
      customerGst: null,
      gstType: 'CGST + SGST'
    });
  }

  // Extract state codes from both GST numbers
  const orgStateCode = orgGst.slice(0, 2);
  const customerStateCode = customerGst.slice(0, 2);

  // Debug log for troubleshooting
  // console.log({ orgGst, customerGst, orgStateCode, customerStateCode });

  // Determine GST type based on state codes
  // If state codes are different, GST type is IGST; if same, CGST + SGST
  const gstType = orgStateCode === customerStateCode ? 'CGST + SGST' : 'IGST';

  return res.status(200).json({
    orgGst,
    customerGst,
    gstType
  });
};

export { determineGstType };
