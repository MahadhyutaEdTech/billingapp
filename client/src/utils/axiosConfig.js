import axios from 'axios';
import { API_BASE } from '../config/config';

// Token management utility
class TokenManager {
  constructor() {
    this.refreshTimer = null;
    this.isRefreshing = false;
    this.failedQueue = [];
    this.setupAutoRefresh();
  }

  // Check if token is about to expire
  isTokenExpiring(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = (payload.exp * 1000) - Date.now();
      return expiresIn < 5 * 60 * 1000; // 5 minutes before expiry
    } catch (error) {
      return true; // If we can't decode, assume expired
    }
  }

  // Setup automatic token refresh
  setupAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      const token = localStorage.getItem('authToken');
      if (token && this.isTokenExpiring(token)) {
        this.refreshToken();
      }
    }, 2 * 60 * 1000); // Check every 2 minutes
  }

  // Refresh token function
  async refreshToken() {
    if (this.isRefreshing) {
      // If already refreshing, return a promise that resolves when refresh is done
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Attempting token refresh...');
      const response = await axiosInstance.post('/auth/refresh-token', {
        refreshToken
      });

      const { accessToken: newToken, refreshToken: newRefreshToken } = response.data;

      // Update stored tokens
      localStorage.setItem('authToken', newToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      // Process failed queue
      this.failedQueue.forEach(({ resolve }) => {
        resolve(newToken);
      });
      this.failedQueue = [];

      console.log('✅ Token refreshed successfully');
      return newToken;

    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // Process failed queue
      this.failedQueue.forEach(({ reject }) => {
        reject(error);
      });
      this.failedQueue = [];

      // Clear all auth data on refresh failure
      this.clearAuth();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  destroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }
}

// Create token manager instance
const tokenManager = new TokenManager();

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add this function after TokenManager class
const isValidSession = () => {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  if (!token || !userId) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

// Request interceptor with token regeneration
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    console.log('🔍 Request Debug:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      userId: userId,
      tokenLength: token ? token.length : 0
    });
    
    // Add abort controller for timeout
    const controller = new AbortController();
    config.signal = controller.signal;
    config.timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000);

    // Check if user is already logged in when trying to access login page
    if (config.url?.includes('/auth/login')) {
      if (isValidSession()) {
        // Redirect to dashboard if already logged in
        window.location.href = '/dashboard';
        return Promise.reject(new Error('Already authenticated'));
      }
      return config;
    }

    // Skip auth check for login, register, and refresh endpoints
    if (config.url?.includes('/auth/login') || 
        config.url?.includes('/auth/register') || 
        config.url?.includes('/auth/refresh-token')) {
      return config;
    }

    if (!token || !userId) {
      console.error('❌ Missing auth:', { hasToken: !!token, userId });
      // Instead of redirecting here, let the response interceptor handle it
      return Promise.reject(new Error('Authentication required'));
    }

    // Check if token needs refreshing before making request
    if (tokenManager.isTokenExpiring(token)) {
      try {
        console.log('🔄 Token expiring, refreshing before request...');
        const newToken = await tokenManager.refreshToken();
        config.headers['Authorization'] = `Bearer ${newToken}`;
        console.log('✅ Token refreshed successfully');
      } catch (error) {
        console.error('❌ Failed to refresh token:', error);
        // Remove immediate redirect and let response interceptor handle it
        return Promise.reject(new Error('Token refresh failed'));
      }
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Using existing token');
    }

    // Special handling for FormData (file uploads)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // Let browser set for FormData
      return config;
    }

    // Regular request handling
    if (!config.url?.includes('/auth/upload-image')) {
      config.params = { ...config.params, user_id: userId };
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Retry interceptor with exponential backoff
axiosInstance.interceptors.response.use(null, async (error) => {
  const { config } = error;

  // Clear timeout if it exists
  if (config?.timeoutId) {
    clearTimeout(config.timeoutId);
  }

  // Handle timeout specifically
  if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
    console.warn(`Request timeout for ${config.url}`, {
      timeout: config.timeout,
      retryCount: config.__retryCount
    });
  }

  if (!config || config.__isRetryRequest || config.data instanceof FormData) {
    return Promise.reject(error);
  }

  // Exponential backoff retry delay
  config.__retryCount = config.__retryCount || 0;
  config.retry = config.retry ?? 3;
  const backoffDelay = Math.min(1000 * Math.pow(2, config.__retryCount), 10000);

  if (config.__retryCount >= config.retry) {
    console.error('Max retries reached:', {
      url: config.url,
      attempts: config.__retryCount
    });
    return Promise.reject(error);
  }

  config.__retryCount += 1;
  config.__isRetryRequest = true;

  console.warn(`Retrying request (${config.__retryCount}/${config.retry}):`, {
    url: config.url,
    delay: backoffDelay
  });

  await new Promise(resolve => setTimeout(resolve, backoffDelay));
  return axiosInstance(config);
});

// Response interceptor modification
axiosInstance.interceptors.response.use(
  (response) => {
    // Clear timeout on success
    if (response.config.timeoutId) {
      clearTimeout(response.config.timeoutId);
    }

    // Handle login response with session validation
    if (response.config.url?.includes('/auth/login')) {
      const { accessToken, refreshToken, user } = response.data;
      
      if (accessToken && user) {
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('username', user.userName);
        
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        tokenManager.setupAutoRefresh();
        
        // Redirect to dashboard after successful login
        if (isValidSession()) {
          window.location.href = '/dashboard';
        }
      }
    }

    return response;
  },
  async (error) => {
    console.log('🔍 Response Error Debug:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      method: error.config?.method,
      hasRetry: error.config?._retry
    });
    
    const { response, config } = error;

    // Handle 401 errors with token refresh attempt
    if (response?.status === 401 && !config._retry) {
      config._retry = true;
      console.log('🔄 Attempting token refresh due to 401...');

      try {
        const newToken = await tokenManager.refreshToken();
        config.headers['Authorization'] = `Bearer ${newToken}`;
        console.log('✅ Token refresh successful, retrying request');
        return axiosInstance(config);
      } catch (refreshError) {
        console.error('❌ Token refresh failed on 401:', refreshError);
        tokenManager.clearAuth();
        // Only redirect if not on auth pages
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
        }
        return Promise.reject(new Error('Authentication expired'));
      }
    }

    // Clear timeout on error
    if (config?.timeoutId) {
      clearTimeout(config.timeoutId);
    }

    // Handle other authentication errors
    if (response?.status === 401) {
      console.warn('❌ Auth: Token expired and refresh failed');
      tokenManager.clearAuth();
      window.location.href = '/auth';
      return Promise.reject(new Error('Authentication required'));
    }

    // Log different types of errors
    if (response) {
      console.error('❌ Server Error:', {
        status: response.status,
        data: response.data,
        endpoint: config?.url,
        method: config?.method,
      });
    } else if (error.request) {
      console.error('❌ Network Error: No response received', {
        url: config?.url,
        method: config?.method,
        baseURL: config?.baseURL,
      });
    } else {
      console.error('❌ Request Configuration Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Handle page visibility for token refresh
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    const token = localStorage.getItem('authToken');
    if (token && tokenManager.isTokenExpiring(token)) {
      console.log('Page visible and token expiring, refreshing...');
      tokenManager.refreshToken().catch(error => {
        console.error('Failed to refresh token on page visibility:', error);
      });
    }
  }
});

// Handle browser close/open for token refresh
window.addEventListener('beforeunload', () => {
  localStorage.setItem('lastActivity', Date.now().toString());
});

window.addEventListener('load', () => {
  const lastActivity = localStorage.getItem('lastActivity');
  if (lastActivity) {
    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    
    // If inactive for more than 30 minutes, refresh token
    if (timeSinceLastActivity > 30 * 60 * 1000) {
      const token = localStorage.getItem('authToken');
      if (token) {
        console.log('Refreshing token after inactivity');
        tokenManager.refreshToken().catch(error => {
          console.error('Failed to refresh token after inactivity:', error);
        });
      }
    }
    localStorage.removeItem('lastActivity');
  }
});

// Cleanup on app unmount
window.addEventListener('beforeunload', () => {
  tokenManager.destroy();
});

export default axiosInstance;