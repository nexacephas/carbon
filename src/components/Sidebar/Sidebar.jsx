import React from "react";
import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaBrain, FaHistory, FaCog } from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ isCollapsed, isMobileOpen }) {
  return (
    <aside
      className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
        isMobileOpen ? "active" : ""
      }`}
    >
      <div className="sidebar-header">
        <h2 className="logo">{isCollapsed ? "CD" : "Carbon Dashboard"}</h2>
      </div>

      <ul className="sidebar-menu">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            <FaTachometerAlt className="icon" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/ai-prediction"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaBrain className="icon" />
            {!isCollapsed && <span>AI Prediction</span>}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/history"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaHistory className="icon" />
            {!isCollapsed && <span>History</span>}
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
