import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initialQuotationData, initialQuotationOrganizationData } from "../../models/quotationModel";
import {
  fetchCustomers,
  fetchProducts,
  saveQuotation,
  fetchOrganizations,
  fetchGstType,
} from "../../controllers/quotationController";
import { debounce } from "lodash";
import "../../css/modules/quotation/AddQuotationPage.css";

export default function AddQuotationPage({ onClose }) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [quotationData, setQuotationData] = useState({
    ...initialQuotationData,
    gst_number: "",
    gst_type: null,
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
  const [organizationList, setOrganizationList] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [organization, setOrganization] = useState(initialQuotationOrganizationData);
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
  const [gstType, setGstType] = useState(null);
  const [quantityError, setQuantityError] = useState("");
  const [selectedStock, setSelectedStock] = useState(0);
  const debounceRef = useRef({});

  useEffect(() => {
    fetchCustomers(setCustomerList);
    fetchProducts(setProductList);
  }, []);

  useEffect(() => {
    // Dark mode detection
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

  useEffect(() => {
    //console.log("🔄 Fetching organizations...");
    fetchOrganizations((orgs) => {
     // console.log("✅ Organizations Fetched:", orgs);
      setOrganizationList(orgs);
    });
  }, []);

  const handleOrganizationChange = (e) => {
    const orgId = Number(e.target.value);
    const selectedOrg = organizationList.find((org) => org.org_id === orgId);

    if (selectedOrg) {
      setSelectedOrganization(selectedOrg);
      setOrganization(selectedOrg);
      setQuotationData(prev => ({
        ...prev,
        org_id: orgId
      }));
    } else {
      console.warn("⚠️ Organization not found for ID:", orgId);
    }
  };

  const handleGSTChange = (e) => {
    const selectedGST = e.target.value;
    const selectedStateEntry = Object.entries(organization?.gst_details || {}).find(
      ([_, details]) => details.gst_number === selectedGST,
    );

    if (selectedStateEntry) {
      const [state, details] = selectedStateEntry;
      setQuotationData((prev) => ({
        ...prev,
        gst_number: selectedGST,
        organizationAddress: details.address || organization?.address,
        organizationState: state,
      }));

      if (selectedGST && quotationData.clientGst) {
        fetchGstType(selectedGST, quotationData.clientGst, (type) => {
          setGstType(type);
          setQuotationData((prev) => ({ ...prev, gst_type: type }));
        });
      }
    }
  };

  const handleCustomerChange = (e) => {
    const customerId = Number(e.target.value);
    setSelectedCustomer(customerId);
    const customer = customerList.find((cust) => cust.customer_id === customerId);

    if (customer) {
     // console.log("Selected Customer:", customer);

      const gstDetails = customer.cust_gst_details;
     // console.log("GST Details:", gstDetails);

      setQuotationData((prev) => ({
        ...prev,
        customer_id: customerId,
        first_name: customer.first_name,
        last_name: customer.last_name,
        clientEmail: customer.email,
        clientPhone: customer.phone,
        clientGst: gstDetails?.gst_no || "",
        clientAddress: gstDetails?.address || "",
        clientState: gstDetails?.state_code || "",
        gst_type: null,
      }));

      if (quotationData.gst_number && gstDetails?.gst_no) {
        console.log("Checking GST Type:", quotationData.gst_number, gstDetails.gst_no);
        fetchGstType(quotationData.gst_number, gstDetails.gst_no, (type) => {
          console.log("Got GST Type:", type);
          setGstType(type);
          setQuotationData((prev) => ({ ...prev, gst_type: type }));
        });
      }
    }
  };

  const handleCustomerGSTChange = (e) => {
    const selectedGst = e.target.value;
    if (selectedGst && quotationData.gst_number) {
      fetchGstType(quotationData.gst_number, selectedGst, (type) => {
        setGstType(type);
        setQuotationData((prev) => ({ ...prev, gst_type: type, clientGst: selectedGst }));
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
      setShippingAddresses([...shippingAddresses, { ...newShippingAddress, id: Date.now() }]);
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
    const selected = productList.find((p) => p.product_id === Number.parseInt(e.target.value));
    if (selected) {
      setSelectedStock(selected.current_stock || 0);
      setProductInput({
        product_id: selected.product_id,
        product_name: selected.product_name,
        quantity: 1,
        unit_price: Number.parseFloat(selected.unit_price),
        sku: selected.sku,
        hsn_sac: selected.hsn_sac,
        tax: selected.tax || 0,
      });
      setQuantityError("");
    }
  };

  const debouncedQuantityChange = useRef(
    debounce((newQuantity) => {
      const product = productList.find((p) => p.product_id === productInput.product_id);
      if (product && newQuantity > product.current_stock) {
        setQuantityError(`Only ${product.current_stock} items available in stock`);
      } else {
        setQuantityError("");
      }
    }, 300)
  ).current;

  const handleQuantityChange = (e) => {
    const newQuantity = Number.parseInt(e.target.value);
    setProductInput((prev) => ({ ...prev, quantity: newQuantity }));
    debouncedQuantityChange(newQuantity);
  };

  const addProduct = () => {
    if (!productInput.product_id) {
      toast.error("Please select a product");
      return;
    }

    if (productInput.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (quantityError) {
      toast.error(quantityError);
      return;
    }

    const existingProductIndex = quotationData.products.findIndex(
      (p) => p.product_id === productInput.product_id
    );

    if (existingProductIndex !== -1) {
      toast.error("Product already added to quotation");
      return;
    }

    const newProduct = {
      ...productInput,
      total: productInput.quantity * productInput.unit_price,
    };

    setQuotationData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));

    setProductInput({
      product_id: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      sku: "",
      hsn_sac: "",
      tax: 0,
    });
    setSelectedStock(0);
    setQuantityError("");
  };

  const removeProduct = (index) => {
    setQuotationData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/dashboard/quotations");
    }
  };

  const calculateTaxBreakdown = (product, taxableAmount) => {
    const taxRate = product.tax || 0;
    const taxAmount = (taxableAmount * taxRate) / 100;
    return {
      cgst: quotationData.gst_type === "CGST" ? taxAmount / 2 : 0,
      sgst: quotationData.gst_type === "SGST" ? taxAmount / 2 : 0,
      igst: quotationData.gst_type === "IGST" ? taxAmount : 0,
      total: taxAmount,
    };
  };

  const incrementQuantity = (index) => {
    const updatedProducts = [...quotationData.products];
    const product = updatedProducts[index];
    const stockProduct = productList.find((p) => p.product_id === product.product_id);

    if (stockProduct && product.quantity < stockProduct.current_stock) {
      product.quantity += 1;
      product.total = product.quantity * product.unit_price;
      setQuotationData((prev) => ({ ...prev, products: updatedProducts }));
    } else {
      toast.error("Cannot exceed available stock");
    }
  };

  const decrementQuantity = (index) => {
    const updatedProducts = [...quotationData.products];
    const product = updatedProducts[index];

    if (product.quantity > 1) {
      product.quantity -= 1;
      product.total = product.quantity * product.unit_price;
      setQuotationData((prev) => ({ ...prev, products: updatedProducts }));
    }
  };

  const debounceUpdateQuantity = (index, updatedQuantity) => {
    if (debounceRef.current[`quantity_${index}`]) {
      clearTimeout(debounceRef.current[`quantity_${index}`]);
    }

    debounceRef.current[`quantity_${index}`] = setTimeout(() => {
      const updatedProducts = [...quotationData.products];
      const product = updatedProducts[index];
      const stockProduct = productList.find((p) => p.product_id === product.product_id);

      if (stockProduct && updatedQuantity <= stockProduct.current_stock) {
        product.quantity = updatedQuantity;
        product.total = updatedQuantity * product.unit_price;
        setQuotationData((prev) => ({ ...prev, products: updatedProducts }));
      } else {
        toast.error(`Cannot exceed available stock (${stockProduct?.current_stock || 0})`);
      }
    }, 300);
  };

  const handleSaveQuotation = async () => {
    if (!quotationData.customer_id) {
      toast.error("Please select a customer");
      return;
    }

    if (!quotationData.org_id) {
      toast.error("Please select an organization");
      return;
    }

    if (quotationData.products.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    if (!quotationData.quotationDate) {
      toast.error("Please select quotation date");
      return;
    }

    if (!quotationData.validUntil) {
      toast.error("Please select valid until date");
      return;
    }

    const totalAmount = quotationData.products.reduce((sum, product) => sum + product.total, 0);
    const discountAmount = quotationData.discountType === "percent" 
      ? (totalAmount * quotationData.discountValue) / 100 
      : quotationData.discountValue;
    
    const taxableAmount = totalAmount - discountAmount;
    const totalTax = quotationData.products.reduce((sum, product) => {
      const taxBreakdown = calculateTaxBreakdown(product, product.total);
      return sum + taxBreakdown.total;
    }, 0);

    const quotationPayload = {
      customer_id: quotationData.customer_id,
      org_id: quotationData.org_id,
      quotation_date: quotationData.quotationDate,
      valid_until: quotationData.validUntil,
      total_amount: totalAmount,
      discount: discountAmount,
      tax_amount: totalTax,
      status: quotationData.quotationStatus,
      created_at: new Date().toISOString().split("T")[0],
      gst_no: quotationData.clientGst,
      gst_number: quotationData.gst_number,
      gst_type: quotationData.gst_type,
      shippingAddresses: sameAsBilling ? [] : [selectedShippingAddress],
      products: quotationData.products.map((product) => ({
        product_id: product.product_id,
        quantity: product.quantity,
        unit_price: product.unit_price,
      })),
      notes: quotationData.notes,
      terms_conditions: quotationData.termsConditions,
    };

    try {
      const result = await saveQuotation(quotationPayload);
      toast.success("Quotation created successfully!");
      //console.log("Quotation created:", result);
      
      if (onClose) {
        onClose();
      } else {
        navigate("/dashboard/quotations");
      }
    } catch (error) {
      console.error("Error creating quotation:", error);
      toast.error(error.response?.data?.message || "Failed to create quotation");
    }
  };

  const totalAmount = quotationData.products.reduce((sum, product) => sum + product.total, 0);
  const discountAmount = quotationData.discountType === "percent" 
    ? (totalAmount * quotationData.discountValue) / 100 
    : quotationData.discountValue;
  const taxableAmount = totalAmount - discountAmount;
  const totalTax = quotationData.products.reduce((sum, product) => {
    const taxBreakdown = calculateTaxBreakdown(product, product.total);
    return sum + taxBreakdown.total;
  }, 0);
  const finalAmount = taxableAmount + totalTax;

  return (
    <div className={`add-quotation-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="add-quotation-header">
        <h2>Create New Quotation</h2>
        <p>Fill in the details below to create a new quotation</p>
      </div>

      <div className="add-quotation-content">
        <div className="quotation-form-section">
          <h3>Organization & Customer Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Organization *</label>
              <select
                value={quotationData.org_id || ""}
                onChange={handleOrganizationChange}
                required
              >
                <option value="">Select Organization</option>
                {organizationList.map((org) => (
                  <option key={org.org_id} value={org.org_id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Organization GST Number</label>
              <select
                value={quotationData.gst_number}
                onChange={handleGSTChange}
                disabled={!quotationData.org_id}
              >
                <option value="">Select GST Number</option>
                {organization.gst_details &&
                  Object.entries(organization.gst_details).map(([state, details]) => (
                    <option key={details.gst_number} value={details.gst_number}>
                      {details.gst_number} ({state})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Customer *</label>
              <select
                value={selectedCustomer}
                onChange={handleCustomerChange}
                required
              >
                <option value="">Select Customer</option>
                {customerList.map((customer) => (
                  <option key={customer.customer_id} value={customer.customer_id}>
                    {customer.first_name} {customer.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Customer GST Number</label>
              <input
                type="text"
                value={quotationData.clientGst}
                onChange={handleCustomerGSTChange}
                placeholder="Enter GST Number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quotation Date *</label>
              <input
                type="date"
                value={quotationData.quotationDate}
                onChange={(e) =>
                  setQuotationData((prev) => ({ ...prev, quotationDate: e.target.value }))
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Valid Until *</label>
              <input
                type="date"
                value={quotationData.validUntil}
                onChange={(e) =>
                  setQuotationData((prev) => ({ ...prev, validUntil: e.target.value }))
                }
                required
              />
            </div>
          </div>
        </div>

        <div className="quotation-form-section">
          <h3>Products</h3>
          
          <div className="product-selection">
            <div className="form-row">
              <div className="form-group">
                <label>Product</label>
                <select value={productInput.product_id} onChange={handleProductSelect}>
                  <option value="">Select Product</option>
                  {productList.map((product) => (
                    <option key={product.product_id} value={product.product_id}>
                      {product.product_name} - ₹{product.unit_price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={productInput.quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={selectedStock}
                />
                {quantityError && <span className="error-text">{quantityError}</span>}
              </div>

              <div className="form-group">
                <label>Unit Price</label>
                <input
                  type="number"
                  value={productInput.unit_price}
                  onChange={(e) =>
                    setProductInput((prev) => ({
                      ...prev,
                      unit_price: Number.parseFloat(e.target.value),
                    }))
                  }
                  step="0.01"
                />
              </div>

              <button className="add-product-btn" onClick={addProduct}>
                Add Product
              </button>
            </div>
          </div>

          {quotationData.products.length > 0 && (
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Tax</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationData.products.map((product, index) => {
                    const taxBreakdown = calculateTaxBreakdown(product, product.total);
                    return (
                      <tr key={index}>
                        <td>{product.product_name}</td>
                        <td>
                          <div className="quantity-controls">
                            <button onClick={() => decrementQuantity(index)}>-</button>
                            <input
                              type="number"
                              value={product.quantity}
                              onChange={(e) =>
                                debounceUpdateQuantity(index, Number.parseInt(e.target.value))
                              }
                              min="1"
                            />
                            <button onClick={() => incrementQuantity(index)}>+</button>
                          </div>
                        </td>
                        <td>₹{product.unit_price}</td>
                        <td>₹{product.total}</td>
                        <td>₹{taxBreakdown.total}</td>
                        <td>
                          <button
                            className="remove-product-btn"
                            onClick={() => removeProduct(index)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="quotation-form-section">
          <h3>Additional Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Discount Type</label>
              <select
                value={quotationData.discountType}
                onChange={(e) =>
                  setQuotationData((prev) => ({ ...prev, discountType: e.target.value }))
                }
              >
                <option value="percent">Percentage</option>
                <option value="amount">Fixed Amount</option>
              </select>
            </div>

            <div className="form-group">
              <label>Discount Value</label>
              <input
                type="number"
                value={quotationData.discountValue}
                onChange={(e) =>
                  setQuotationData((prev) => ({ ...prev, discountValue: Number.parseFloat(e.target.value) }))
                }
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={quotationData.notes}
              onChange={(e) =>
                setQuotationData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows="3"
              placeholder="Enter any additional notes..."
            />
          </div>

          <div className="form-group">
            <label>Terms & Conditions</label>
            <textarea
              value={quotationData.termsConditions}
              onChange={(e) =>
                setQuotationData((prev) => ({ ...prev, termsConditions: e.target.value }))
              }
              rows="4"
              placeholder="Enter terms and conditions..."
            />
          </div>
        </div>

        <div className="quotation-summary">
          <h3>Quotation Summary</h3>
          <div className="summary-item">
            <span>Subtotal:</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Discount:</span>
            <span>-₹{discountAmount.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Tax:</span>
            <span>₹{totalTax.toFixed(2)}</span>
          </div>
          <div className="summary-item total">
            <span>Total:</span>
            <span>₹{finalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="quotation-actions">
          <button className="cancel-btn" onClick={handleBack}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSaveQuotation}>
            Create Quotation
          </button>
        </div>
      </div>
    </div>
  );
} 