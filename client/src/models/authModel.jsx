import axiosInstance from '../utils/axiosConfig';
import { API_BASE } from '../config/config';

// Add token to request headers
const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create axios instance with interceptors
const api = axiosInstance;

export const handleLogin = async (email, password, navigate, setError, setLoading) => {
    try {
        setLoading(true);
        const response = await api.post('/auth/login', { email, password });
        const { accessToken, refreshToken, user } = response.data;

        // Store tokens and user data
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('username', user.userName);

        // Trigger storage event to update auth state
        window.dispatchEvent(new Event('storage'));
        
        // Small delay to ensure state is updated
        setTimeout(() => {
            navigate('/dashboard');
        }, 100);
        
        return true;
    } catch (error) {
        setError(error.response?.data?.message || 'Login failed');
        return false;
    } finally {
        setLoading(false);
    }
};

export const handleSignup = async (userName, email, password, authCode, navigate, setMessage, setError) => {
    try {
        if (!userName || userName.length < 2) {
            setError('Name must be at least 2 characters long');
            return false;
        }

        const response = await api.post('/auth/register', {
            userName,
            email,
            password,
            authCode
        });

        setMessage('Registration successful! Please check your email for verification.');
        return true;
    } catch (error) {
        setError(error.response?.data?.message || 'Registration failed');
        return false;
    }
};

export const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
};

export const requestPasswordReset = async (email, setMessage, setError) => {
    try {
        await api.post('/auth/request-password-reset', { email });
        setMessage('Password reset instructions sent to your email');
        return true;
    } catch (error) {
        setError(error.response?.data?.message || 'Failed to request password reset');
        return false;
    }
};

export const resetPassword = async (token, newPassword, setMessage, setError) => {
    try {
        await api.post('/auth/reset-password', { token, newPassword });
        setMessage('Password reset successful');
        return true;
    } catch (error) {
        setError(error.response?.data?.message || 'Failed to reset password');
        return false;
    }
};
