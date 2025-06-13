import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Sidebar, { SidebarRoute } from './components/Sidebar';
import MapPage from './components/MapPage';
import StatisticsPage from './components/StatisticsPage';
import AboutPage from './components/AboutPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const routes: SidebarRoute[] = [
  { path: '/', name: 'Dashboard' },
  { path: '/map', name: 'Map' },
  { path: '/statistics', name: 'Statistics' },
  { path: '/about', name: 'About' },
];

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Sidebar routes={routes} />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals(console.log);
