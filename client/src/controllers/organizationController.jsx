import organizationModel from "../models/organizationModel";

const organizationController = {
  fetchOrganizations: async (navigate, page = 1, limit = 10) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn("No authentication token found. Redirecting to login.");
      navigate("/login");
      return [];
    }

    try {
      console.log("📤 Fetching organizations...");
      console.log(`🔹 Page: ${page}, Limit: ${limit}`);

      const data = await organizationModel.getOrganizations(token, page, limit);

      console.log("✅ Data received:", data);
      return data;

    } catch (error) {
      console.error("❌ Error fetching organizations:", error);

      if (error.response?.status === 401) {
        console.warn("🔑 Token expired. Redirecting to login.");
        localStorage.removeItem("authToken");
        navigate("/login");
      }

      throw new Error(error.response?.data?.message || "Network error occurred");
    }
  },
};

export default organizationController;
