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
      prev.map(d => ({ ...d, energy: 0, carbon: 0 }))
    );
  };

  const [kpis, setKpis] = useState([
    { id: 1, label: "Voltage", value: 0, suffix: " V", icon: <FaBolt />, gradient: "linear-gradient(135deg,#3b82f6,#60a5fa)" },
    { id: 2, label: "Current", value: 0, suffix: " A", icon: <FaBolt />, gradient: "linear-gradient(135deg,#2563eb,#3b82f6)" },
    { id: 3, label: "Power", value: 0, suffix: " W", icon: <FaBolt />, gradient: "linear-gradient(135deg,#f97316,#fb923c)" },
    { id: 4, label: "Energy", value: 0, suffix: " kWh", icon: <FaBolt />, gradient: "linear-gradient(135deg,#facc15,#fcd34d)" },
    { id: 5, label: "Frequency", value: 0, suffix: " Hz", icon: <FaBolt />, gradient: "linear-gradient(135deg,#14b8a6,#06b6d4)" },
    { id: 6, label: "Power Factor", value: 0, suffix: "", icon: <FaPercentage />, gradient: "linear-gradient(135deg,#8b5cf6,#a78bfa)" },
    { id: 7, label: "Apparent Power", value: 0, suffix: " VA", icon: <FaBolt />, gradient: "linear-gradient(135deg,#10b981,#34d399)" },
    { id: 8, label: "Reactive Power", value: 0, suffix: " VAR", icon: <FaBolt />, gradient: "linear-gradient(135deg,#f87171,#fca5a5)" },
    { id: 9, label: "Relay", value: 1, suffix: " ON", icon: <FaPlug />, gradient: "linear-gradient(135deg,#f97316,#fbbf24)" },
    { id: 10, label: "CO₂ Emissions", value: 0, suffix: " kg", icon: <FaCloud />, gradient: "linear-gradient(135deg,#16a34a,#22c55e)" },
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
          const power = Number(feed.field3);
          const energy = Number(feed.field4);
          const frequency = Number(feed.field5);
          const power_factor = Number(feed.field6);
          const apparent_power = Number(feed.field7);
          const reactive_power = Number(feed.field8);

          return {
            hour: new Date(feed.created_at).getHours() + ":00",
            voltage,
            current,
            power,
            energy,
            frequency,
            power_factor,
            apparent_power,
            reactive_power,
            carbon: energy * 0.1,
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
              case "Energy": return { ...kpi, value: latest.energy };
              case "Frequency": return { ...kpi, value: latest.frequency };
              case "Power Factor": return { ...kpi, value: latest.power_factor };
              case "Apparent Power": return { ...kpi, value: latest.apparent_power };
              case "Reactive Power": return { ...kpi, value: latest.reactive_power };
              case "CO₂ Emissions": return { ...kpi, value: latest.carbon };
              case "Relay": return { ...kpi, value: relayOn ? 1 : 0, suffix: relayOn ? " ON" : " OFF" };
              default: return kpi;
            }
          })
        );

        setData(historical);

        // Insight logic
        const recentEnergyChange = historical[historical.length - 1].energy - historical[0].energy;
        let insightText = "Energy usage is stable.";
        if (recentEnergyChange > 0.5) insightText = "Energy usage is rising — consider reducing load.";
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
<div className="relay-controls">
  <button onClick={handleToggleRelay} className="relay-btn">
    {relayOn ? "Turn Relay OFF" : "Turn Relay ON"}
  </button>
  <button onClick={handleResetEnergy} className="relay-btn reset-btn">
    Reset Energy
  </button>
</div>

      </div>

      {/* KPI Grid */}
      <div className="stats-grid">
        {kpis.map(kpi => (
          <div key={kpi.id} className="stat-card" style={{ background: kpi.gradient }}>
            <div className="kpi-icon">{kpi.icon}</div>
            <h3 className="kpi-value">
              <CountUp
                end={kpi.value}
                duration={1.5}
                decimals={kpi.value % 1 !== 0 ? 2 : 0}
                suffix={kpi.suffix}
              />
            </h3>
            <p className="kpi-label">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="chart-card">
        <h3>Energy & Reactive Power (Hourly)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis yAxisId="left" label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft", offset: 10 }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: "Reactive Power (VAR)", angle: -90, position: "insideRight", offset: 10 }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="energy" stroke="#007bff" dot={false} name="Energy" />
            <Line yAxisId="right" type="monotone" dataKey="reactive_power" stroke="#ff7300" dot={false} name="Reactive Power" />
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
