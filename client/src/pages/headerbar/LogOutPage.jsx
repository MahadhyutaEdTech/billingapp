import React from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import "../../css/modules/common/LogoutPage.css";

const clearAuthData = () => {
  // Clear all auth-related data
  const authKeys = [
    'authToken', 'userId', 'userEmail', 'username',
    'createdAt', 'updatedAt', 'user','userProfileImage' 
  ];
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  // Clear cookies
  document.cookie.split(";").forEach(cookie => {
    const [name] = cookie.trim().split("=");
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  });
};

const LogoutPage = ({ onLogout, onCancel }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthData();
    
    if (onLogout) {
      onLogout();
    }

    // Force navigation to home page
    window.location.href = '/home';
  };

  return (
    <div className="logout-overlay">
      <div className="logout-dialog">
        <h2>Logout</h2>
        <p>Are you sure you want to log out?</p>
        
        <div className="logout-buttons">
          <button className="logout-confirm" onClick={handleLogout}>
            Yes, Logout
          </button>
          <button className="logout-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;