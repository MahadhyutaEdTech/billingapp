import axiosInstance from '../utils/axiosConfig';
import { API_BASE } from "../config/config";

const organizationModel = {
  getOrganizations: async (token, page = 1, limit = 10) => {
    console.log("📤 Sending request to fetch organizations...");
    console.log("🔹 API URL:", `${API_BASE}/organization/get`);
    console.log("🔹 Params:", { page, limit });
    console.log("🔹 Token:", token);

    try {
      const response = await axiosInstance.get(`${API_BASE}/organization/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        params: { page, limit },
      });

      console.log("✅ Response received:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching organizations:", error);

      if (error.response) {
        console.error("🔴 Response Data:", error.response.data);
        console.error("🔴 Status Code:", error.response.status);
        console.error("🔴 Headers:", error.response.headers);
      } else if (error.request) {
        console.error("⚠️ No response received:", error.request);
      } else {
        console.error("⚠️ Request setup error:", error.message);
      }

      throw error.response ? error.response.data : { message: "Network error" };
    }
  },

  deleteOrganization: async (orgId, setOrganizations) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("❌ User not authenticated. Please log in.");
      return;
    }

    if (!window.confirm("⚠️ Are you sure you want to delete this organization?")) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`${API_BASE}/organization/delete?org_id=${orgId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      console.log("🗑️ Delete Response:", response.data);

      if (response.status === 200 && response.data.message.includes("deleted successfully")) {
        alert("✅ Organization deleted successfully!");
        
        // ✅ Correctly update organizations
        setOrganizations((prevOrgs) => prevOrgs.filter((org) => org.org_id !== orgId));
      } else {
        console.warn("⚠️ Unexpected API response:", response);
        alert("⚠️ Delete failed. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error deleting organization:", error);
      alert(`❌ Failed to delete organization: ${error.response?.data?.message || error.message}`);
    }
  },
};

export default organizationModel;
