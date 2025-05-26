import React from "react";
import "../css/LogoutPage.css";
import { useNavigate } from "react-router-dom";

const LogoutPage = ({ onLogout, onCancel }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all authentication-related data
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    
    // Clear any cookies related to authentication
    document.cookie.split(";").forEach(cookie => {
      const [name] = cookie.trim().split("=");
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    });
    
    // Call the provided onLogout handler if it exists
    if (onLogout) {
      onLogout();
    }
    
    // Force a page reload before navigation to ensure all state is cleared
    // This helps prevent issues with React's in-memory state
    setTimeout(() => {
      navigate("/auth", { replace: true });
      window.location.reload();
    }, 100);
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