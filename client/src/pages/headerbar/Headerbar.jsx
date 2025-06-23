import React from 'react';
import { useState, useEffect } from "react";
import SettingsPage from "./SettingsPage";
import { FaSearch, FaPowerOff, FaCog, FaUserCircle, FaMoon, FaSun } from "react-icons/fa";
import "../../css/modules/common/Header.css";
import UserProfilePage from "./UserProfilePage"; 
import LogoutPage from "./LogOutPage";

const Headerbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const savedMode = localStorage.getItem('theme');
    if (savedMode) {
      return savedMode === 'dark';
    }
    // If no saved preference, check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme class to root element on mount and when isDarkMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    localStorage.removeItem("createdAt");
    localStorage.removeItem("updatedAt");
    localStorage.removeItem("theme"); // Clear theme preference on logout
    
    // Redirect to auth page with correct path
    window.location.href = "/auth";
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>My Billing App</h1>
      </div>
      <div className="header-right">
        {/*<input type="text" placeholder="Search..." />
        <FaSearch />*/}
           {/* Profile Icon linked to profile page */}
          
           <div className="icon-container">
          <button className="icon-button profile" onClick={() => setIsProfileOpen(true)} data-tooltip="Profile">
            <FaUserCircle className="header-icon" />
          </button>
          <UserProfilePage 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
          />
        </div>
        
        {/* Dark Mode Toggle */}
        <div className="icon-container">
          <button className="icon-button dark-mode-toggle" onClick={toggleDarkMode} data-tooltip={isDarkMode ? "Light Mode" : "Dark Mode"}>
            {isDarkMode ? <FaSun className="header-icon" /> : <FaMoon className="header-icon" />}
          </button>
        </div>

        {/*<div>
      <button  className="settings" onClick={() => setShowSettings(true)} data-tooltip="Settings"><FaCog /></button>

      {showSettings && (
        <SettingsPage onClose={() => setShowSettings(false)} />
      )}
    </div>*/}
        {/* Logout button */}
        
        <div>
      <button className='logout' onClick={() => setShowLogout(true)} data-tooltip="Logout"><FaPowerOff /></button>

      {showLogout && (
        <LogoutPage onLogout={handleLogout} onCancel={() => setShowLogout(false)} />
      )}
    </div>
      </div>
    </header>
  );
};

export default Headerbar; 