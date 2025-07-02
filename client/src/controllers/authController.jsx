// services/authService.js

import axiosInstance from '../utils/axiosConfig';
import { API_BASE } from '../config/config';

export const loginUser = async (email, password) => {
  const response = await axiosInstance.post(`${API_BASE}/auth/login`, { email, password });

  if (response.data?.accessToken) {
    const userData = response.data.userExist?.[0] || response.data.user || response.data;
    
    const authData = {
      authToken: response.data.accessToken,
      userId: userData.id || userData.userId,
      userEmail: userData.email,
      username: userData.userName
    };

    Object.entries(authData).forEach(([key, value]) => {
      if (value) localStorage.setItem(key, value);
    });
  }
  return response.data;
};

export const signupUser = async (userName, email, password) => {
  const response = await axiosInstance.post(`${API_BASE}/auth/register`, { userName, email, password });

  if (response.data.accessToken) {
    const userData = {
      authToken: response.data.accessToken,
      userId: response.data.user_id || response.data.userId,
      userEmail: response.data.email,
      username: response.data.userName,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at
    };

    Object.entries(userData).forEach(([key, value]) => {
      if (value) localStorage.setItem(key, value);
    });
  }

  return response.data;
};
