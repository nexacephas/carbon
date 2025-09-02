import React from "react";
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
import { FaArrowUp, FaArrowDown, FaExclamationTriangle } from "react-icons/fa";
import "./Dashboard.css";

// Dummy 24-hour data
const data = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  energy_actual: Math.floor(Math.random() * 100 + 50),
  energy_predicted: Math.floor(Math.random() * 100 + 50),
  carbon_actual: Math.floor(Math.random() * 70 + 30),
  carbon_predicted: Math.floor(Math.random() * 70 + 30),
}));

const Dashboard = () => {
  const lastHour = data[data.length - 1];

  const insights = [
    {
      label: "Energy Usage",
      value: `${lastHour.energy_actual} kWh`,
      trend: lastHour.energy_actual > lastHour.energy_predicted ? "high" : "low",
    },
    {
      label: "Carbon Emissions",
      value: `${lastHour.carbon_actual} kg`,
      trend: lastHour.carbon_actual > lastHour.carbon_predicted ? "high" : "low",
    },
    {
      label: "Prediction Accuracy",
      value: `${(100 - Math.abs((lastHour.energy_actual - lastHour.energy_predicted) / lastHour.energy_predicted) * 100).toFixed(1)}%`,
      trend: "moderate",
    },
  ];

  const recommendations = [
    {
      title: "Reduce Peak Energy Usage",
      description: "Try shifting heavy appliances to off-peak hours to lower costs and emissions.",
      icon: <FaArrowDown />,
      color: "#16a34a",
    },
    {
      title: "Carbon Awareness",
      description: "Consider renewable energy sources for high carbon usage periods.",
      icon: <FaExclamationTriangle />,
      color: "#facc15",
    },
    {
      title: "Efficiency Improvement",
      description: "Your energy efficiency is good, but small adjustments can save more.",
      icon: <FaArrowUp />,
      color: "#3b82f6",
    },
  ];

  const getIcon = (trend) => {
    if (trend === "high") return <FaArrowUp className="icon red" />;
    if (trend === "low") return <FaArrowDown className="icon green" />;
    return <FaExclamationTriangle className="icon yellow" />;
  };

  return (
    <div className="dashboard">
      <h2>Energy & Carbon Dashboard</h2>

      {/* Charts */}
      <div className="charts-row">
        {/* Actual Chart */}
        <div className="chart-container">
          <h3>Actual Data</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis yAxisId="left" label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Carbon (kg)", angle: -90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="energy_actual" stroke="#007bff" dot={false} name="Energy Actual" />
              <Line yAxisId="right" type="monotone" dataKey="carbon_actual" stroke="#ff7300" dot={false} name="Carbon Actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Predicted Chart */}
        <div className="chart-container">
          <h3>Predicted Data</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis yAxisId="left" label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Carbon (kg)", angle: -90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="energy_predicted" stroke="#00c49f" strokeDasharray="5 5" dot={false} name="Energy Predicted" />
              <Line yAxisId="right" type="monotone" dataKey="carbon_predicted" stroke="#8884d8" strokeDasharray="5 5" dot={false} name="Carbon Predicted" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="insights-row">
        {insights.map((insight, i) => (
          <div key={i} className={`insight-card ${insight.trend}`}>
            <div className="insight-icon">{getIcon(insight.trend)}</div>
            <div className="insight-details">
              <div className="label">{insight.label}</div>
              <div className="value">{insight.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <h3 style={{ marginTop: "30px", marginBottom: "15px" }}>Recommendations</h3>
      <div className="insights-row">
        {recommendations.map((rec, i) => (
          <div key={i} className="insight-card" style={{ borderLeft: `4px solid ${rec.color}` }}>
            <div className="insight-icon" style={{ color: rec.color }}>{rec.icon}</div>
            <div className="insight-details">
              <div className="label">{rec.title}</div>
              <div className="value" style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{rec.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
