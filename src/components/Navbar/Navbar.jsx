import React, { useState, useEffect } from "react";
import { FaBars, FaBell, FaSun, FaMoon } from "react-icons/fa";
import "./Navbar.css";

function Navbar({ toggleSidebar }) {
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New user signed up", read: false },
    { id: 2, text: "Server downtime reported", read: false },
    { id: 3, text: "Sales increased by 15%", read: true },
  ]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="navbar">
      <div className="left-section">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h1 className="navbar-logo">Dashboard</h1>
      </div>

      <div className="right-section">
        {/* Notification */}
        <div className="notification-wrapper">
          <button className="notification-btn" onClick={toggleDropdown}>
            <FaBell />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          {showDropdown && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <span>Notifications</span>
                <button className="mark-read-btn" onClick={markAllAsRead}>
                  Mark all read
                </button>
              </div>
              <ul className="notification-list">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`notification-item ${n.read ? "read" : "unread"}`}
                  >
                    {n.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
