import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import './Sidebar.css'; // Ensure to include your CSS styles

const Sidebar = ({ sidebar }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h3 className="brand">
          <i className="fa-solid fa-cogs"></i>
          <span>Drilling Inventory</span>
        </h3>
        <div className="toggle-btn" onClick={toggleSidebar}>
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} toggle-icon`}></i>
        </div>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active-link' : ''}`}>
            <span className="nav-icon"><i className="fa-solid fa-chart-line"></i></span>
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/toolslist" className={`nav-item ${isActive('/toolslist') ? 'active-link' : ''}`}>
            <span className="nav-icon"><i className="fas fa-wrench"></i></span>
            <span>Tools List</span>
          </Link>
        </li>
        <li>
          <Link to="/tracking" className={`nav-item ${isActive('/tracking') ? 'active-link' : ''}`}>
            <span className="nav-icon"><i className="fa-solid fa-location-crosshairs"></i></span>
            <span>Tracking</span>
          </Link>
        </li>
        <li>
          <Link to="/history" className={`nav-item ${isActive('/history') ? 'active-link' : ''}`}>
            <span className="nav-icon"><i className="fas fa-clock"></i></span>
            <span>History</span>
          </Link>
        </li>
        <li>
          <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active-link' : ''}`}>
            <span className="nav-icon"><i className="fas fa-user"></i></span>
            <span>Profile</span>
          </Link>
        </li>
      </ul>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon"><i className="fas fa-sign-out-alt"></i></span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
