import React, { useEffect, useState } from "react";
import "./History.css";

function History() {
  const [data, setData] = useState(() => {
    // ✅ Load saved history from localStorage on page load
    const saved = localStorage.getItem("historyData");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const emissionFactor = 0.5; // kg CO₂ per J of energy

  // ✅ Fetch data from ThingSpeak every 1 second
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://api.thingspeak.com/channels/2966741/feeds.json?api_key=8PCY8HQ6WKC7MYC0&results=1"
        );
        const json = await res.json();

        if (json.feeds && json.feeds.length > 0) {
          const feed = json.feeds[0];
          const energy = parseFloat(feed.field4) || 0;

          const newReading = {
            time: feed.created_at,
            voltage: parseFloat(feed.field1) || 0, // Volts (V)
            current: parseFloat(feed.field2) || 0, // Amps (A)
            power: parseFloat(feed.field3) || 0, // Watts (W)
            energy: parseFloat(feed.field4) || 0, // Joules (J)
            power_factor: parseFloat(feed.field5) || 0, // unitless
            frequency: parseFloat(feed.field6) || 0, // Hz
            apparent_power: parseFloat(feed.field7) || 0, // VA
            reactive_power: parseFloat(feed.field8) || 0, // VAR
            co2: energy * emissionFactor, // kg CO₂
          };

          setData((prev) => {
            if (prev.length > 0 && prev[0].time === newReading.time) {
              return prev; // avoid duplicate
            }
            const updated = [newReading, ...prev]; // ✅ prepend (new → old)
            localStorage.setItem("historyData", JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        console.error("Error fetching ThingSpeak data:", err);
      }
    };

    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Clear history completely
  const handleClear = () => {
    setData([]);
    setCurrentPage(1);
    localStorage.removeItem("historyData");
  };

  // ✅ Download CSV (new → old order)
  const handleCSVDownload = () => {
    const header = [
      "Time",
      "Voltage (V)",
      "Current (A)",
      "Power (W)",
      "Energy (J)",
      "Power Factor",
      "Frequency (Hz)",
      "Apparent Power (VA)",
      "Reactive Power (VAR)",
      "CO₂ (kg)",
    ];

    const csvRows = [
      header.join(","),
      ...data.map((row) =>
        [
          row.time,
          row.voltage,
          row.current,
          row.power,
          row.energy,
          row.power_factor,
          row.frequency,
          row.apparent_power,
          row.reactive_power,
          row.co2.toFixed(3),
        ].join(",")
      ),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div className="dashboard">
      <h2>Historical Data (ThingSpeak)</h2>

      <div className="timeframe-buttons">
        <button onClick={handleClear}>🗑 Clear History</button>
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
              <th>Energy (J)</th>
              <th>Power Factor</th>
              <th>Frequency (Hz)</th>
              <th>Apparent Power (VA)</th>
              <th>Reactive Power (VAR)</th>
              <th>CO₂ (kg)</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: "center" }}>
                  No data available
                </td>
              </tr>
            ) : (
              currentRows.map((row, i) => (
                <tr key={i}>
                  <td>{new Date(row.time).toLocaleString()}</td>
                  <td>{row.voltage}</td>
                  <td>{row.current}</td>
                  <td>{row.power}</td>
                  <td>{row.energy}</td>
                  <td>{row.power_factor}</td>
                  <td>{row.frequency}</td>
                  <td>{row.apparent_power}</td>
                  <td>{row.reactive_power}</td>
                  <td>{row.co2.toFixed(3)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default History;
