import axiosInstance from '../utils/axiosConfig';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/CreateProductPage.css";
import { API_BASE } from "../config/config";

export default function CreateProductPage() {
  const [product, setProduct] = useState({
    product_name: "",
    description: "",
    sku: "",
    hsn_sac: "",
    unit_price: "",
    cost_price: "",
    quantity: "",
    tax: "",
    product_type: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    console.log("Handle Change: ", e.target.name, "Value: ", e.target.value);
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data: ", product);
    setLoading(true);
    setError("");

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      navigate("/auth"); // Redirect to login page if no token
      return;
    }

    if (!product.product_name || !product.sku || !product.unit_price || !product.cost_price || !product.tax) {
      setError("Please fill all the required fields.");
      setLoading(false);
      console.log("Validation failed: Missing required fields");
      return;
    }

    const formData = new URLSearchParams();
    Object.entries(product).forEach(([key, value]) => formData.append(key, value));

    console.log("Form Data for API call: ", formData.toString());

    try {
      const response = await axiosInstance.post(`${API_BASE}/products/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Uses dynamic token
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("API Response: ", response);

      if (response.status === 200 || response.status === 201) {
        alert("✅ Product created successfully!");
        navigate("/product-page");
      } else {
        setError("Failed to create product. Please try again.");
        console.log("Failed to create product, status code: ", response.status);
      }
    } catch (error) {
      console.error("❌ Error creating product:", error);
      setError("An error occurred while creating the product.");
      console.log("Error details: ", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="create-product-container p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-semibold text-center">Create Product</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="input-field"
          type="text"
          name="product_name"
          placeholder="Product Name"
          onChange={handleChange}
          value={product.product_name || ""}  // Fallback to empty string if undefined
          required
        />
        <select
          className="input-field"
          name="product_type"
          onChange={handleChange}
          value={product.product_type || ""}
          required
        >
          <option value="">Select Product Service</option>
          <option value="Training">Training</option>
          <option value="Developing">Developing</option>
        </select>
        <input
          className="input-field"
          type="text"
          name="description"
          placeholder="Description"
          onChange={handleChange}
          value={product.description || ""}  // Fallback to empty string if undefined
        />
        <input
          className="input-field"
          type="text"
          name="sku"
          placeholder="SKU"
          onChange={handleChange}
          value={product.sku || ""}  // Fallback to empty string if undefined
          required
        />
        <input
          className="input-field"
          type="text"
          name="hsn_sac"
          placeholder="HSN/SAC"
          onChange={handleChange}
          value={product.hsn_sac || ""}  // Fallback to empty string if undefined
        />
        <input
          className="input-field"
          type="number"
          name="unit_price"
          placeholder="Unit Price"
          onChange={handleChange}
          value={product.unit_price || ""}  // Fallback to empty string if undefined
          required
        />
        <input
          className="input-field"
          type="number"
          name="cost_price"
          placeholder="MSP"
          onChange={handleChange}
          value={product.cost_price || ""}  // Fallback to empty string if undefined
          required
        />
         
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={product?.quantity || ""}
          onChange={handleChange}
          className="input-field"
        />
        <select
          className="input-field"
          name="tax"
          onChange={handleChange}
          value={product.tax || ""}
          required
        >
          <option value="">Select Tax Rate</option>
          <option value="2">2%</option>
          <option value="5">5%</option>
          <option value="9">9%</option>
          <option value="12">12%</option>
          <option value="18">18%</option>
          <option value="28">28%</option>
          <option value="40">40%</option>
        </select>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-between">
          <button
            className="btn-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Submit"}
          </button>
          <button
            className="btn-back"
            type="button"
            onClick={() => navigate("/dashboard/product-page")}
          >
            Back
          </button>

       
        </div>
      </form>
    </div>
  );
}
