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
import "../Dashboard/Dashboard.css";

function Prediction() {
  const [data, setData] = useState([]);
  const [insight, setInsight] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [timeframe, setTimeframe] = useState("day"); // day, week, month, year

  const generatePrediction = (historical, steps = 5) => {
    if (historical.length < 2) return [];
    const energyTrend = (historical[historical.length - 1].energy_actual - historical[0].energy_actual) / (historical.length - 1);
    const carbonTrend = (historical[historical.length - 1].carbon_actual - historical[0].carbon_actual) / (historical.length - 1);

    const lastEnergy = historical[historical.length - 1].energy_actual;
    const lastCarbon = historical[historical.length - 1].carbon_actual;

    const predicted = [];
    for (let i = 1; i <= steps; i++) {
      predicted.push({
        hour: `T+${i}`,
        energy_actual: null,
        carbon_actual: null,
        energy_predicted: lastEnergy + energyTrend * i,
        carbon_predicted: lastCarbon + carbonTrend * i,
      });
    }
    return predicted;
  };

  const fetchData = async (tf) => {
    try {
      let results = 24; // daily
      if (tf === "week") results = 7;
      if (tf === "month") results = 30;
      if (tf === "year") results = 12;

      const res = await fetch(
        `https://api.thingspeak.com/channels/2966741/feeds.json?api_key=8PCY8HQ6WKC7MYC0&results=${results}`
      );
      const json = await res.json();

      const historical = json.feeds.map(feed => ({
        hour: tf === "day" ? new Date(feed.created_at).getHours() + ":00" : new Date(feed.created_at).toLocaleDateString(),
        energy_actual: Number(feed.field4),
        carbon_actual: Number(feed.field4) * 0.1
      }));

      const predicted = generatePrediction(historical, tf === "day" ? 5 : tf === "week" ? 7 : tf === "month" ? 30 : 12);
      setData([...historical, ...predicted]);

      // Insights & Recommendations
      const recentEnergyChange = historical[historical.length - 1].energy_actual - historical[0].energy_actual;
      const recentCarbonChange = historical[historical.length - 1].carbon_actual - historical[0].carbon_actual;

      let insightText = "Energy and carbon usage is stable.";
      const recs = [];

      if (recentEnergyChange > 0.5) {
        insightText = "Energy usage is increasing over the last period.";
        recs.push("Consider reducing high-power loads during peak hours.");
        recs.push("Check appliances for energy efficiency.");
      } else if (recentEnergyChange < -0.5) {
        insightText = "Energy usage is decreasing — good trend!";
        recs.push("Continue monitoring usage to maintain efficiency.");
      }

      if (recentCarbonChange > 0.05) {
        recs.push("Carbon emissions are rising — consider renewable sources.");
      } else if (recentCarbonChange < -0.05) {
        recs.push("Carbon emissions are reducing — positive trend!");
      }

      setInsight(insightText);
      setRecommendations(recs);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Determine refresh interval based on timeframe
    let intervalTime = 1000; // default 1s for daily
    if (timeframe === "week") intervalTime = 5000; // 5s
    if (timeframe === "month") intervalTime = 10000; // 10s
    if (timeframe === "year") intervalTime = 30000; // 30s

    fetchData(timeframe); // initial fetch
    const interval = setInterval(() => fetchData(timeframe), intervalTime);

    return () => clearInterval(interval);
  }, [timeframe]);

  return (
    <div className="dashboard">
      <h2>Energy & Carbon Predictions</h2>

      <div className="timeframe-buttons">
        {["day", "week", "month", "year"].map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={timeframe === tf ? "active" : ""}
          >
            {tf.charAt(0).toUpperCase() + tf.slice(1)}
          </button>
        ))}
      </div>

      <div className="chart-card">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis yAxisId="left" label={{ value: "Energy (kWh)", angle: -90, position: "insideLeft" }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: "CO₂ (kg)", angle: -90, position: "insideRight" }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="energy_actual" stroke="#007bff" dot={false} name="Energy Actual" />
            <Line yAxisId="right" type="monotone" dataKey="carbon_actual" stroke="#ff7300" dot={false} name="CO₂ Actual" />
            <Line yAxisId="left" type="monotone" dataKey="energy_predicted" stroke="#82ca9d" dot={false} strokeDasharray="5 5" name="Energy Predicted" />
            <Line yAxisId="right" type="monotone" dataKey="carbon_predicted" stroke="#ffbb28" dot={false} strokeDasharray="5 5" name="CO₂ Predicted" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="insight">
        <h4>Insight</h4>
        <p>{insight}</p>
        {recommendations.length > 0 && (
          <>
            <h4>Recommendations</h4>
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default Prediction;
