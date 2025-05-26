import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import {
  initialInvoiceData,
  initialOrganizationData,
} from "../models/createInvoicemodel";

import {
  fetchCustomers,
  fetchProducts,
  saveInvoice,
  fetchOrganizations,
  fetchGstType,
} from "../controllers/createInvoiceController";
import "../css/AddInvoicePage.css";
import { debounce } from "lodash"; // Ensure lodash is imported

export default function AddInvoicePage({ onClose }) {
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState({
    ...initialInvoiceData,
    gst_number: "",
    gst_type: null, // Initialize as null instead of default value
  });
  const [customerList, setCustomerList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [productInput, setProductInput] = useState({
    product_id: "",
    product_name: "",
    quantity: 1,
    unit_price: 0,
    sku: "",
    hsn_sac: "",
    tax: 0,
  });
  const [organizationList, setOrganizationList] = useState([]); // Stores all organizations
  const [selectedOrganization, setSelectedOrganization] = useState(""); // Selected org ID
  const [organization, setOrganization] = useState(initialOrganizationData); // Org data
  const [advancePayment, setAdvancePayment] = useState(0);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [showNewShippingForm, setShowNewShippingForm] = useState(false);
  const [newShippingAddress, setNewShippingAddress] = useState({
    first_name: "",
    last_name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [gstType, setGstType] = useState(null); // Initialize as null
  const [quantityError, setQuantityError] = useState("");
  const [selectedStock, setSelectedStock] = useState(0); // Add this new state
  const [sizeMap, setSizeMap] = useState({}); // Track sizes of added products
  const debounceRef = useRef({}); // For tracking debounce timers

  useEffect(() => {
    fetchCustomers(setCustomerList);
    fetchProducts(setProductList);
  }, []);
  useEffect(() => {
    console.log("🔄 Fetching organizations...");
    fetchOrganizations((orgs) => {
      console.log("✅ Organizations Fetched:", orgs);
      setOrganizationList(orgs);
    });
  }, []);

  const handleOrganizationChange = (e) => {
    const orgId = Number(e.target.value); // Convert to number
    const selectedOrg = organizationList.find((org) => org.org_id === orgId);

    if (selectedOrg) {
      console.log("✅ Selected Organization:", selectedOrg);
      setSelectedOrganization(selectedOrg); // Store the full object, not just orgId
      setOrganization(selectedOrg); // This line might be redundant
    } else {
      console.warn("⚠️ Organization not found for ID:", orgId);
    }
  };

  const handleGSTChange = (e) => {
    const selectedGST = e.target.value;
    // Find the state and details for selected GST
    const selectedStateEntry = Object.entries(
      organization?.gst_details || {}
    ).find(([_, details]) => details.gst_number === selectedGST);

    if (selectedStateEntry) {
      const [state, details] = selectedStateEntry;
      setInvoiceData((prev) => ({
        ...prev,
        gst_number: selectedGST,
        organizationAddress: details.address || organization?.address,
        organizationState: state,
      }));

      // Check for customer GST and fetch GST type
      if (selectedGST && invoiceData.clientGst) {
        fetchGstType(selectedGST, invoiceData.clientGst, (type) => {
          setGstType(type);
          setInvoiceData((prev) => ({ ...prev, gst_type: type }));
        });
      }
    }
  };

  const handleCustomerChange = (e) => {
    const customerId = Number(e.target.value);
    setSelectedCustomer(customerId);
    const customer = customerList.find((cust) => cust.customer_id === customerId);

    if (customer) {
      console.log("Selected Customer:", customer);
      
      // Access GST details directly as it's already an object
      const gstDetails = customer.cust_gst_details;
      console.log("GST Details:", gstDetails);

      // Set customer details
      setInvoiceData(prev => ({
        ...prev,
        customer_id: customerId,
        first_name: customer.first_name,
        last_name: customer.last_name,
        clientEmail: customer.email,
        clientPhone: customer.phone,
        clientGst: gstDetails?.gst_no || "",
        clientAddress: gstDetails?.address || "",
        clientState: gstDetails?.state_code || "",
        gst_type: null // Reset GST type
      }));

      // Update GST type if organization GST is already selected
      if (invoiceData.gst_number && gstDetails?.gst_no) {
        console.log("Checking GST Type:", invoiceData.gst_number, gstDetails.gst_no);
        fetchGstType(invoiceData.gst_number, gstDetails.gst_no, (type) => {
          console.log("Got GST Type:", type);
          setGstType(type);
          setInvoiceData(prev => ({ ...prev, gst_type: type }));
        });
      }
    }
  };

  const handleCustomerGSTChange = (e) => {
    const selectedGst = e.target.value;
    if (selectedGst && invoiceData.gst_number) {
      fetchGstType(invoiceData.gst_number, selectedGst, (type) => {
        setGstType(type);
        setInvoiceData(prev => ({ ...prev, gst_type: type, clientGst: selectedGst }));
      });
    }
  };

  const handleShippingSameAsBilling = (e) => {
    setSameAsBilling(e.target.checked);
    if (e.target.checked) {
      setSelectedShippingAddress(null);
      setShowNewShippingForm(false);
    }
  };

  const handleAddNewShippingAddress = () => {
    if (newShippingAddress.first_name && newShippingAddress.line1) {
      setShippingAddresses([
        ...shippingAddresses,
        { ...newShippingAddress, id: Date.now() },
      ]);
      setSelectedShippingAddress({ ...newShippingAddress, id: Date.now() });
      setNewShippingAddress({
        first_name: "",
        last_name: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
      });
      setShowNewShippingForm(false);
    }
  };

  const handleProductSelect = (e) => {
    const selected = productList.find(
      (p) => p.product_id === parseInt(e.target.value)
    );
    if (selected) {
      setSelectedStock(selected.current_stock || 0); // Use current_stock instead of quantity
      setProductInput({
        product_id: selected.product_id,
        product_name: selected.product_name,
        quantity: 1,
        unit_price: parseFloat(selected.unit_price),
        sku: selected.sku,
        hsn_sac: selected.hsn_sac,
        tax: selected.tax || 0,
      });
      setQuantityError("");
    }
  };

  const debouncedQuantityChange = useRef(
    debounce((newQuantity) => {
      setProductInput((prev) => ({
        ...prev,
        quantity: newQuantity,
      }));
      setQuantityError(""); // Clear error after debounce
    }, 300)
  ).current;

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value) || 0;
    if (newQuantity > selectedStock) {
      setQuantityError(`Maximum available quantity is ${selectedStock}`);
      return;
    }
    debouncedQuantityChange(newQuantity); // Use debounced function
  };

  const addProduct = () => {
    if (!productInput.product_id) return;
    if (productInput.quantity <= 0) {
      setQuantityError("Quantity must be greater than 0");
      return;
    }
    if (productInput.quantity > selectedStock) {
      setQuantityError(`Maximum available quantity is ${selectedStock}`);
      return;
    }

    // Update the available stock
    const newStock = selectedStock - productInput.quantity;

    setInvoiceData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          ...productInput,
          current_stock: selectedStock, // Include current stock value
        },
      ],
    }));

    setProductList((prevList) =>
      prevList.map((p) =>
        p.product_id === productInput.product_id
          ? { ...p, quantity: newStock }
          : p
      )
    );

    setSelectedStock(newStock); // Update the selected stock
    setProductInput({
      product_id: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      sku: "",
      hsn_sac: "",
      tax: 0,
    });

    setQuantityError("");
  };

  const removeProduct = (index) => {
    const removedProduct = invoiceData.products[index];

    // Restore the available stock
    setProductList((prevList) =>
      prevList.map((p) =>
        p.product_id === removedProduct.product_id
          ? { ...p, quantity: p.quantity + removedProduct.quantity }
          : p
      )
    );

    // Update selectedStock if the removed product matches the currently selected product
    if (productInput.product_id === removedProduct.product_id) {
      setSelectedStock((prevStock) => prevStock + removedProduct.quantity);
    }

    setInvoiceData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };
  const handleBack = () => {
    if (onClose) {
      onClose(); // If the page is a modal, close it
    } else {
      navigate(-1); // Go back to the previous page
    }
  };

  // Subtotal (before discount)
  const subtotal = invoiceData.products.reduce(
    (acc, p) => acc + p.quantity * (p.unit_price || 0),
    0
  );

  // Discount (percentage on subtotal)
  const discountPercentage = invoiceData.discountValue || 0;
  const discountAmount = (subtotal * discountPercentage) / 100;

  // Taxable Amount (after discount)
  const taxableAmount = subtotal - discountAmount;

  // Update tax calculations
  const calculateTaxBreakdown = (product, taxableAmount) => {
    const productTax = product.tax || 0;
    const currentGstType = invoiceData.gst_type || gstType;
    console.log("Tax Calculation:", {
      currentGstType,
      productTax,
      taxableAmount,
    });

    if (currentGstType === "IGST") {
      return {
        igst: (taxableAmount * productTax) / 100,
        cgst: 0,
        sgst: 0,
        rate: productTax,
      };
    } else {
      const splitRate = productTax / 2;
      return {
        igst: 0,
        cgst: (taxableAmount * splitRate) / 100,
        sgst: (taxableAmount * splitRate) / 100,
        rate: productTax,
      };
    }
  };

  // Update total tax calculation
  const totalTax = invoiceData.products.reduce(
    (acc, p) => {
      const productTotal = p.quantity * (p.unit_price || 0);
      const productDiscount = (productTotal * discountPercentage) / 100;
      const taxable = productTotal - productDiscount;
      const taxes = calculateTaxBreakdown(p, taxable);

      if (!acc.maxRate || p.tax > acc.maxRate) {
        acc.maxRate = p.tax;
      }

      return {
        igst: acc.igst + taxes.igst,
        cgst: acc.cgst + taxes.cgst,
        sgst: acc.sgst + taxes.sgst,
        maxRate: acc.maxRate,
      };
    },
    { igst: 0, cgst: 0, sgst: 0, maxRate: 0 }
  );

  // Update the total calculation
  const total = taxableAmount + totalTax.igst + totalTax.cgst + totalTax.sgst;

  // Advance and Received
  const advance = parseFloat(advancePayment) || 0;
  const received = parseFloat(invoiceData.receivedAmount) || 0;

  // Due and Return
  const dueAmount = Math.max(total - (advance + received), 0);
  const returnAmount = received > total ? received - total : 0;

  const incrementQuantity = (index) => {
    const product = invoiceData.products[index];
    const currentSize = sizeMap[index] || product.quantity; // fallback to actual quantity
    const availableStock = product.current_stock || 0;

    if (currentSize < availableStock) {
      const updatedSize = currentSize + 1;
      setSizeMap((prev) => ({ ...prev, [index]: updatedSize }));
      debounceUpdateQuantity(index, updatedSize);
    } else {
      console.warn("🚫 Cannot add more, stock limit reached!");
    }
  };

  const decrementQuantity = (index) => {
    const currentSize = sizeMap[index] || invoiceData.products[index].quantity;

    if (currentSize > 1) {
      // quantity should not go below 1
      const updatedSize = currentSize - 1;
      setSizeMap((prev) => ({ ...prev, [index]: updatedSize }));
      debounceUpdateQuantity(index, updatedSize);
    } else {
      console.warn("🚫 Quantity cannot be less than 1!");
    }
  };

  const debounceUpdateQuantity = (index, updatedQuantity) => {
    if (!debounceRef.current[index]) {
      debounceRef.current[index] = debounce(() => {
        // Update the product in invoiceData
        setInvoiceData((prev) => {
          const updatedProducts = [...prev.products];
          updatedProducts[index] = {
            ...updatedProducts[index],
            quantity: updatedQuantity,
          };
          return {
            ...prev,
            products: updatedProducts,
          };
        });
      }, 500);
    }

    debounceRef.current[index]();
  };

  const handleSaveInvoice = async () => {
    // Validate organization
    if (!selectedOrganization?.org_id) {
      toast.error("Please select an organization");
      return;
    }

    // Validate customer and products
    if (!selectedCustomer || !invoiceData.products.length) {
      toast.error("Please select a customer and add at least one product");
      return;
    }

    if (!invoiceData.issueDate) {
      toast.error("Please select an issue date");
      return;
    }

    // Prepare invoice data
    const invoiceToSave = {
      customer_id: Number(selectedCustomer),
      org_id: Number(selectedOrganization.org_id),
      invoice_date: invoiceData.issueDate,
      due_date: invoiceData.dueDate,
      total_amount: Number(total) || 0,
      tax_amount: Number(totalTax.cgst + totalTax.sgst + totalTax.igst) || 0,
      status: invoiceData.invoiceStatus?.toLowerCase() || "pending",
      gst_no: invoiceData.clientGst || null,
      gst_number: invoiceData.gst_number || null,
      advance: Number(advance) || 0,
      discount: Number(invoiceData.discountValue) || 0,
      due_amount: Number(dueAmount) || 0,
      gst_type: gstType || "CGST + SGST",
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      products: invoiceData.products.map(p => ({
        product_id: Number(p.product_id),
        quantity: Number(p.quantity),
        unit_price: Number(p.unit_price),
        tax: Number(p.tax) || 0
      })),
      shippingAddresses: sameAsBilling ? {
        first_name: invoiceData.first_name || "",
        last_name: invoiceData.last_name || "",
        address: invoiceData.clientAddress || "",
        phone: invoiceData.clientPhone || ""
      } : {
        first_name: selectedShippingAddress?.first_name || "",
        last_name: selectedShippingAddress?.last_name || "",
        address: selectedShippingAddress?.line1 || "",
        phone: selectedShippingAddress?.phone || ""
      }
    };

    try {
      const response = await saveInvoice(invoiceToSave);
      if (response?.success) {
        // Show success message immediately
        alert('Invoice saved successfully!');
        toast.success("Invoice saved successfully!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        
        // Wait a moment before navigating
        setTimeout(() => {
          navigate('/dashboard/invoices', { replace: true });
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save invoice");
      console.error("Save error:", error);
    }
  };

  return (
    <div className="add-invoice-container">
      <div className="back-button-container">
        <button onClick={handleBack} className="back-button">
          ⬅ Back
        </button>
      </div>
      <h2>ADD Invoice</h2>
      <div className="invoice-organization-section">
        <h3>Organization Details</h3>
        <div className="row-1">
          <label>Organization</label>
          <select
            value={selectedOrganization ? selectedOrganization.org_id : ""}
            onChange={handleOrganizationChange}
          >
            <option value="">Select Organization</option>
            {organizationList.length > 0 ? (
              organizationList.map((org) => (
                <option key={org.org_id} value={org.org_id}>
                  {org.name}
                </option>
              ))
            ) : (
              <option disabled>Loading organizations...</option>
            )}
          </select>

          <label>GST No</label>
          <select
            value={invoiceData.gst_number || ""}
            onChange={handleGSTChange}
          >
            <option value="">Select GST Number</option>
            {organization?.gst_details &&
              typeof organization.gst_details === "object" &&
              Object.entries(organization.gst_details).map(
                ([state, details]) => (
                  <option key={state} value={details.gst_number}>
                    {state}: {details.gst_number}
                  </option>
                )
              )}
          </select>

          <label>Address</label>
          <input
            value={
              invoiceData.organizationAddress || organization?.address || ""
            }
            readOnly
          />
        </div>
      </div>

      {/* Customer Details */}

      <div className="invoice-customers-section">
        <h3>Customer Details</h3>
        <div className="row-1">
          <div className="input-group">
            <label>Customer Name</label>
            <select value={selectedCustomer} onChange={handleCustomerChange}>
              <option value="">Select Customer</option>
              {customerList.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {`${c.first_name} ${c.last_name}`}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>GST Number</label>
            <select 
              value={invoiceData.clientGst || ""}
              onChange={handleCustomerGSTChange}
            >
              <option value="">Select GST Number</option>
              {selectedCustomer && customerList
                .find(c => c.customer_id === selectedCustomer)?.cust_gst_details && 
                (() => {
                  const gstDetails = customerList
                    .find(c => c.customer_id === selectedCustomer)
                    ?.cust_gst_details;
                  if (gstDetails) {
                    return (
                      <option value={gstDetails.gst_no}>
                        {gstDetails.state_code}: {gstDetails.gst_no}
                      </option>
                    );
                  }
                  return null;
                })()
              }
            </select>
          </div>

          <div className="input-group">
            <label>Email</label>
            <input value={invoiceData.clientEmail} readOnly />
          </div>
        </div>

        <div className="row-2">
          <div className="input-group">
            <label>Phone</label>
            <input value={invoiceData.clientPhone} readOnly />
          </div>

          <div className="input-group full-width">
            <label>Address</label>
            <input value={invoiceData.clientAddress} readOnly />
          </div>
        </div>

        <div className="row-3">
          <div className="input-group">
            <label>Issue Date</label>
            <input
              type="date"
              value={invoiceData.issueDate}
              onChange={(e) => setInvoiceData({ ...invoiceData, issueDate: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Due Date</label>
            <input
              type="date"
              value={invoiceData.dueDate}
              onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Invoice Status</label>
            <select
              value={invoiceData.invoiceStatus}
              onChange={(e) => setInvoiceData({ ...invoiceData, invoiceStatus: e.target.value })}
            >
              <option value="">Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      <div className="invoice-shipping-section">
        <div className="shipping-header">
          <h3>Shipping Details</h3>
          <label className="shipping-toggle">
            <input
              type="checkbox"
              checked={sameAsBilling}
              onChange={handleShippingSameAsBilling}
            />
            <span>Same as billing address</span>
          </label>
        </div>

        {!sameAsBilling && (
          <div className="shipping-content">
            <div className="address-actions">
              {shippingAddresses.length > 0 && (
                <div className="address-grid">
                  {shippingAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`address-card ${
                        selectedShippingAddress?.id === addr.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => setSelectedShippingAddress(addr)}
                    >
                      <div className="address-details">
                        <h4>
                          {addr.first_name} {addr.last_name}
                        </h4>
                        <p>{addr.line1}</p>
                        {addr.line2 && <p>{addr.line2}</p>}
                        <p>
                          {addr.city}, {addr.state} {addr.zip}
                        </p>
                        <p>{addr.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="new-address-button"
                onClick={() => setShowNewShippingForm(true)}
              >
                + Add New Address
              </button>
            </div>

            {showNewShippingForm && (
              <div className="shipping-form">
                <div className="form-header">
                  <h4>New Shipping Address</h4>
                  <button
                    className="close-btn"
                    onClick={() => setShowNewShippingForm(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <input
                      placeholder="First Name"
                      value={newShippingAddress.first_name}
                      onChange={(e) =>
                        setNewShippingAddress({
                          ...newShippingAddress,
                          first_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <input
                      placeholder="Last Name"
                      value={newShippingAddress.last_name}
                      onChange={(e) =>
                        setNewShippingAddress({
                          ...newShippingAddress,
                          last_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group full-width">
                    <input
                      placeholder="Address Line 1"
                      value={newShippingAddress.line1}
                      onChange={(e) =>
                        setNewShippingAddress({
                          ...newShippingAddress,
                          line1: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group full-width">
                    <input
                      placeholder="Address Line 2 (Optional)"
                      value={newShippingAddress.line2}
                      onChange={(e) =>
                        setNewShippingAddress({
                          ...newShippingAddress,
                          line2: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <input
                      placeholder="City"
                      value={newShippingAddress.city}
                      onChange={(e) =>
                        setNewShippingAddress({
                          ...newShippingAddress,
                          city: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <input
                      placeholder="State"
                      value={newShippingAddress.state}
                      onChange={(e) =>
                        setNewShippingAddress({
                          ...newShippingAddress,
                          state: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <input
                      placeholder="ZIP/Postal Code"
                      value={newShippingAddress.zip}
                      onChange={(e) =>
                        setNewShippingAddress({
                          ...newShippingAddress,
                          zip: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <input
                      placeholder="Phone Number"
                      value={newShippingAddress.phone}
                      onChange={(e) =>
                        setNewShippingAddress({
                          ...newShippingAddress,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      className="save-btn"
                      onClick={handleAddNewShippingAddress}
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="invoice-product-section">
        <h3>Product Details</h3>

        <div className="row-5">
          <label>Select Product</label>
          <select
            id="product"
            value={productInput.product_id}
            onChange={handleProductSelect}
          >
            <option value="">Select Product</option>
            {productList.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.product_name}
              </option>
            ))}
          </select>

          <label>Quantity</label>
          <div className="quantity-input-container">
            {productInput.product_id && (
              <div className="stock-info-container">
                <span className="stock-info">
                  Available Stock: {selectedStock}
                </span>
              </div>
            )}
            <div className="quantity-controls">
              <button
                type="button"
                className="quantity-btn"
                disabled={productInput.quantity <= 1}
                onClick={() => {
                  const newQuantity = Math.max(1, productInput.quantity - 1);
                  setProductInput((prev) => ({
                    ...prev,
                    quantity: newQuantity,
                  }));
                }}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={selectedStock}
                className={`quantity-input ${quantityError ? "error" : ""}`}
                value={productInput.quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  const newQuantity = Math.min(
                    Math.max(value, 1),
                    selectedStock
                  );
                  setProductInput((prev) => ({
                    ...prev,
                    quantity: newQuantity,
                  }));
                  if (value > selectedStock) {
                    setQuantityError(
                      `Maximum available quantity is ${selectedStock}`
                    );
                  } else {
                    setQuantityError("");
                  }
                }}
              />
              <button
                type="button"
                className="quantity-btn"
                disabled={productInput.quantity >= selectedStock}
                onClick={() => {
                  const newQuantity = Math.min(
                    selectedStock,
                    productInput.quantity + 1
                  );
                  setProductInput((prev) => ({
                    ...prev,
                    quantity: newQuantity,
                  }));
                }}
              >
                +
              </button>
            </div>
            {quantityError && (
              <span className="error-message">{quantityError}</span>
            )}
          </div>

          <label>SKU</label>
          <input
            id="sku"
            type="text"
            placeholder="SKU"
            value={productInput.sku}
            disabled
          />
        </div>
        <div className="row-6">
          <label>HSN/SAC</label>
          <input
            id="hsn_sac"
            type="text"
            placeholder="HSN/SAC"
            value={productInput.hsn_sac}
            disabled
          />

          <label>Unit Price</label>
          <input
            id="unit_price"
            type="number"
            placeholder="Unit Price"
            value={productInput.unit_price}
            disabled
          />

          <label>Tax</label>
          <input
            id="tax"
            type="number"
            placeholder="Tax"
            value={productInput.tax}
            disabled
          />
        </div>

        <button onClick={addProduct} className="add-invoice-btn-add">
          Add Product
        </button>
      </div>

      <div className="invoice-discount-section">
        <h3>Discount Details</h3>
        <div className="row-4">
          <div>
            <label>Discount Percentage (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={invoiceData.discountValue || ""}
              onChange={(e) => {
                const value = Math.min(
                  Math.max(parseFloat(e.target.value) || 0, 0),
                  100
                );
                setInvoiceData({
                  ...invoiceData,
                  discountValue: value,
                  discountType: "percent", // Always set to percent
                });
              }}
              placeholder="Enter discount percentage"
            />
          </div>
          <p>Discount Amount: ₹{discountAmount.toFixed(2)}</p>
        </div>
      </div>

      <table className="add-invoice-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>SKU</th>
            <th>HSN/SAC</th>
            <th>Unit Price</th>
            <th>Tax %</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.products.map((p, i) => {
            const baseAmount = p.quantity * (p.unit_price || 0);
            const tax = p.tax || 0;
            const taxAmount =
              invoiceData.gst_type === "IGST"
                ? (baseAmount * tax) / 100 // Full tax for IGST
                : (baseAmount * tax) / 100; // Split for CGST+SGST
            const totalAmount = baseAmount + taxAmount;

            return (
              <tr key={i}>
                <td>{p.product_name}</td>
                <td>{p.quantity}</td>
                <td>{p.sku}</td>
                <td>{p.hsn_sac}</td>
                <td>₹{(p.unit_price || 0).toFixed(2)}</td>
                <td>{p.tax}%</td>
                <td>₹{totalAmount.toFixed(2)}</td>
                <td>{invoiceData.invoiceStatus || "N/A"}</td>
                <td>
                  <button
                    onClick={() => removeProduct(i)}
                    className="add-invoice-btn-remove"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="add-invoice-payment-summary">
        <h4>Summary</h4>
        <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
        <p>
          Discount ({discountPercentage}%): ₹{discountAmount.toFixed(2)}
        </p>
        {gstType === "IGST" ? (
          <p>
            IGST ({totalTax.maxRate}%): ₹{totalTax.igst.toFixed(2)}
          </p>
        ) : (
          <>
            <p>
              CGST ({totalTax.maxRate / 2}%): ₹{totalTax.cgst.toFixed(2)}
            </p>
            <p>
              SGST ({totalTax.maxRate / 2}%): ₹{totalTax.sgst.toFixed(2)}
            </p>
          </>
        )}
        <h3>Total Payable: ₹{total.toFixed(2)}</h3>

        <div>
          <label>Advance Payment</label>
          <input
            type="number"
            placeholder="Advance Payment"
            value={advance}
            onChange={(e) => setAdvancePayment(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <label>Received Amount</label>
          <input
            type="number"
            placeholder="Received Amount"
            value={received}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                receivedAmount: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        <p>Return Amount: ₹{returnAmount.toFixed(2)}</p>
        <p>Due Amount: ₹{dueAmount.toFixed(2)}</p>
      </div>

      <div className="save-button">
        <button onClick={handleSaveInvoice} className="save-button">
          Save Invoice
        </button>
      </div>
    </div>
  );
}
