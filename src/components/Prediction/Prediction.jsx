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
const MAX_READINGS = 60; // keep latest 60 readings
const STORAGE_KEY = "predictionData"; // localStorage key

function Prediction() {
  const [actualData, setActualData] = useState(() => {
    // ✅ Load from localStorage on first render
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Save to localStorage whenever actualData updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualData));
  }, [actualData]);

  // Fetch actual data from ThingSpeak
  const fetchActualData = async (currentPredicted) => {
    try {
      const res = await fetch(
        "https://api.thingspeak.com/channels/2966741/feeds.json?api_key=8PCY8HQ6WKC7MYC0&results=1"
      );
      const json = await res.json();
      if (json.feeds && json.feeds.length > 0) {
        const feed = json.feeds[0];
        const energy = parseFloat(feed.field4) || 0;

        const newReading = {
          time: new Date(feed.created_at),
          energy,
          co2: energy * EMISSION_FACTOR,
          predictedEnergy: currentPredicted ? currentPredicted.energy : null,
          predictedCO2: currentPredicted ? currentPredicted.co2 : null,
        };

        setActualData((prev) => {
          if (
            prev.length > 0 &&
            new Date(prev[0].time).getTime() === newReading.time.getTime()
          ) {
            return prev; // avoid duplicates
          }
          return [newReading, ...prev].slice(0, MAX_READINGS);
        });
      }
    } catch (err) {
      console.error("Error fetching actual data:", err);
    }
  };

  // Fetch predicted data from backend
  const fetchPredictedData = async () => {
    try {
      const res = await fetch("https://iot-nn2z.onrender.com/latest");
      const json = await res.json();
      if (json.status === "success") {
        const projectedEnergy = json.projected_agg_energy_kwh;
        const snapshot = {
          energy: projectedEnergy,
          co2: projectedEnergy * EMISSION_FACTOR,
        };
        fetchActualData(snapshot);
      }
    } catch (err) {
      console.error("Error fetching predicted data:", err);
    }
  };

  // Build comparative table
  const buildTableData = () => {
    if (actualData.length === 0) return;

    const table = actualData.map((act) => {
      const absEnergyError =
        act.predictedEnergy !== null
          ? Math.abs(act.energy - act.predictedEnergy)
          : 0;
      const absCO2Error =
        act.predictedCO2 !== null ? Math.abs(act.co2 - act.predictedCO2) : 0;

      // Energy color
      let energyColorActual = "#064e3b";
      if (act.energy >= 2 && act.energy < 4) energyColorActual = "#92400e";
      else if (act.energy >= 4) energyColorActual = "#991b1b";

      let energyColorPredicted = "#064e3b";
      if (act.predictedEnergy >= 2 && act.predictedEnergy < 4)
        energyColorPredicted = "#92400e";
      else if (act.predictedEnergy >= 4) energyColorPredicted = "#991b1b";

      // CO₂ color
      let co2ColorActual = "#065f46";
      if (act.co2 >= 2 && act.co2 < 4) co2ColorActual = "#b45309";
      else if (act.co2 >= 4) co2ColorActual = "#7f1d1d";

      let co2ColorPredicted = "#065f46";
      if (act.predictedCO2 >= 2 && act.predictedCO2 < 4)
        co2ColorPredicted = "#b45309";
      else if (act.predictedCO2 >= 4) co2ColorPredicted = "#7f1d1d";

      // 🔑 Score & Recommendation based on CO₂
      let score = 1;
      let recommendation = "Energy usage is normal.";

      if (act.co2 < 1) {
        score = 1;
        recommendation = "Very low CO₂ — excellent condition.";
      } else if (act.co2 >= 1 && act.co2 < 2) {
        score = 3;
        recommendation = "moderate CO₂ — system operating normally.";
      } else if (act.co2 >= 2 && act.co2 < 3) {
        score = 5;
        recommendation = "Moderate CO₂ — monitor usage closely.";
      } else if (act.co2 >= 4) {
        score = 10;
        recommendation =
          "High CO₂ — consider reducing load or checking equipment.";
      }

      return {
        ...act,
        absoluteEnergyError: absEnergyError,
        absoluteCO2Error: absCO2Error,
        score,
        recommendation,
        energyColorActual,
        energyColorPredicted,
        co2ColorActual,
        co2ColorPredicted,
      };
    });

    setTableData(table);
  };

  // Real-time updates every 2s
  useEffect(() => {
    fetchPredictedData();
    const interval = setInterval(() => {
      fetchPredictedData();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    buildTableData();
  }, [actualData]);

  // Pagination
  const indexOfLastRow = currentPage * ROWS_PER_PAGE;
  const indexOfFirstRow = indexOfLastRow - ROWS_PER_PAGE;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tableData.length / ROWS_PER_PAGE);

  const getScoreColor = (score) => {
    if (score <= 3) return "#16a34a";
    if (score <= 5) return "#facc15";
    return "#ef4444";
  };

  return (
    <div className="prediction-page">
      <h2>Energy & CO₂ Predictions</h2>

      {/* Chart */}
      <div className="chart-container">
        <h3>Live Predictions (Projected vs Actual)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={tableData.slice(0, 12).reverse()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickFormatter={(time) => new Date(time).toLocaleTimeString()}
            />
            <YAxis
              yAxisId="left"
              label={{ value: "kWh", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: "CO₂ (kg)", angle: 90, position: "insideRight" }}
            />
            <Tooltip
              labelFormatter={(time) => new Date(time).toLocaleTimeString()}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="energy"
              stroke="#1d4ed8"
              name="Actual Energy (kWh)"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="predictedEnergy"
              stroke="#059669"
              name="Predicted Energy (kWh)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="co2"
              stroke="#d97706"
              name="Actual CO₂ (kg)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="predictedCO2"
              stroke="#a21caf"
              name="Predicted CO₂ (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="table-container">
        <h3>Comparative Table (Actual vs Predicted)</h3>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Actual Energy</th>
              <th>Predicted Energy</th>
              <th>Abs Energy Error</th>
              <th>Actual CO₂</th>
              <th>Predicted CO₂</th>
              <th>Abs CO₂ Error</th>
              <th>Score</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  No data available
                </td>
              </tr>
            ) : (
              currentRows.map((row, i) => (
                <tr key={i}>
                  <td>
                    {row.time ? new Date(row.time).toLocaleTimeString() : "N/A"}
                  </td>

                  <td
                    style={{ backgroundColor: row.energyColorActual, color: "#fff" }}
                  >
                    {typeof row.energy === "number"
                      ? row.energy.toFixed(3)
                      : "N/A"}
                  </td>

                  <td
                    style={{
                      backgroundColor: row.energyColorPredicted,
                      color: "#fff",
                    }}
                  >
                    {typeof row.predictedEnergy === "number"
                      ? row.predictedEnergy.toFixed(3)
                      : "N/A"}
                  </td>

                  <td>
                    {typeof row.absoluteEnergyError === "number"
                      ? row.absoluteEnergyError.toFixed(3)
                      : "N/A"}
                  </td>

                  <td
                    style={{ backgroundColor: row.co2ColorActual, color: "#fff" }}
                  >
                    {typeof row.co2 === "number" ? row.co2.toFixed(3) : "N/A"}
                  </td>

                  <td
                    style={{
                      backgroundColor: row.co2ColorPredicted,
                      color: "#fff",
                    }}
                  >
                    {typeof row.predictedCO2 === "number"
                      ? row.predictedCO2.toFixed(3)
                      : "N/A"}
                  </td>

                  <td>
                    {typeof row.absoluteCO2Error === "number"
                      ? row.absoluteCO2Error.toFixed(3)
                      : "N/A"}
                  </td>

                  <td
                    style={{
                      backgroundColor: getScoreColor(row.score),
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {row.score ?? "N/A"}
                  </td>

                  <td>{row.recommendation || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Prediction;
