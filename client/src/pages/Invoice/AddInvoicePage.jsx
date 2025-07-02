import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { initialInvoiceData, initialOrganizationData } from "../../models/createInvoicemodel"

import {
  fetchCustomers,
  fetchProducts,
  saveInvoice,
  fetchOrganizations,
  fetchGstType,
} from "../../controllers/createInvoiceController"
import { debounce } from "lodash"
import "../../css/modules/invoice/AddInvoicePage.css"

// Helper function to determine GST type based on GSTIN prefix
function getGstType(orgGst, custGst) {
  if (
    orgGst &&
    custGst &&
    orgGst.length >= 2 &&
    custGst.length >= 2 &&
    orgGst.substring(0, 2) === custGst.substring(0, 2)
  ) {
    return "CGST_SGST"
  }
  return "IGST"
}

export default function AddInvoicePage({ onClose }) {
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [invoiceData, setInvoiceData] = useState({
    ...initialInvoiceData,
    gst_number: "",
    gst_type: null,
  })
  const [customerList, setCustomerList] = useState([])
  const [productList, setProductList] = useState([])
  const [showForm, setShowForm] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [productInput, setProductInput] = useState({
    product_id: "",
    product_name: "",
    quantity: 1,
    unit_price: 0,
    sku: "",
    hsn_sac: "",
    tax: 0,
  })
  const [organizationList, setOrganizationList] = useState([])
  const [selectedOrganization, setSelectedOrganization] = useState("")
  const [organization, setOrganization] = useState(initialOrganizationData)
  const [advancePayment, setAdvancePayment] = useState(0)
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [shippingAddresses, setShippingAddresses] = useState([])
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null)
  const [showNewShippingForm, setShowNewShippingForm] = useState(false)
  const [newShippingAddress, setNewShippingAddress] = useState({
    first_name: "",
    last_name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  })
  const [quantityError, setQuantityError] = useState("")
  const [selectedStock, setSelectedStock] = useState(0)
  const [sizeMap, setSizeMap] = useState({})
  const debounceRef = useRef({})

  useEffect(() => {
    fetchCustomers(setCustomerList)
    fetchProducts(setProductList)
  }, [])

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

  useEffect(() => {
    //console.log("🔄 Fetching organizations...")
    fetchOrganizations((orgs) => {
     // console.log("✅ Organizations Fetched:", orgs)
      setOrganizationList(orgs)
    })
  }, [])

  const handleOrganizationChange = (e) => {
    const orgId = Number(e.target.value)
    const selectedOrg = organizationList.find((org) => org.org_id === orgId)

    if (selectedOrg) {
    //  console.log("✅ Selected Organization:", selectedOrg)
      setSelectedOrganization(selectedOrg)
      setOrganization(selectedOrg)
    } else {
      console.warn("⚠️ Organization not found for ID:", orgId)
    }
  }

  const handleGSTChange = (e) => {
    const selectedGST = e.target.value
    const selectedStateEntry = Object.entries(organization?.gst_details || {}).find(
      ([_, details]) => details.gst_number === selectedGST,
    )

    if (selectedStateEntry) {
      const [state, details] = selectedStateEntry
      setInvoiceData((prev) => ({
        ...prev,
        gst_number: selectedGST,
        organizationAddress: details.address || organization?.address,
        organizationState: state,
      }))

      if (selectedGST && invoiceData.clientGst) {
        fetchGstType(selectedGST, invoiceData.clientGst, (type) => {
          setInvoiceData((prev) => ({ ...prev, gst_type: type }))
        })
      }
    }
  }

  const handleCustomerChange = (e) => {
    const customerId = Number(e.target.value)
    setSelectedCustomer(customerId)
    const customer = customerList.find((cust) => cust.customer_id === customerId)

    if (customer) {
      // Get GST details if available
      const gstDetails = customer.cust_gst_details

      setInvoiceData((prev) => ({
        ...prev,
        customer_id: customerId,
        first_name: customer.first_name,
        last_name: customer.last_name,
        clientEmail: customer.email,
        clientPhone: customer.phone,
        clientGst: gstDetails?.gst_no || "",
        clientAddress: gstDetails?.address || customer.address || "",
        clientState: gstDetails?.state_code || customer.state || "",
        gst_type: null,
      }))

      // Optionally, auto-fill shipping address if same as billing
      if (sameAsBilling) {
        setSelectedShippingAddress(null)
        setShowNewShippingForm(false)
      }

      if (invoiceData.gst_number && gstDetails?.gst_no) {
        fetchGstType(invoiceData.gst_number, gstDetails.gst_no, (type) => {
          setInvoiceData((prev) => ({ ...prev, gst_type: type }))
        })
      }
    }
  }

  const handleCustomerGSTChange = (e) => {
    const selectedGst = e.target.value
    if (selectedGst && invoiceData.gst_number) {
      fetchGstType(invoiceData.gst_number, selectedGst, (type) => {
        setInvoiceData((prev) => ({ ...prev, gst_type: type, clientGst: selectedGst }))
      })
    }
  }

  const handleShippingSameAsBilling = (e) => {
    setSameAsBilling(e.target.checked)
    if (e.target.checked) {
      setSelectedShippingAddress(null)
      setShowNewShippingForm(false)
    }
  }

  const handleAddNewShippingAddress = () => {
    if (newShippingAddress.first_name && newShippingAddress.line1) {
      setShippingAddresses([...shippingAddresses, { ...newShippingAddress, id: Date.now() }])
      setSelectedShippingAddress({ ...newShippingAddress, id: Date.now() })
      setNewShippingAddress({
        first_name: "",
        last_name: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
      })
      setShowNewShippingForm(false)
    }
  }

  const handleProductSelect = (e) => {
    const selected = productList.find((p) => p.product_id === Number.parseInt(e.target.value))
    if (selected) {
      setSelectedStock(selected.current_stock || 0)
      setProductInput({
        product_id: selected.product_id,
        product_name: selected.product_name,
        quantity: 1,
        unit_price: Number.parseFloat(selected.unit_price),
        sku: selected.sku,
        hsn_sac: selected.hsn_sac,
        tax: selected.tax || 0,
      })
      setQuantityError("")
    }
  }

  const debouncedQuantityChange = useRef(
    debounce((newQuantity) => {
      setProductInput((prev) => ({
        ...prev,
        quantity: newQuantity,
      }))
      setQuantityError("")
    }, 300),
  ).current

  const handleQuantityChange = (e) => {
    const newQuantity = Number.parseInt(e.target.value) || 0
    if (newQuantity > selectedStock) {
      setQuantityError(`Maximum available quantity is ${selectedStock}`)
      return
    }
    debouncedQuantityChange(newQuantity)
  }

  // FIXED: Main issue was here - the addProduct function
  const addProduct = () => {
    //console.log("🔄 Adding Product:", productInput)

    if (!productInput.product_id) {
      console.warn("⚠️ No product selected")
      return
    }

    if (productInput.quantity <= 0) {
      setQuantityError("Quantity must be greater than 0")
      return
    }

    if (productInput.quantity > selectedStock) {
      setQuantityError(`Maximum available quantity is ${selectedStock}`)
      return
    }

    // Check if product is already added
    const existingProductIndex = invoiceData.products.findIndex((p) => p.product_id === productInput.product_id)

    if (existingProductIndex !== -1) {
      // Update existing product quantity
      setInvoiceData((prev) => {
        const updatedProducts = [...prev.products]
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          quantity: updatedProducts[existingProductIndex].quantity + productInput.quantity,
        }
        return {
          ...prev,
          products: updatedProducts,
        }
      })
      console.log("✅ Updated existing product quantity")
    } else {
      // Add new product
      setInvoiceData((prev) => {
        const newProducts = [
          ...prev.products,
          {
            ...productInput,
            current_stock: selectedStock,
          },
        ]
        //console.log("✅ Added new product. Total products:", newProducts.length)
        return {
          ...prev,
          products: newProducts,
        }
      })
    }

    // Update available stock in product list
    setProductList((prevList) =>
      prevList.map((p) =>
        p.product_id === productInput.product_id
          ? { ...p, current_stock: (p.current_stock || 0) - productInput.quantity }
          : p,
      ),
    )

    // Reset form
    setProductInput({
      product_id: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      sku: "",
      hsn_sac: "",
      tax: 0,
    })
    setSelectedStock(0)
    setQuantityError("")

    console.log("🎉 Product added successfully!")
  }

  const removeProduct = (index) => {
    const removedProduct = invoiceData.products[index]
   // console.log("🗑️ Removing product:", removedProduct)

    // Restore the available stock
    setProductList((prevList) =>
      prevList.map((p) =>
        p.product_id === removedProduct.product_id
          ? { ...p, current_stock: (p.current_stock || 0) + removedProduct.quantity }
          : p,
      ),
    )

    // Update selectedStock if the removed product matches the currently selected product
    if (productInput.product_id === removedProduct.product_id) {
      setSelectedStock((prevStock) => prevStock + removedProduct.quantity)
    }

    setInvoiceData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }))

    console.log("✅ Product removed successfully")
  }

  const handleBack = () => {
    if (onClose) {
      onClose()
    } else {
      navigate(-1)
    }
  }

  // Calculations
  const subtotal = invoiceData.products.reduce((acc, p) => acc + p.quantity * (p.unit_price || 0), 0)

  const discountPercentage = invoiceData.discountValue || 0
  const discountAmount = (subtotal * discountPercentage) / 100
  const taxableAmount = subtotal - discountAmount

  const calculateTaxBreakdown = (product, taxableAmount) => {
    const productTax = product.tax || 0
    const gstTypeToUse = invoiceData.gst_type || getGstType(invoiceData.gst_number, invoiceData.clientGst)

    if (gstTypeToUse === "IGST") {
      return {
        igst: (taxableAmount * productTax) / 100,
        cgst: 0,
        sgst: 0,
        rate: productTax,
      }
    } else {
      const splitRate = productTax / 2
      return {
        igst: 0,
        cgst: (taxableAmount * splitRate) / 100,
        sgst: (taxableAmount * splitRate) / 100,
        rate: productTax,
      }
    }
  }

  const totalTax = invoiceData.products.reduce(
    (acc, p) => {
      const productTotal = p.quantity * (p.unit_price || 0)
      const productDiscount = (productTotal * discountPercentage) / 100
      const taxable = productTotal - productDiscount
      const taxes = calculateTaxBreakdown(p, taxable)

      if (!acc.maxRate || p.tax > acc.maxRate) {
        acc.maxRate = p.tax
      }

      return {
        igst: acc.igst + taxes.igst,
        cgst: acc.cgst + taxes.cgst,
        sgst: acc.sgst + taxes.sgst,
        maxRate: acc.maxRate,
      }
    },
    { igst: 0, cgst: 0, sgst: 0, maxRate: 0 },
  )

  const total = taxableAmount + totalTax.igst + totalTax.cgst + totalTax.sgst
  const advance = Number.parseFloat(advancePayment) || 0
  const received = Number.parseFloat(invoiceData.receivedAmount) || 0
  const dueAmount = Math.max(total - (advance + received), 0)
  const returnAmount = received > total ? received - total : 0

  const incrementQuantity = (index) => {
    const product = invoiceData.products[index]
    const currentSize = sizeMap[index] || product.quantity
    const availableStock = product.current_stock || 0

    if (currentSize < availableStock) {
      const updatedSize = currentSize + 1
      setSizeMap((prev) => ({ ...prev, [index]: updatedSize }))
      debounceUpdateQuantity(index, updatedSize)
    } else {
      console.warn("🚫 Cannot add more, stock limit reached!")
    }
  }

  const decrementQuantity = (index) => {
    const currentSize = sizeMap[index] || invoiceData.products[index].quantity

    if (currentSize > 1) {
      const updatedSize = currentSize - 1
      setSizeMap((prev) => ({ ...prev, [index]: updatedSize }))
      debounceUpdateQuantity(index, updatedSize)
    } else {
      console.warn("🚫 Quantity cannot be less than 1!")
    }
  }

  const debounceUpdateQuantity = (index, updatedQuantity) => {
    if (!debounceRef.current[index]) {
      debounceRef.current[index] = debounce(() => {
        setInvoiceData((prev) => {
          const updatedProducts = [...prev.products]
          updatedProducts[index] = {
            ...updatedProducts[index],
            quantity: updatedQuantity,
          }
          return {
            ...prev,
            products: updatedProducts,
          }
        })
      }, 500)
    }

    debounceRef.current[index]()
  }

  const handleSaveInvoice = async () => {
    console.log("💾 Saving invoice with products:", invoiceData.products)

    if (!selectedOrganization?.org_id) {
      toast.error("Please select an organization")
      return
    }

    if (!selectedCustomer || !invoiceData.products.length) {
      toast.error("Please select a customer and add at least one product")
      return
    }

    if (!invoiceData.issueDate) {
      toast.error("Please select an issue date")
      return
    }

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
      gst_type: getGstType(invoiceData.gst_number, invoiceData.clientGst) || "CGST + SGST",
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      products: invoiceData.products.map((p) => ({
        product_id: Number(p.product_id),
        quantity: Number(p.quantity),
        unit_price: Number(p.unit_price),
        tax: Number(p.tax) || 0,
      })),
      shippingAddresses: sameAsBilling
        ? {
            first_name: invoiceData.first_name || "",
            last_name: invoiceData.last_name || "",
            address: invoiceData.clientAddress || "",
            phone: invoiceData.clientPhone || "",
          }
        : {
            first_name: selectedShippingAddress?.first_name || "",
            last_name: selectedShippingAddress?.last_name || "",
            address: selectedShippingAddress?.line1 || "",
            phone: selectedShippingAddress?.phone || "",
          },
    }

    try {
      const response = await saveInvoice(invoiceToSave)
      if (response?.success) {
        alert("Invoice saved successfully!")
        toast.success("Invoice saved successfully!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        })

        setTimeout(() => {
          navigate("/dashboard/invoices", { replace: true })
        }, 2000)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save invoice")
      console.error("Save error:", error)
    }
  }

  // Debug: Log current products
  //console.log("Current products in invoice:", invoiceData.products)

  return (
    <div className={`inv-form-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <h2 className="main-form-title">Add New Invoice</h2>
     

      <h3 className="section-heading">Organization Details</h3>
      <hr className="section-divider" />
      <div className="inv-form-section">
        <div className="inv-form-grid">
          <div className="inv-form-input-group">
            <label className="inv-form-input-label">Organization *</label>
            <select
              className="inv-form-select"
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
          </div>

          <div className="inv-form-input-group">
            <label className="inv-form-input-label">GST Number *</label>
            <select className="inv-form-select" value={invoiceData.gst_number || ""} onChange={handleGSTChange}>
              <option value="">Select GST Number</option>
              {organization?.gst_details &&
                typeof organization.gst_details === "object" &&
                Object.entries(organization.gst_details).map(([state, details]) => (
                  <option key={state} value={details.gst_number}>
                    {state}: {details.gst_number}
                  </option>
                ))}
            </select>
          </div>

          <div className="inv-form-input-group">
            <label className="inv-form-input-label">Address</label>
            <input
              className="inv-form-input"
              value={invoiceData.organizationAddress || organization?.address || ""}
              readOnly
            />
          </div>
        </div>
      </div>

      <h3 className="section-heading">Customer Details</h3>
      <hr className="section-divider" />
      <div className="inv-form-section">
        <div className="inv-form-grid">
          <div className="inv-form-input-group">
            <label className="inv-form-input-label">Customer Name *</label>
            <select className="inv-form-select" value={selectedCustomer} onChange={handleCustomerChange}>
              <option value="">Select Customer</option>
              {customerList.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {`${c.first_name} ${c.last_name}`}
                </option>
              ))}
            </select>
          </div>

          <div className="inv-form-input-group">
            <label className="inv-form-input-label">GST Number</label>
            <select className="inv-form-select" value={invoiceData.clientGst || ""} onChange={handleCustomerGSTChange}>
              <option value="">Select GST Number</option>
              {selectedCustomer &&
                customerList.find((c) => c.customer_id === selectedCustomer)?.cust_gst_details &&
                (() => {
                  const gstDetails = customerList.find((c) => c.customer_id === selectedCustomer)?.cust_gst_details
                  if (gstDetails) {
                    return (
                      <option value={gstDetails.gst_no}>
                        {gstDetails.state_code}: {gstDetails.gst_no}
                      </option>
                    )
                  }
                  return null
                })()}
            </select>
          </div>

          <div className="inv-form-input-group">
            <label className="inv-form-input-label">Email</label>
            <input className="inv-form-input" value={invoiceData.clientEmail} readOnly />
          </div>

          <div className="inv-form-input-group">
            <label className="inv-form-input-label">Phone</label>
            <input className="inv-form-input" value={invoiceData.clientPhone} readOnly />
          </div>

          <div className="inv-form-input-group inv-form-full-width">
            <label className="inv-form-input-label">Address</label>
            <input className="inv-form-input" value={invoiceData.clientAddress} readOnly />
          </div>

          <div className="inv-form-input-group">
            <label className="inv-form-input-label">Issue Date *</label>
            <input
              className="inv-form-input"
              type="date"
              value={invoiceData.issueDate}
              onChange={(e) => setInvoiceData({ ...invoiceData, issueDate: e.target.value })}
            />
          </div>

          <div className="inv-form-input-group">
            <label className="inv-form-input-label">Due Date</label>
            <input
              className="inv-form-input"
              type="date"
              value={invoiceData.dueDate}
              onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
            />
          </div>

          <div className="inv-form-input-group">
            <label className="inv-form-input-label">Invoice Status</label>
            <select
              className="inv-form-select"
              value={invoiceData.invoiceStatus}
              onChange={(e) => setInvoiceData({ ...invoiceData, invoiceStatus: e.target.value })}
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      <h3 className="section-heading">Shipping Details</h3>
      <hr className="section-divider" />
      <div className="inv-form-section">
        <div className="inv-form-checkbox-group">
          <label className="inv-form-checkbox-label">
            <input
              type="checkbox"
              className="inv-form-checkbox-input"
              checked={sameAsBilling}
              onChange={handleShippingSameAsBilling}
            />
            <span className="inv-form-checkbox-text">Same as billing address</span>
          </label>
        </div>

        {!sameAsBilling && (
          <div className="inv-form-shipping-content">
            {shippingAddresses.length > 0 && (
              <div className="inv-form-address-grid">
                {shippingAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`inv-form-address-card ${selectedShippingAddress?.id === addr.id ? "inv-form-address-card-selected" : ""}`}
                    onClick={() => setSelectedShippingAddress(addr)}
                  >
                    <h4 className="inv-form-address-name">
                      {addr.first_name} {addr.last_name}
                    </h4>
                    <p className="inv-form-address-text">{addr.line1}</p>
                    {addr.line2 && <p className="inv-form-address-text">{addr.line2}</p>}
                    <p className="inv-form-address-text">
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                    <p className="inv-form-address-text">{addr.phone}</p>
                  </div>
                ))}
              </div>
            )}

            <button className="inv-form-add-address-button" onClick={() => setShowNewShippingForm(true)}>
              + Add New Address
            </button>

            {showNewShippingForm && (
              <div className="inv-form-shipping-form">
                <div className="inv-form-form-header">
                  <h4 className="inv-form-form-title">New Shipping Address</h4>
                  <button className="inv-form-close-button" onClick={() => setShowNewShippingForm(false)}>
                    ×
                  </button>
                </div>
                <div className="inv-form-grid">
                  <div className="inv-form-input-group">
                    <input
                      className="inv-form-input"
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
                  <div className="inv-form-input-group">
                    <input
                      className="inv-form-input"
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
                  <div className="inv-form-input-group inv-form-full-width">
                    <input
                      className="inv-form-input"
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
                  <div className="inv-form-input-group inv-form-full-width">
                    <input
                      className="inv-form-input"
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
                  <div className="inv-form-input-group inv-form-full-width">
                    <input
                      className="inv-form-input"
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
                  <div className="inv-form-input-group inv-form-full-width">
                    <input
                      className="inv-form-input"
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
                  <div className="inv-form-input-group inv-form-full-width">
                    <input
                      className="inv-form-input"
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
                  <div className="inv-form-input-group inv-form-full-width">
                    <input
                      className="inv-form-input"
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
                </div>
                <button className="inv-form-save-button" onClick={handleAddNewShippingAddress}>
                  Save Address
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <h3 className="section-heading">Product List</h3>
      <hr className="section-divider" />
      <div className="inv-form-invoicee-section">
        <div className="inv-form-product-form">
          <div className="inv-form-grid">
            <div className="inv-form-input-group">
              <label className="inv-form-input-label">Select Product *</label>
              <select className="inv-form-select" value={productInput.product_id} onChange={handleProductSelect}>
                <option value="">Select Product</option>
                {productList.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.product_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="inv-form-input-group">
              <label className="inv-form-input-label">Quantity *</label>
              {productInput.product_id && <div className="inv-form-stock-info">Available Stock: {selectedStock}</div>}
              <div className="inv-form-quantity-controls">
                <button
                  type="button"
                  className={`inv-form-quantity-button ${productInput.quantity <= 1 ? "inv-form-quantity-button-disabled" : ""}`}
                  disabled={productInput.quantity <= 1}
                  onClick={() => {
                    const newQuantity = Math.max(1, productInput.quantity - 1)
                    setProductInput((prev) => ({
                      ...prev,
                      quantity: newQuantity,
                    }))
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={selectedStock}
                  className={`inv-form-quantity-input ${quantityError ? "inv-form-input-error" : ""}`}
                  value={productInput.quantity}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value) || 0
                    const newQuantity = Math.min(Math.max(value, 1), selectedStock)
                    setProductInput((prev) => ({
                      ...prev,
                      quantity: newQuantity,
                    }))
                    if (value > selectedStock) {
                      setQuantityError(`Maximum available quantity is ${selectedStock}`)
                    } else {
                      setQuantityError("")
                    }
                  }}
                />
                <button
                  type="button"
                  className={`inv-form-quantity-button ${
                    productInput.quantity >= selectedStock ? "inv-form-quantity-button-disabled" : ""
                  }`}
                  disabled={productInput.quantity >= selectedStock}
                  onClick={() => {
                    const newQuantity = Math.min(selectedStock, productInput.quantity + 1)
                    setProductInput((prev) => ({
                      ...prev,
                      quantity: newQuantity,
                    }))
                  }}
                >
                  +
                </button>
              </div>
              {quantityError && <span className="inv-form-error-message">{quantityError}</span>}
            </div>

            <div className="inv-form-input-group">
              <label className="inv-form-input-label">SKU</label>
              <input className="inv-form-input" type="text" placeholder="SKU" value={productInput.sku} disabled />
            </div>

            <div className="inv-form-input-group">
              <label className="inv-form-input-label">HSN/SAC</label>
              <input className="inv-form-input" type="text" placeholder="HSN/SAC" value={productInput.hsn_sac} disabled />
            </div>

            <div className="inv-form-input-group">
              <label className="inv-form-input-label">Unit Price</label>
              <input
                className="inv-form-input"
                type="number"
                placeholder="Unit Price"
                value={productInput.unit_price}
                disabled
              />
            </div>

            <div className="inv-form-input-group">
              <label className="inv-form-input-label">Tax (%)</label>
              <input className="inv-form-input" type="number" placeholder="Tax" value={productInput.tax} disabled />
            </div>
          </div>

          <button onClick={addProduct} className="inv-form-add-product-button">
            Add Product
          </button>
        </div>
      </div>

      <h3 className="section-heading">Discount Details</h3>
      <hr className="section-divider" />
      <div className="inv-form-section">
        <div className="inv-form-discount-form">
          <div className="inv-form-input-group">
            <label className="inv-form-input-label">Discount Percentage (%)</label>
            <input
              className="inv-form-input"
              type="number"
              min="0"
              max="100"
              value={invoiceData.discountValue || ""}
              onChange={(e) => {
                const value = Math.min(Math.max(Number.parseFloat(e.target.value) || 0, 0), 100)
                setInvoiceData({
                  ...invoiceData,
                  discountValue: value,
                  discountType: "percent",
                })
              }}
              placeholder="Enter discount percentage"
            />
          </div>
          <div className="inv-form-discount-amount">Discount Amount: ₹{discountAmount.toFixed(2)}</div>
        </div>
      </div>

      {invoiceData.products.length > 0 && (
        <div className="inv-form-section">
          <div className="inv-form-section-header">
            <h2 className="inv-form-section-title">Added Products</h2>
            <div className="inv-form-section-icon">📋</div>
          </div>
          <div className="inv-form-table-wrapper">
            <table className="inv-form-products-table">
              <thead>
                <tr className="inv-form-table-header">
                  <th className="inv-form-table-header-cell">Product</th>
                  <th className="inv-form-table-header-cell">Qty</th>
                  <th className="inv-form-table-header-cell">SKU</th>
                  <th className="inv-form-table-header-cell">HSN/SAC</th>
                  <th className="inv-form-table-header-cell">Unit Price</th>
                  <th className="inv-form-table-header-cell">Tax %</th>
                  <th className="inv-form-table-header-cell">Total Amount</th>
                  <th className="inv-form-table-header-cell">Status</th>
                  <th className="inv-form-table-header-cell">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.products.map((p, i) => {
                  const baseAmount = p.quantity * (p.unit_price || 0)
                  const tax = p.tax || 0
                  const taxAmount =
                    invoiceData.gst_type === "IGST" ? (baseAmount * tax) / 100 : (baseAmount * tax) / 100
                  const totalAmount = baseAmount + taxAmount

                  return (
                    <tr key={i} className="inv-form-table-row">
                      <td className="inv-form-table-cell">{p.product_name}</td>
                      <td className="inv-form-table-cell">{p.quantity}</td>
                      <td className="inv-form-table-cell">{p.sku}</td>
                      <td className="inv-form-table-cell">{p.hsn_sac}</td>
                      <td className="inv-form-table-cell">₹{(p.unit_price || 0).toFixed(2)}</td>
                      <td className="inv-form-table-cell">{p.tax}%</td>
                      <td className="inv-form-table-cell">₹{totalAmount.toFixed(2)}</td>
                      <td className="inv-form-table-cell">{invoiceData.invoiceStatus || "N/A"}</td>
                      <td className="inv-form-table-cell">
                        <button onClick={() => removeProduct(i)} className="inv-form-remove-button">
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h3 className="section-heading">Payment Summary</h3>
      <hr className="section-divider" />
      <div className="inv-form-section">
        <div className="inv-form-summary-grid">
          <div className="inv-form-summary-left">
            <div className="inv-form-summary-item">
              <span className="inv-form-summary-label">Subtotal:</span>
              <span className="inv-form-summary-value">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="inv-form-summary-item">
              <span className="inv-form-summary-label">Discount ({discountPercentage}%):</span>
              <span className="inv-form-summary-value">₹{discountAmount.toFixed(2)}</span>
            </div>
            {getGstType(invoiceData.gst_number, invoiceData.clientGst) === "IGST" ? (
              <div className="inv-form-summary-item">
                <span className="inv-form-summary-label">IGST ({totalTax.maxRate}%):</span>
                <span className="inv-form-summary-value">₹{totalTax.igst.toFixed(2)}</span>
              </div>
            ) : (
              <>
                <div className="inv-form-summary-item">
                  <span className="inv-form-summary-label">CGST ({totalTax.maxRate / 2}%):</span>
                  <span className="inv-form-summary-value">₹{totalTax.cgst.toFixed(2)}</span>
                </div>
                <div className="inv-form-summary-item">
                  <span className="inv-form-summary-label">SGST ({totalTax.maxRate / 2}%):</span>
                  <span className="inv-form-summary-value">₹{totalTax.sgst.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="inv-form-summary-item inv-form-total-item">
              <span className="inv-form-total-label">Total Payable:</span>
              <span className="inv-form-total-value">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="inv-form-summary-right">
            <div className="inv-form-input-group">
              <label className="inv-form-input-label">Advance Payment</label>
              <input
                className="inv-form-input"
                type="number"
                placeholder="Advance Payment"
                value={advance}
                onChange={(e) => setAdvancePayment(Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="inv-form-input-group">
              <label className="inv-form-input-label">Received Amount</label>
              <input
                className="inv-form-input"
                type="number"
                placeholder="Received Amount"
                value={received}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    receivedAmount: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="inv-form-summary-item">
              <span className="inv-form-summary-label">Return Amount:</span>
              <span className="inv-form-summary-value">₹{returnAmount.toFixed(2)}</span>
            </div>
            <div className="inv-form-summary-item">
              <span className="inv-form-summary-label">Due Amount:</span>
              <span className="inv-form-summary-value">₹{dueAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="inv-form-action-buttons">
        <button onClick={handleBack} className="inv-form-back-button">
          ← Back
        </button>
        <button onClick={handleSaveInvoice} className="inv-form-save-invoice-button">
          Save Invoice
        </button>
      </div>
    </div>
  );
}