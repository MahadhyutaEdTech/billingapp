export class Product {
  product_id = "N/A";
  product_name = "N/A";
  description = "N/A";
  sku = "N/A";
  hsn_sac = "N/A";
  unit_price = "0.00";
  cost_price = "0.00";
  tax = "0.00";
  quantity = 0;
  current_stock = 0;
  product_type = "N/A";

  static fromData(data) {
    if (!data || typeof data !== "object") {
      console.error("Invalid data passed to Product.fromData:", data);
      return new Product(); // Return a default product object
    }

    if (Array.isArray(data)) {
      console.error("Expected an object but received an array:", data);
      return new Product();
    }

    const product = new Product();
    product.product_id = data.product_id || "N/A";
    product.product_name = data.product_name || "N/A";
    product.description = data.description || "N/A";
    product.sku = data.sku || "N/A";
    product.hsn_sac = data.hsn_sac || "N/A";
    product.unit_price = isNaN(parseFloat(data.unit_price)) ? "0.00" : parseFloat(data.unit_price).toFixed(2);
    product.cost_price = isNaN(parseFloat(data.cost_price)) ? "0.00" : parseFloat(data.cost_price).toFixed(2);
    product.tax = isNaN(parseFloat(data.tax)) ? "0.00" : parseFloat(data.tax).toFixed(2);
    product.quantity = Math.max(0, data.quantity || 0);
    product.current_stock = Math.max(0, data.current_stock || 0);
    product.product_type = data.product_type || "N/A";
    return product;
  }
}
