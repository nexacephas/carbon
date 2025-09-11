import React, { createContext, useState } from "react";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState([]); // stores historical data
  const [relayOn, setRelayOn] = useState(true);

  // ✅ Toggle relay
  const toggleRelay = () => setRelayOn((prev) => !prev);

  // ✅ Reset all stored energy/carbon readings
  const resetEnergy = () => {
    setDashboardData((prev) =>
      prev.map((d) => ({
        ...d,
        energy: 0,
        carbon: 0,
      }))
    );
  };

  // ✅ Add new reading with timestamp
  const addReading = (reading) => {
    setDashboardData((prev) => [
      ...prev,
      {
        ...reading,
        loggedAt: new Date().toLocaleString(), // log when it was saved
      },
    ]);
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        addReading,
        relayOn,
        toggleRelay,
        resetEnergy,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
