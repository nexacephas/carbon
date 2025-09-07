import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBrain,
  FaHistory,
  FaCog,
} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ isCollapsed }) {
  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <h2 className="logo">{isCollapsed ? "EC" : "EnergyCarbon"}</h2>
      </div>

      <ul className="sidebar-menu">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
            <FaTachometerAlt className="icon" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/ai-prediction" className={({ isActive }) => isActive ? "active" : ""}>
            <FaBrain className="icon" />
            {!isCollapsed && <span>AI Prediction</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/history" className={({ isActive }) => isActive ? "active" : ""}>
            <FaHistory className="icon" />
            {!isCollapsed && <span>History</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={({ isActive }) => isActive ? "active" : ""}>
            <FaCog className="icon" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
