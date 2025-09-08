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
import "./Prediction.css";

function Prediction() {
  const [data, setData] = useState([]);
  const [insight, setInsight] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("hour"); // default

  // Linear regression for hourly smoothing
  const linearRegressionPredict = (data, nextHours = 1) => {
    if (!data || data.length === 0) return [];

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    data.forEach((point, idx) => {
      const x = idx;
      const y = point.carbon_predicted;
      sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictions = [];
    for (let i = 0; i < nextHours; i++) {
      const x = n + i;
      predictions.push({ hour: `Hour ${x}`, carbon_predicted: slope * x + intercept });
    }

    return predictions;
  };

  const fetchPrediction = async (tf) => {
    try {
      setLoading(true);
      const res = await fetch(`https://iot-nn2z.onrender.com/predict?timeframe=${tf}`);
      const json = await res.json();
      if (!json.data) return;

      const co2Data = json.data.map((item) => ({
        hour: item.hour,
        carbon_predicted: item.carbon_predicted,
      }));

      // Only apply linear regression for hourly data
      const finalData = tf === "hour" ? [...co2Data, ...linearRegressionPredict(co2Data, 3)] : co2Data;

      setData(finalData);

      // Insight based on average CO2 of actual data
      const avgCO2 = co2Data.reduce((sum, item) => sum + item.carbon_predicted, 0) / co2Data.length;

      if (avgCO2 < 50) {
        setInsight("CO₂ levels are low. Keep up the good energy usage habits!");
        setRecommendations(["Maintain current energy practices.", "Consider small efficiency improvements."]);
      } else if (avgCO2 < 150) {
        setInsight("CO₂ levels are moderate. Monitor energy consumption closely.");
        setRecommendations([
          "Reduce peak usage where possible.",
          "Use energy-efficient appliances during high-demand hours.",
        ]);
      } else {
        setInsight("CO₂ levels are high! Immediate action recommended!");
        setRecommendations([
          "Shift high-energy tasks to off-peak hours.",
          "Check for any unusual energy consumption in your devices.",
          "Consider renewable energy sources if possible.",
        ]);
      }
    } catch (error) {
      console.error("Error fetching prediction:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction(timeframe);

    // Only auto-refresh hourly data every 60 minutes
    let interval;
    if (timeframe === "hour") {
      interval = setInterval(() => fetchPrediction("hour"), 3600000);
    }

    return () => clearInterval(interval);
  }, [timeframe]);

  return (
    <div className="dashboard">
      <h2>⚡ CO₂ Predictions</h2>

      {/* Timeframe buttons */}
      <div className="timeframe-buttons">
        {["hour", "day", "week", "month", "year"].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={timeframe === tf ? "active" : ""}
          >
            {tf.charAt(0).toUpperCase() + tf.slice(1)}
          </button>
        ))}
      </div>

      <div className="card chart-card">
        {loading ? (
          <div className="loading">Fetching CO₂ predictions...</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="hour" label={{ value: "Time", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "CO₂ (kg)", angle: -90, position: "insideLeft" }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="carbon_predicted"
                stroke="#f59e0b"
                dot={false}
                strokeWidth={2}
                name="CO₂ Predicted"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card insight">
        <h4>📊 Insight</h4>
        <p>{insight}</p>
        {recommendations.length > 0 && (
          <>
            <h4>💡 Recommendations</h4>
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
