import axiosInstance from "../utils/axiosConfig";
import { API_BASE } from "../config/config";

export const getEmployees = async () => {
  try {
    console.log("Fetching employees from API...");
    const response = await axiosInstance.get(`${API_BASE}/emp/employees`);
    if (!response.data) {
      throw new Error("No data received from server");
    }

    // Transform and validate the data
    const employees = Array.isArray(response.data) ? response.data : [response.data];
    
    // Ensure all required fields are present and properly formatted
    const validatedEmployees = employees.map(employee => ({
      id: employee.id,
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      position: employee.position || '',
      department: employee.department || '',
      salary: employee.salary || '0',
      joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString() : null,
      address: employee.address || '',
      emergencyContact: employee.emergencyContact || ''
    }));

    //console.log("Processed employees data:", validatedEmployees);
    return validatedEmployees;

  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    
    if (error.response) {
      // Server responded with error
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response received from server');
    } else {
      // Other errors
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};

export const createEmployee = async (employeeData) => {
  const response = await axiosInstance.post(
    `${API_BASE}/emp/employees`,
    employeeData
  );
  return response.data;
};

export const getEmployeeById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/emp/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get employee error:", error);
    throw new Error(error.response?.data?.message || 'Failed to fetch employee');
  }
};

export const updateEmployee = async (id, data) => {
  try {
    if (!id || isNaN(Number(id))) {
      throw new Error('Invalid employee ID');
    }

    // Format data for server
    const formattedData = {
      ...data,
      id: parseInt(id),
      joinDate: data.joinDate ? data.joinDate.split('T')[0] : null, // Format as YYYY-MM-DD
      salary: data.salary ? parseFloat(data.salary).toFixed(2) : '0.00'
    };

    //console.log('Sending formatted data:', formattedData);

    const response = await axiosInstance.put(
      `${API_BASE}/emp/employees/${id}`,
      formattedData,
      { validateStatus: (status) => status >= 200 && status < 300 }
    );

    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid data format');
    }
    console.error('Update employee error:', error);
    throw new Error('Failed to update employee: ' + (error.message || 'Unknown error'));
  }
};

export const deleteEmployee = async (employeeId) => {
  const response = await axiosInstance.delete(
    `${API_BASE}/emp/employees/${employeeId}`
  );
  return response.data;
};
