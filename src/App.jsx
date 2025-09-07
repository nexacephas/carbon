import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./components/Dashboard/Dashboard";
import Prediction from "./components/Prediction/Prediction";
import History from "./components/History/History";
import "./index.css"; // global + layout styles

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar (fixed) */}
        <Sidebar isCollapsed={isCollapsed} />

        {/* Main content (shifts when sidebar collapses) */}
        <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
          <Navbar toggleSidebar={toggleSidebar} />

          <div className="page-wrapper">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ai-prediction" element={<Prediction />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<h2>Settings</h2>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
