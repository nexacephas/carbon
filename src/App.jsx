import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import KPISection from "./components/KPISection/KPISection";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <Router>
      <div className="app-container">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

        <div className={`main-content ${isCollapsed ? "expanded" : ""}`}>
          <Navbar toggleSidebar={toggleSidebar} />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/energy" element={<KPISection />} />
            <Route path="/carbon" element={<Dashboard />} />
            <Route path="/reports" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
