import axiosInstance from '../utils/axiosConfig';
import { API_BASE } from '../config/config';
import { createReport } from '../models/reportModel';

export const fetchReports = async (reportType) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axiosInstance.get(`${API_BASE}/api/reports`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      params: { type: reportType }
    });

    console.log('Raw API Response:', response.data); // Debug log

    if (response.data?.success && Array.isArray(response.data.data)) {
      const mappedData = response.data.data.map(item => {
        console.log('Processing item:', item); // Debug log
        return createReport(item);
      });
      console.log('Mapped Data:', mappedData); // Debug log
      return mappedData;
    }
    throw new Error("Invalid data format received");
  } catch (error) {
    console.error("Error fetching report:", error);
    throw error;
  }
};
