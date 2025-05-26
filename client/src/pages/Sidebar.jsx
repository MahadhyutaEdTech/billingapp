import { Link } from "react-router-dom";
import { FaHome, FaFileInvoiceDollar, FaShoppingCart, FaUser, FaSignOutAlt, FaUsers, FaChartBar, FaBoxOpen, FaMoneyBillWave,FaBuilding } from "react-icons/fa";
import "../css/Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li><Link to="/dashboard/home"><FaHome /> Dashboard</Link></li>
          <li><Link to="/dashboard/customers"><FaUsers /> Customers</Link></li>
          <li><Link to="/dashboard/invoices"><FaFileInvoiceDollar /> Invoices</Link></li>
          <li><Link to="/dashboard/product-page"><FaBoxOpen /> Products/Services</Link></li>
          <li><Link to="/dashboard/inventory-page"><FaBoxOpen /> Inventory</Link></li>
          <li><Link to="/dashboard/expenses-page"><FaMoneyBillWave /> Expenses</Link></li>
          <li><Link to="/dashboard/organization-page"><FaBuilding /> Organization</Link></li>
          <li><Link to="/dashboard/report"><FaChartBar /> Reports</Link></li>
          <li><Link to="/dashboard/purchase-page"><FaShoppingCart/> Purchase</Link></li>
          {/* 
  <li><Link to="/dashboard/profile"><FaUser /> Profile</Link></li>
  <li><Link to="/logout"><FaSignOutAlt /> Logout</Link></li>
*/}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
