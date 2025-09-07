import React, { useEffect, useState } from "react";
import "./History.css";

function History() {
  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState("day"); // day, week, month, year
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fetchData = async (tf) => {
    try {
      let results = 24;
      if (tf === "week") results = 7;
      if (tf === "month") results = 30;
      if (tf === "year") results = 12;

      const res = await fetch(
        `https://api.thingspeak.com/channels/2966741/feeds.json?api_key=8PCY8HQ6WKC7MYC0&results=${results}`
      );
      const json = await res.json();

      // Map data with trends
      const processedData = json.feeds.map((feed, index, arr) => {
        const voltage = Number(feed.field1);
        const current = Number(feed.field2);
        const power = Number(feed.field3);
        const energy = Number(feed.field4);
        const carbon = energy * 0.1;
        const frequency = Number(feed.field6);
        const reactive_power = Number(feed.field7);
        const power_factor = Number(feed.field8);

        const prev = arr[index - 1];
        const energyTrend = prev ? (energy > Number(prev.field4) ? "up" : energy < Number(prev.field4) ? "down" : "stable") : "stable";
        const carbonTrend = prev ? (carbon > Number(prev.field4) * 0.1 ? "up" : carbon < Number(prev.field4) * 0.1 ? "down" : "stable") : "stable";
        const pfTrend = prev ? (power_factor > Number(prev.field8) ? "up" : power_factor < Number(prev.field8) ? "down" : "stable") : "stable";

        return {
          time: tf === "day" ? new Date(feed.created_at).getHours() + ":00" : new Date(feed.created_at).toLocaleDateString(),
          voltage,
          current,
          power,
          apparent_power: voltage * current,
          frequency,
          reactive_power,
          power_factor,
          energy,
          carbon,
          relay: Number(feed.field5) === 1 ? "ON" : "OFF",
          trends: {
            energy: energyTrend,
            carbon: carbonTrend,
            pf: pfTrend
          }
        };
      });

      setData(processedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData(timeframe);
  }, [timeframe]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleCSVDownload = () => {
    const header = [
      "Time", "Voltage (V)", "Current (A)", "Power (W)", "Apparent Power (VA)",
      "Frequency (Hz)", "Reactive Power (VAR)", "Power Factor", "Energy (kWh)", "CO₂ (kg)", "Relay"
    ];
    const csvRows = [
      header.join(","),
      ...data.map(row =>
        [
          row.time, row.voltage, row.current, row.power, row.apparent_power,
          row.frequency, row.reactive_power, row.power_factor, row.energy, row.carbon, row.relay
        ].join(",")
      )
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `history_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const trendIcon = (trend) => {
    if (trend === "up") return "🔺";
    if (trend === "down") return "🔻";
    return "➡️";
  };

  return (
    <div className="dashboard">
      <h2>Historical Data</h2>

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
        <button onClick={handleCSVDownload}>Download CSV</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Voltage (V)</th>
              <th>Current (A)</th>
              <th>Power (W)</th>
              <th>Apparent Power (VA)</th>
              <th>Frequency (Hz)</th>
              <th>Reactive Power (VAR)</th>
              <th>Power Factor</th>
              <th>Energy (kWh)</th>
              <th>CO₂ (kg)</th>
              <th>Relay</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: "center" }}>No data available</td>
              </tr>
            ) : (
              currentRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.time}</td>
                  <td>{row.voltage}</td>
                  <td>{row.current}</td>
                  <td>{row.power}</td>
                  <td>{row.apparent_power}</td>
                  <td>{row.frequency}</td>
                  <td>{row.reactive_power}</td>
                  <td>{row.power_factor} {trendIcon(row.trends.pf)}</td>
                  <td>{row.energy} {trendIcon(row.trends.energy)}</td>
                  <td>{row.carbon} {trendIcon(row.trends.carbon)}</td>
                  <td>{row.relay}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Prev</button>
          <span>{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}

export default History;
