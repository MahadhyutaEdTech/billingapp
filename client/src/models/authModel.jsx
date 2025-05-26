// handlers/authHandlers.js or directly in your component

import { loginUser, signupUser } from '../controllers/authController';

export const handleLogin = async (email, password, navigate, setError) => {
  try {
    await loginUser(email, password);
    window.dispatchEvent(new Event('storage'));
    navigate('/dashboard');
  } catch (error) {
    console.error('Login Error:', error);
    setError(error?.message || 'Login failed');
  }
};

export const handleSignup = async (userName, email, password, navigate, setMessage, setError) => {
  try {
    await signupUser(userName, email, password);
    window.dispatchEvent(new Event('storage'));
    navigate('/dashboard');
  } catch (error) {
    console.error('Signup Error:', error);
    setError(error?.message || 'Signup failed');
  }
};
