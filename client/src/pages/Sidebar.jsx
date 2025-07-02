import { NavLink } from "react-router-dom"; // Changed from Link to NavLink
import { 
  FaHome, 
  FaFileInvoiceDollar, 
  FaShoppingCart, 
  FaUser, 
  FaSignOutAlt, 
  FaUsers, 
  FaChartBar, 
  FaBoxOpen, 
  FaMoneyBillWave, 
  FaBuilding, 
  FaBars, 
  FaUserTie, 
  FaTasks,
  FaFileAlt
} from "react-icons/fa";
import { MdInventory } from 'react-icons/md';
import "@/css/modules/common/Sidebar.css";
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const handleLinkClick = () => {
    // Close sidebar on link click only if it's currently open and on mobile
    if (window.innerWidth <= 768 && isSidebarOpen) {
      toggleSidebar();
    }
  };

  const handleToggleClick = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up to document listener
    toggleSidebar();
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={handleToggleClick}>
        <FaBars />
      </button>
      <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <nav>
          <ul>
            <li>
              <NavLink 
                onClick={handleLinkClick} 
                to="/dashboard/home"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <FaHome /> <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                onClick={handleLinkClick} 
                to="/dashboard/customers"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <FaUsers /> <span>Customers</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                onClick={handleLinkClick} 
                to="/dashboard/invoices"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <FaFileInvoiceDollar /> <span>Invoices</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                onClick={handleLinkClick} 
                to="/dashboard/quotations"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <FaFileAlt /> <span>Quotations</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                onClick={handleLinkClick} 
                to="/dashboard/product-page"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <FaBoxOpen /> <span>Products/Services</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                onClick={handleLinkClick} 
                to="/dashboard/inventory-page"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <MdInventory /> <span>Inventory</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                onClick={handleLinkClick} 
                to="/dashboard/purchase-page"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <FaShoppingCart /> <span>Purchase</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                onClick={handleLinkClick} 
                to="/dashboard/organization-page"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <FaBuilding /> <span>Organization</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                onClick={handleLinkClick} 
                to="/dashboard/expenses-page"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <FaMoneyBillWave /> <span>Expenses</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                onClick={handleLinkClick} 
                to="/dashboard/employee-page"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <FaUserTie /> <span>Employee</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                onClick={handleLinkClick} 
                to="/dashboard/project-page"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <FaTasks /> <span>Project</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                onClick={handleLinkClick} 
                to="/dashboard/report"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <FaChartBar /> <span>Reports</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;