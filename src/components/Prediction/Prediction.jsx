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

const ROWS_PER_PAGE = 6;
const EMISSION_FACTOR = 0.5; // kg CO₂ per kWh

function Prediction() {
  const [actualData, setActualData] = useState([]);
  const [predictedValue, setPredictedValue] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch actual data from ThingSpeak
  const fetchActualData = async () => {
    try {
      const res = await fetch(
        "https://api.thingspeak.com/channels/2966741/feeds.json?api_key=8PCY8HQ6WKC7MYC0&results=60"
      );
      const json = await res.json();
      if (json.feeds) {
        const formatted = json.feeds.map(feed => ({
          time: new Date(feed.created_at),
          energy: parseFloat(feed.field4) || 0,
          co2: (parseFloat(feed.field4) || 0) * EMISSION_FACTOR,
        }));
        setActualData(formatted);
        localStorage.setItem("actualData", JSON.stringify(formatted));
      }
    } catch (err) {
      console.error("Error fetching actual data:", err);
      const saved = localStorage.getItem("actualData");
      if (saved) setActualData(JSON.parse(saved));
    }
  };

  // Fetch predicted data from backend
  const fetchPredictedData = async () => {
    try {
      const res = await fetch("https://iot-nn2z.onrender.com/latest");
      const json = await res.json();
      if (json.status === "success") {
        const projectedEnergy = json.projected_agg_energy_kwh; // use directly
        setPredictedValue({
          energy: projectedEnergy,
          co2: projectedEnergy * EMISSION_FACTOR,
        });
        localStorage.setItem(
          "predictedValue",
          JSON.stringify({
            energy: projectedEnergy,
            co2: projectedEnergy * EMISSION_FACTOR,
          })
        );
      }
    } catch (err) {
      console.error("Error fetching predicted data:", err);
      const saved = localStorage.getItem("predictedValue");
      if (saved) setPredictedValue(JSON.parse(saved));
    }
  };

  // Build comparative table
  const buildTableData = () => {
    if (!predictedValue) return;

    const table = actualData.map(act => {
      const absEnergyError = Math.abs(act.energy - predictedValue.energy);
      const absCO2Error = Math.abs(act.co2 - predictedValue.co2);

      // Score and color
      let score = 1;
      const errorPercent = (absEnergyError / (act.energy || 0.0001)) * 100;
      if (errorPercent > 10 && errorPercent <= 30) score = 5;
      if (errorPercent > 30) score = 10;

      // Recommendation
      let recommendation = "Energy usage is normal.";
      if (score <= 3) recommendation = "Low deviation — system operating normally.";
      if (score <= 5) recommendation = "Moderate deviation — monitor usage closely.";
      if (score > 5) recommendation = "High deviation — consider reducing load or checking equipment.";

      return {
        time: act.time,
        actualEnergy: act.energy,
        predictedEnergy: predictedValue.energy,
        absoluteEnergyError: absEnergyError,
        actualCO2: act.co2,
        predictedCO2: predictedValue.co2,
        absoluteCO2Error: absCO2Error,
        score,
        recommendation,
      };
    });

    setTableData(table);
    localStorage.setItem("tableData", JSON.stringify(table));
  };

  useEffect(() => {
    fetchActualData();
    fetchPredictedData();
    const interval = setInterval(() => {
      fetchActualData();
      fetchPredictedData();
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (actualData.length > 0 && predictedValue) buildTableData();
  }, [actualData, predictedValue]);

  // Pagination
  const indexOfLastRow = currentPage * ROWS_PER_PAGE;
  const indexOfFirstRow = indexOfLastRow - ROWS_PER_PAGE;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tableData.length / ROWS_PER_PAGE);

  const getScoreColor = score => {
    if (score <= 3) return "#4ade80"; // green
    if (score <= 5) return "#facc15"; // yellow
    return "#f87171"; // red
  };

  return (
    <div className="prediction-page">
      <h2>Energy & CO₂ Predictions</h2>

      {/* Chart */}
      <div className="chart-container">
        <h3>Live Predictions (Projected vs Actual)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={tableData.slice(-10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tickFormatter={time => new Date(time).toLocaleTimeString()} />
            <YAxis />
            <Tooltip labelFormatter={time => new Date(time).toLocaleTimeString()} />
            <Legend />
            <Line type="monotone" dataKey="actualEnergy" stroke="#007bff" name="Actual Energy (kWh)" />
            <Line type="monotone" dataKey="predictedEnergy" stroke="#82ca9d" name="Predicted Energy (kWh)" />
            <Line type="monotone" dataKey="actualCO2" stroke="#ff7300" name="Actual CO₂ (kg)" />
            <Line type="monotone" dataKey="predictedCO2" stroke="#a832a6" name="Predicted CO₂ (kg)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Comparative Table */}
      <div className="table-container">
        <h3>Comparative Table (Actual vs Predicted)</h3>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Actual Energy (kWh)</th>
              <th>Predicted Energy (kWh)</th>
              <th>Absolute Error (kWh)</th>
              <th>Actual CO₂ (kg)</th>
              <th>Predicted CO₂ (kg)</th>
              <th>Absolute CO₂ Error (kg)</th>
              <th>Insight</th>
              <th>Recommendation</th>
            </tr>
          </thead>
<tbody>
  {currentRows.length === 0 ? (
    <tr>
      <td colSpan="9" style={{ textAlign: "center" }}>No data available</td>
    </tr>
  ) : (
    currentRows.map((row, i) => (
      <tr key={i}>
        <td>{new Date(row.time).toLocaleTimeString()}</td>
        <td>{row.actualEnergy.toFixed(3)}</td>
        <td className="predicted-energy">{row.predictedEnergy.toFixed(3)}</td>
        <td className="absolute-energy-error">{row.absoluteEnergyError.toFixed(3)}</td>
        <td>{row.actualCO2.toFixed(3)}</td>
        <td className="predicted-co2">{row.predictedCO2.toFixed(3)}</td>
        <td className="absolute-co2-error">{row.absoluteCO2Error.toFixed(3)}</td>
        <td style={{ backgroundColor: getScoreColor(row.score), textAlign: "center", fontWeight: "bold" }}>
          {row.score}
        </td>
        <td>{row.recommendation}</td>
      </tr>
    ))
  )}
</tbody>

        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Prev</button>
            <span>{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Prediction;
