import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Sidebar, { SidebarRoute } from './components/Sidebar';
import PageCache from './components/PageCache';
import { BrowserRouter } from 'react-router-dom';
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
      <PageCache />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals(console.log);
