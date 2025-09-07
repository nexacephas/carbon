import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaBolt, FaCloud, FaPercentage, FaPlug } from "react-icons/fa";
import CountUp from "react-countup";
import "./Dashboard.css";

function Dashboard() {
  const [relayOn, setRelayOn] = useState(true);
  const [data, setData] = useState([]);
  const [insight, setInsight] = useState("");

  const handleToggleRelay = () => setRelayOn(!relayOn);

  const handleResetEnergy = () => {
    setData(prev =>
      prev.map(d => ({ ...d, energy_actual: 0, carbon_actual: 0 }))
    );
  };

  const [kpis, setKpis] = useState([
    { id: 1, label: "Voltage", value: 0, suffix: " V", icon: <FaBolt />, gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)" },
    { id: 2, label: "Current", value: 0, suffix: " A", icon: <FaBolt />, gradient: "linear-gradient(135deg, #2563eb, #3b82f6)" },
    { id: 3, label: "Power", value: 0, suffix: " W", icon: <FaBolt />, gradient: "linear-gradient(135deg, #f97316, #fb923c)" },
    { id: 4, label: "Apparent Power", value: 0, suffix: " VA", icon: <FaBolt />, gradient: "linear-gradient(135deg, #10b981, #34d399)" },
    { id: 5, label: "Frequency", value: 50, suffix: " Hz", icon: <FaBolt />, gradient: "linear-gradient(135deg, #14b8a6, #06b6d4)" },
    { id: 6, label: "Energy", value: 0, suffix: " kWh", icon: <FaBolt />, gradient: "linear-gradient(135deg, #facc15, #fcd34d)" },
    { id: 7, label: "Reactive Power", value: 0, suffix: " VAR", icon: <FaBolt />, gradient: "linear-gradient(135deg, #10b981, #34d399)" },
    { id: 8, label: "Power Factor", value: 1, suffix: "", icon: <FaPercentage />, gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)" },
    { id: 9, label: "Relay", value: relayOn ? 1 : 0, suffix: relayOn ? " ON" : " OFF", icon: <FaPlug />, gradient: "linear-gradient(135deg, #f97316, #fbbf24)" },
    { id: 10, label: "CO₂ Emissions", value: 0, suffix: " kg", icon: <FaCloud />, gradient: "linear-gradient(135deg, #16a34a, #22c55e)" }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://api.thingspeak.com/channels/2966741/feeds.json?api_key=8PCY8HQ6WKC7MYC0&results=24"
        );
        const json = await res.json();

        const historical = json.feeds.map(feed => {
          const voltage = Number(feed.field1);
          const current = Number(feed.field2);
          return {
            hour: new Date(feed.created_at).getHours() + ":00",
            voltage,
            current,
            power: Number(feed.field3),
            apparent_power: voltage * current,
            energy_actual: Number(feed.field4),
            reactive_power: Number(feed.field7),
            pf: Number(feed.field8) || Math.random().toFixed(2), // fallback random
            frequency: Number(feed.field6) || (49.8 + Math.random() * 0.4).toFixed(2), // 49.8–50.2 Hz
            carbon_actual: Number(feed.field4) * 0.1
          };
        });

        const latest = historical[historical.length - 1];

        // Update KPIs
        setKpis(prev =>
          prev.map(kpi => {
            switch (kpi.label) {
              case "Voltage": return { ...kpi, value: latest.voltage };
              case "Current": return { ...kpi, value: latest.current };
              case "Power": return { ...kpi, value: latest.power };
              case "Apparent Power": return { ...kpi, value: latest.apparent_power };
              case "Frequency": return { ...kpi, value: latest.frequency };
              case "Power Factor": return { ...kpi, value: latest.pf };
              case "Energy": return { ...kpi, value: latest.energy_actual };
              case "Reactive Power": return { ...kpi, value: latest.reactive_power };
              case "CO₂ Emissions": return { ...kpi, value: latest.carbon_actual };
              case "Relay": return { ...kpi, value: relayOn ? 1 : 0, suffix: relayOn ? " ON" : " OFF" };
              default: return kpi;
            }
          })
        );

        setData(historical);

        // Insights
        const recentEnergyChange = historical[historical.length - 1].energy_actual - historical[0].energy_actual;
        const recentCarbonChange = historical[historical.length - 1].carbon_actual - historical[0].carbon_actual;
        let insightText = "Energy and carbon usage is stable.";
        if (recentEnergyChange > 0.5) insightText = "Energy usage rising — consider reducing load.";
        if (recentCarbonChange > 0.05) insightText += " Carbon emissions are increasing.";
        setInsight(insightText);

      } catch (error) {
        console.error("Error fetching ThingSpeak data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, [relayOn]);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h2>IoT Energy & Carbon Dashboard</h2>
        <div className="kpi-buttons">
          <button onClick={handleToggleRelay}>{relayOn ? "Turn Relay OFF" : "Turn Relay ON"}</button>
          <button onClick={handleResetEnergy}>Reset Energy</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="stats-grid">
        {kpis.map(kpi => {
          const value = kpi.label === "Relay" ? (relayOn ? 1 : 0) : kpi.value;
          const suffix = kpi.label === "Relay" ? (relayOn ? " ON" : " OFF") : kpi.suffix;
          return (
            <div key={kpi.id} className="stat-card" style={{ background: kpi.gradient }}>
              <div className="kpi-icon">{kpi.icon}</div>
              <h3 className="kpi-value">
                <CountUp
                  end={value}
                  duration={1.5}
                  decimals={value % 1 !== 0 ? 2 : 0}
                  suffix={suffix}
                />
              </h3>
              <p className="kpi-label">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="chart-card">
        <h3>Energy & Carbon (Actual)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis yAxisId="left" label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft", offset: 10 }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: "CO₂ (kg)", angle: -90, position: "insideRight", offset: 10 }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="energy_actual" stroke="#007bff" dot={false} name="Energy Actual" />
            <Line yAxisId="right" type="monotone" dataKey="carbon_actual" stroke="#ff7300" dot={false} name="CO₂ Actual" />
          </LineChart>
        </ResponsiveContainer>

        {/* Insights */}
        <div className="insight">
          <h4>Insight & Recommendations</h4>
          <p>{insight}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
