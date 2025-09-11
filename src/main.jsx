import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { DashboardProvider } from './components/DashboardContext/DashboardContext.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <DashboardProvider>
      <App />
    </DashboardProvider>
  </StrictMode>
);
