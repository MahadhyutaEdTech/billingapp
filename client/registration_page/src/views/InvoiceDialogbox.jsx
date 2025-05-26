import { useState, useEffect } from "react";
import axios from "axios";
import "../css/InvoiceDialogbox.css";
import { API_BASE } from "../config/config";

const InvoiceDialogbox = ({ onClose }) => {
  const [customers, setCustomers] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [taxTypes, setTaxTypes] = useState([]);
  const [statuses] = useState(["Pending", "Paid", "Overdue"]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedTaxType, setSelectedTaxType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [amount, setAmount] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("❌ No authentication token found!");
      alert("⚠️ Authentication error. Please log in.");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`, // ✅ Uses dynamic token
      "ngrok-skip-browser-warning": "true",
    };

    axios.get(`${API_BASE}/customer/allCustomerData`, { headers })
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error("❌ Error fetching customers:", err));

    axios.get(`${API_BASE}/taxes/get`, { headers })
      .then((res) => setTaxTypes(res.data))
      .catch((err) => console.error("❌ Error fetching tax types:", err));

    axios.get(`${API_BASE}/products/get`, { headers })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("❌ Error fetching products:", err));
  }, []);

  const handleCustomerChange = (e) => {
    const customerId = Number(e.target.value);
    setSelectedCustomer(customerId);

    const customer = customers.find((cust) => cust.customer_id === customerId);
    if (customer) {
      setCustomerDetails(customer);
      setPhone(customer.phone || "");
      setEmail(customer.email || "");
      setAddress(customer.address || "");
      setCity(customer.city || "");
    } else {
      setCustomerDetails(null);
      setPhone("");
      setEmail("");
      setAddress("");
      setCity("");
    }
  };

  const handleProductChange = (productId) => {
    if (!productId) return;

    const numericProductId = Number(productId);
    const product = products.find((p) => p.product_id === numericProductId);
    if (!product) return;

    if (selectedProducts.some((p) => p.product_id === numericProductId)) return;

    const updatedProducts = [...selectedProducts, { ...product, quantity: 1 }];
    setSelectedProducts(updatedProducts);
    recalculateTotals(updatedProducts, selectedTaxType);
  };

  const handleQuantityChange = (productId, quantity) => {
    const updatedProducts = selectedProducts.map((p) =>
      p.product_id === productId ? { ...p, quantity: parseInt(quantity) || 1 } : p
    );
    setSelectedProducts(updatedProducts);
    recalculateTotals(updatedProducts, selectedTaxType);
  };

  const recalculateTotals = (productsList, taxType) => {
    const totalAmount = productsList.reduce((sum, prod) => sum + (prod.cost_price * (prod.quantity || 1)), 0);
    const totalQty = productsList.reduce((sum, prod) => sum + (prod.quantity || 1), 0);
    setAmount(totalAmount);
    setTotalQuantity(totalQty);
    recalculateTax(totalAmount, taxType);
  };

  const recalculateTax = (totalAmount, taxType) => {
    const selectedTax = taxTypes.find((tax) => tax.tax_type === taxType);
    if (selectedTax) {
      const taxRate = parseFloat(selectedTax.tax_rate);
      setTax((totalAmount * taxRate) / 100);
    } else {
      setTax(0);
    }
  };

  const handleTaxTypeChange = (e) => {
    setSelectedTaxType(e.target.value);
    recalculateTax(amount, e.target.value);
  };

  const handleRemoveProduct = (productId) => {
    const updatedProducts = selectedProducts.filter((p) => p.product_id !== productId);
    setSelectedProducts(updatedProducts);
    recalculateTotals(updatedProducts, selectedTaxType);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken"); // ✅ Retrieve token dynamically

    if (!token) {
      alert("⚠️ Authentication error: No token found. Please log in.");
      console.error("❌ No token found in localStorage!");
      return;
    }

    const invoiceData = {
      customer_id: selectedCustomer,
      invoice_date: new Date().toISOString().split("T")[0],
      due_date: dueDate,
      total_amount: amount,
      tax_amount: tax,
      total_quantity: totalQuantity,
      status: selectedStatus.toLowerCase(),
      created_at: new Date().toISOString().split("T")[0],
      products: selectedProducts.map((p) => ({
        product_id: p.product_id,
        quantity: p.quantity,
        price: parseFloat(p.cost_price),
      })),
    };

    console.log("📡 Sending Invoice Data:", JSON.stringify(invoiceData, null, 2));

    try {
      const response = await axios.post(`${API_BASE}/invoice/create`, invoiceData, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Uses dynamic token
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      console.log("✅ API Response:", response.data);
      alert("✅ Invoice Created Successfully!");
      onClose();
    } catch (error) {
      console.error("❌ Error creating invoice:", error.response?.data || error);
      alert(`❌ Failed to create invoice: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Invoice Form</h2>
        <button className="close-btn" onClick={onClose}>X</button>
        <div className="form-grid">
        <div className="form-group">
          <label>Name</label>
          <select onChange={handleCustomerChange} value={selectedCustomer}>

            <option value="">Select Customer</option>
            {customers.map((cust) => (
              <option key={cust.customer_id} value={cust.customer_id}>
                {cust.first_name} {cust.last_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="text" value={email } readOnly />
        </div>
 {/* phone no  & city */}
        <div className="form-group">
          <label>Phone No.</label>
          <input type="text" value={phone} readOnly />
        </div>

        <div className="form-group">
          <label>City</label>
          <input type="text" value={city} readOnly />
        </div>
         {/* Tax Type & Tax */}

 {/* product container*/}
        <div className="products-container form-group">
  <label>Products</label>
  <select onChange={(e) => handleProductChange(e.target.value)}>
    <option value="">Select a Product</option>
    {products
      .filter((product) => !selectedProducts.some((p) => p.product_id === product.product_id)) // Hide already selected products
      .map((product) => (
        <option key={product.product_id} value={product.product_id}>
          {product.product_name} - ${product.cost_price}
        </option>
      ))}
  </select>
</div>


{/* Display selected products with quantity inputs and remove option */}
{selectedProducts.length > 0 && (
  <div className="selected-products">
    {selectedProducts.map((product) => (
      <div key={product.product_id} className="product-item">
        <span>{product.product_name} - ₹{product.cost_price}</span>
        <input
          type="number"
          min="1"
          value={product.quantity || 1}
          onChange={(e) => handleQuantityChange(product.product_id, e.target.value)}
        />
        <button className="remove-btn" onClick={() => handleRemoveProduct(product.product_id)}>❌</button>
      </div>
    ))}
  </div>
)} 

 {/* Tax Type & Tax */}
        <div className="form-group">
          <label>Tax Type</label>
          <select onChange={handleTaxTypeChange} value={selectedTaxType}>
            <option value="">Select Tax Type</option>
            {taxTypes.map((tax) => (
              <option key={tax.tax_type} value={tax.tax_type}>
                {tax.tax_type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tax</label>
          <input type="text" value={tax.toFixed(2)} readOnly />
        </div>

 {/*Total Quantity and total amount */}
        <div className="form-group">
          <label>Total Quantity</label>
          <input type="text" value={totalQuantity} readOnly />
        </div>

        <div className="form-group">
          <label>Total Amount</label>
          <input type="text" value={amount.toFixed(2)} readOnly />
        </div>

 {/* Status and due date */}
        <div className="form-group">
          <label>Status</label>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            {statuses.map((status, index) => (
              <option key={index} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default InvoiceDialogbox;
