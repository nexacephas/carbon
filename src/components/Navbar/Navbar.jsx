import React, { useContext } from "react";
import { FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";
import { ThemeContext } from "../../components/ThemeContext";
import "./Navbar.css";

function Navbar({ toggleSidebar, isCollapsed }) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">Welcome back 👋</h1>
      </div>

      <div className="navbar-right">
        {/* Sidebar Toggle */}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>

        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
