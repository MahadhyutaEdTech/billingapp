import axios from 'axios';
import { API_BASE } from '../config/config';

const axiosInstance = axios.create({
    baseURL: API_BASE
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
