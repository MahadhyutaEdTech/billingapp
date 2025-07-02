import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './css/modules/common/global.css';
import AppRoutes from "./routes/AppRoutes";
import { SidebarProvider } from './context/SidebarContext';
import AuthForm from './pages/AuthForm';
import ChangePassword from './components/ChangePassword';
import ProtectedRoutes from './routes/ProtectedRoutes';
import Homepage from './pages/homepage/Homepage';
import PrivacyPolicy from './pages/homepage/PrivacyPolicy';
import TermsOfService from './pages/homepage/TermsOfService';
import Contact from './pages/homepage/Contact';


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    return !!(token && userId);
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      setIsAuthenticated(!!(token && userId));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <SidebarProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/home" element={<Homepage />} />
        
        <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard/home" replace /> : <AuthForm />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoutes>
              <AppRoutes />
            </ProtectedRoutes>
          }
        />

        {/* Change Password Route */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoutes>
              <ChangePassword />
            </ProtectedRoutes>
          }
        />

        {/* Privacy Policy Route */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Terms of Service Route */}
        <Route path="/terms-of-service" element={<TermsOfService />} />

        {/* Contact Route */}
        <Route path="/contact" element={<Contact />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SidebarProvider>
  );
};

export default App;

