
import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Headerbar from "./Headerbar";
import "../css/Layout.css";

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="dashboard-container">
      <Sidebar /> 
      <div className="main-layout">
        <Headerbar />
        <main className="dashboard-content">
          {/* Redirect to Dashboardd if no child route is selected */}
          {location.pathname === "/dashboard" && <Navigate to="/dashboard/home" replace />}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;


