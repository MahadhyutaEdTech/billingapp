import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "../views/AuthForm";
import Homepage from "../views/Homepage";
import DashboardLayout from "../pages/DashboardLayout";
import CustomerList from "../views/CustomerList";
import CustomerForm from "../views/CustomerForm";
import CustomerViewForm from "../views/CustomerViewForm";
import CustomerUpdateDialog from "../views/CustomerUpdateDialog";
import InvoiceTable from "../views/InvoiceTable";
import InvoiceUpdateDialogbox from "../views/InvoiceUpdateDialogbox";
import Dashboardd from "../pages/Dashboardd";
import AddInvoicePage from "../views/AddInvoicePage";
import InvoicePdf from "../pages/InvoicePdf";
import ProductPage from "../pages/ProductPage";
import CreateProductPage from "../pages/CreateProductPage";
import UpdateProductPage from "../pages/UpdateProductPage";
import InventoryPage from "../pages/InventoryPage";
import ExpensesPage from "../pages/ExpensesPage";
import ProtectedRoutes from "./ProtectedRoutes";
import OrganizationPage from "../pages/OrganizationPage";
import ExpensesGraphPage from "../pages/ExpensesGraphPage";
import UserProfilePage from "../pages/UserProfilePage";
import AddOrganizationPage from "../pages/AddOragnizationPage";
import UpdateOrganizationPage from "../pages/UpdateOrganizationPage";
import ReportPage from "../pages/ReportPage";
import CreateExpensePage from "../pages/CreateExpensePage";
import UpdateExpensePage from "../pages/UpdateExpensePage";
import AddEmployee from "../pages/AddEmployee";
import AddProject from "../pages/AddProject";
import PurchasePage from "../pages/PurchasePage"
import UpdatePurchasePage from "../pages/UpdatePurchasePage";
import CreatePurchasePage from "../pages/CreatePurchasePage";


const AppRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("authToken"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("authToken"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/home" element={<Homepage />} />
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/dashboard/home" replace /> : <AuthForm />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard/*"
        element={
          isAuthenticated ? (
            <ProtectedRoutes>
              <DashboardLayout />
            </ProtectedRoutes>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      >
        <Route index element={<Navigate to="/dashboard/home" replace />} />
        <Route path="home" element={<Dashboardd />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="invoices" element={<InvoiceTable />} />
        <Route path="update-invoice" element={<InvoiceUpdateDialogbox />} />
        <Route path="createinvoice" element={<AddInvoicePage />} />
        <Route path="invoice/:invoiceId" element={<InvoicePdf />} />
        <Route path="product-page" element={<ProductPage />} />
        <Route path="createproduct" element={<CreateProductPage />} />
        <Route path="updateProduct" element={<UpdateProductPage />} />
        <Route path="inventory-page" element={<InventoryPage />} />
        <Route path="expenses-page" element={<ExpensesPage />} />
        <Route path="add-employee" element={<AddEmployee />} />
        <Route path="add-project" element={<AddProject/>} />
        <Route path="create-expense" element={<CreateExpensePage />} />
        <Route path="update-expense/:expenseId" element={<UpdateExpensePage />} />
        <Route path="customer-form" element={<CustomerForm />} />
        <Route path="customer-view" element={<CustomerViewForm />} />
        <Route path="update-customer" element={<CustomerUpdateDialog />} />
        <Route path="graph-expenses" element={<ExpensesGraphPage />} />
        <Route path="organization-page" element={<OrganizationPage />} />
        <Route path="profile-page" element={<UserProfilePage />} />
        <Route path="add-organization" element={<AddOrganizationPage />} />
        <Route path="update-organization/:orgId" element={<UpdateOrganizationPage />} />
        <Route path="purchase-page" element={<PurchasePage />} />
        <Route path="create-purchase" element={<CreatePurchasePage />} />
        <Route path="update-purchase" element={<UpdatePurchasePage />} />
        <Route path="report" element={<ReportPage />} />
      </Route>

      {/* Redirect all unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

