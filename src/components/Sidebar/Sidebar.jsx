import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBolt,
  FaCloud,
  FaChartBar,
  FaCog,
} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ isCollapsed, toggleSidebar }) {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/" },
    { name: "Parameter", icon: <FaBolt />, path: "/energy" },
    { name: "Carbon", icon: <FaCloud />, path: "/carbon" },
    { name: "Reports", icon: <FaChartBar />, path: "/reports" },
    { name: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  return (
    <>
      <div className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isCollapsed ? "" : "expanded"}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">⚡</div>
          {!isCollapsed && <h1 className="sidebar-title">PulseGrid</h1>}
        </div>

        <nav>
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li
                key={item.name}
                className={`sidebar-item ${activeItem === item.name ? "active" : ""}`}
                onClick={() => {
                  setActiveItem(item.name);
                  navigate(item.path);
                }}
                title={isCollapsed ? item.name : ""}
              >
                <div className="icon">{item.icon}</div>
                {!isCollapsed && <span className="item-label">{item.name}</span>}
              </li>
            ))}
          </ul>
        </nav>

        {!isCollapsed && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      </div>
    </>
  );
}

export default Sidebar;
