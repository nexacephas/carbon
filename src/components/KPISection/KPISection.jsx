import React, { useState } from "react";
import {
  FaBolt,
  FaCloud,
  FaDollarSign,
  FaPercentage,
  FaPlug,
} from "react-icons/fa";
import CountUp from "react-countup";
import "./KPISection.css";

function KPISection() {
  const [relayOn, setRelayOn] = useState(true);
  const [energy, setEnergy] = useState(0.28);

  const handleToggleRelay = () => setRelayOn(!relayOn);
  const handleResetEnergy = () => setEnergy(0);

  const sections = [
    {
      title: "Electrical",
      items: [
        { id: 1, label: "Voltage", value: 203.0, suffix: " V", icon: <FaBolt />, gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)" },
        { id: 2, label: "Current", value: 0.60, suffix: " A", icon: <FaBolt />, gradient: "linear-gradient(135deg, #2563eb, #3b82f6)" },
        { id: 3, label: "Frequency", value: 50.2, suffix: " Hz", icon: <FaBolt />, gradient: "linear-gradient(135deg, #14b8a6, #06b6d4)" },
        { id: 4, label: "Power Factor", value: 0.99, suffix: "", icon: <FaPercentage />, gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)" },
      ],
    },
    {
      title: "Power",
      items: [
        { id: 5, label: "Power", value: 119.4, suffix: " W", icon: <FaBolt />, gradient: "linear-gradient(135deg, #f97316, #fb923c)" },
        { id: 6, label: "Apparent Power", value: 121.0, suffix: " VA", icon: <FaBolt />, gradient: "linear-gradient(135deg, #f43f5e, #f87171)" },
        { id: 7, label: "Reactive Power", value: 17.1, suffix: " VAR", icon: <FaBolt />, gradient: "linear-gradient(135deg, #10b981, #34d399)" },
        { id: 8, label: "Energy", value: energy, suffix: " kWh", icon: <FaBolt />, gradient: "linear-gradient(135deg, #facc15, #fcd34d)" },
        { id: 9, label: "Cutoff Voltage", value: 245, suffix: " V", icon: <FaBolt />, gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)" },
        { id: 10, label: "Cutoff Energy", value: 10.0, suffix: " kWh", icon: <FaBolt />, gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
      ],
    },
    {
      title: "Emissions",
      items: [
        { id: 11, label: "CO₂ Emissions", value: 0.14, suffix: " kg", icon: <FaCloud />, gradient: "linear-gradient(135deg, #16a34a, #22c55e)" },
        { id: 12, label: "Emission Factor", value: 0.5, suffix: " kg/kWh", icon: <FaCloud />, gradient: "linear-gradient(135deg, #14b8a6, #06b6d4)" },
      ],
    },
    {
      title: "Relay",
      items: [
        { id: 13, label: "Relay", value: relayOn ? 1 : 0, suffix: relayOn ? " ON" : " OFF", icon: <FaPlug />, gradient: "linear-gradient(135deg, #f97316, #fbbf24)" },
      ],
    },
  ];

  return (
    <div className="kpi-section-wrapper">
      <div className="kpi-buttons">
        <button onClick={handleToggleRelay}>
          {relayOn ? "Turn Relay OFF" : "Turn Relay ON"}
        </button>
        <button onClick={handleResetEnergy}>Reset Energy</button>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="kpi-section-group">
          <h2 className="section-title">{section.title}</h2>
          <div className="kpi-section">
            {section.items.map((kpi) => (
              <div
                key={kpi.id}
                className="kpi-card"
                style={{ background: kpi.gradient }}
              >
                <div className="kpi-icon">{kpi.icon}</div>
                <div className="kpi-text">
                  <h3 className="kpi-value">
                    <CountUp
                      end={kpi.value}
                      duration={2}
                      decimals={kpi.value % 1 !== 0 ? 2 : 0}
                      prefix={kpi.prefix || ""}
                      suffix={kpi.suffix || ""}
                    />
                  </h3>
                  <p className="kpi-label">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default KPISection;
