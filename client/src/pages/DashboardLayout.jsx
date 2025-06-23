import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Headerbar from "./headerbar/Headerbar";
import "@/css/modules/common/Layout.css";
import { useSidebar } from '../context/SidebarContext';


const DashboardLayout = () => {
  const location = useLocation();
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="dashboard-container">
      <Sidebar /> 
      <div className={`main-layout ${isSidebarOpen ? 'sidebar-active' : ''}`}>
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


