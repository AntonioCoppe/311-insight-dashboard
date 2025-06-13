import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Sidebar, { SidebarRoute } from './components/Sidebar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const routes: SidebarRoute[] = [
  { path: '/', name: 'Dashboard' },
];

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Sidebar routes={routes} />
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals(console.log);
