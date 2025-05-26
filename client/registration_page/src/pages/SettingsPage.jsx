import React, { useState } from "react";
import "../css/SettingsPage.css";

export default function SettingsPage({ onClose }) {
  // Initialize with actual current state instead of checking localStorage
  const [darkMode, setDarkMode] = useState(
    document.body.classList.contains('dark-mode')
  );

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
  };

  return (
    <div className={`settings-overlay ${darkMode ? "dark-mode" : ""}`}>
      <div className={`settings-dialog ${darkMode ? "dark-mode" : ""}`}>
        <h2 className="settings-title">Settings</h2>

        {/* Theme Section */}
        <div className="settings-section">
          <h3>Theme</h3>

          <div className="toggle-container">
            <span>Dark Mode</span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
            />
          </div>
        </div>

        {/* Close Button */}
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
