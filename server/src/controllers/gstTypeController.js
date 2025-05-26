const determineGstType = (req, res) => {
  const { orgGst, customerGst } = req.body;

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

  // Determine GST type based on state codes
  const gstType = orgStateCode === customerStateCode ? 'CGST + SGST' : 'IGST';

  return res.status(200).json({
    orgGst,
    customerGst,
    gstType
  });
};

export { determineGstType };
