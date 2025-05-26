import React from 'react';
import  { useState } from "react";
import SettingsPage from "./SettingsPage";
import {  FaSearch, FaPowerOff, FaCog, FaUserCircle } from "react-icons/fa";  // Import the settings and logout icons
import "../css/Header.css";
import UserProfilePage from "./UserProfilePage"; 
import LogoutPage from "./LogOutPage";

const Headerbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    localStorage.removeItem("createdAt");
    localStorage.removeItem("updatedAt");
    
    // Redirect to auth page with correct path
    window.location.href = "/auth";
  };
  return (
    <header className="header">
      <div className="header-left">
        <h1>My Billing App</h1>
      </div>
      <div className="header-right">
        <input type="text" placeholder="Search..." />
        <FaSearch />
           {/* Profile Icon linked to profile page */}
          
           <div className="icon-container">
          <button className="icon-button profile" onClick={() => setIsProfileOpen(true)}>
            <FaUserCircle className="header-icon" />
          </button>
          <UserProfilePage 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
          />
        </div>
        
        <div>
      <button  className="settings"onClick={() => setShowSettings(true)}><FaCog /></button>

      {showSettings && (
        <SettingsPage onClose={() => setShowSettings(false)} />
      )}
    </div>
        {/* Logout button */}
        
        <div>
      <button className='logout' onClick={() => setShowLogout(true)}><FaPowerOff /></button>

      {showLogout && (
        <LogoutPage onLogout={handleLogout} onCancel={() => setShowLogout(false)} />
      )}
    </div>
      </div>
    </header>
  );
};

export default Headerbar; 