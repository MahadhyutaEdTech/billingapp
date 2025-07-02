import axiosInstance from '../utils/axiosConfig';
import axios from 'axios';

export const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    return !!(token && userId);
};

export const checkAuthStatus = () => {
    return isAuthenticated();
};

export const updateAuthState = (setIsAuthenticated) => {
    const authStatus = isAuthenticated();
    setIsAuthenticated(authStatus);
    return authStatus;
};

export const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    window.location.href = '/login';
};

export const getAuthToken = () => {
    return localStorage.getItem('authToken');
}; 