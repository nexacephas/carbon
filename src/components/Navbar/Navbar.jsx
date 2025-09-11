import React, { useContext } from "react";
import { FaSun, FaMoon, FaBars } from "react-icons/fa";
import { ThemeContext } from "../../components/ThemeContext";
import "./Navbar.css";

function Navbar({ toggleSidebar }) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Sidebar toggle button */}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h1 className="navbar-title">Welcome back 👋</h1>
      </div>

      <div className="navbar-right">
        {/* Theme toggle */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
