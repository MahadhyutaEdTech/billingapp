import React, { useState } from "react";
import "../../css/modules/common/SettingsPage.css";

export default function SettingsPage({ onClose }) {
  // Initialize with actual current state instead of checking localStorage
  

  

  return (
    <div className={`settings-overlay ${darkMode ? "dark-mode" : ""}`}>
      <div className={`settings-dialog ${darkMode ? "dark-mode" : ""}`}>
        <h2 className="settings-title">Settings</h2>

        {/* Theme Section */}
        

        {/* Close Icon */}
        <div className="close-icon" onClick={onClose}></div>
      </div>
    </div>
  );
}
