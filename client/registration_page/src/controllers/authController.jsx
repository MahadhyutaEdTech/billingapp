// services/authService.js

import axiosInstance from '../utils/axiosConfig';
import { API_BASE } from '../config/config';

export const loginUser = async (email, password) => {
  const response = await axiosInstance.post(`${API_BASE}/auth/login`, { email, password });

  if (response.data.token) {
    const { user, token } = response.data;
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', user.user_id);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('username', user.username);
    localStorage.setItem('createdAt', user.created_at);
    localStorage.setItem('updatedAt', user.updated_at);
  }

  return response.data;
};

export const signupUser = async (userName, email, password) => {
  const response = await axiosInstance.post(`${API_BASE}/auth/register`, { userName, email, password });

  if (response.data.token) {
    const { user, token } = response.data;
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', user.user_id);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('username', user.username);
    localStorage.setItem('createdAt', user.created_at);
    localStorage.setItem('updatedAt', user.updated_at);
  }

  return response.data;
};
