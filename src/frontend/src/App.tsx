import React from 'react';
import './App.css';
import { RecentBarChart } from './components/RecentBarChart';
import { HistoricalLineChart } from './components/HistoricalLineChart';
import { MapView } from './components/MapView';

function App() {
  return (
    <div className="App container">
      {/* Hero / intro */}
      <header className="hero">
        <h1>Toronto 311 Insight Dashboard</h1>
        <p className="hero-subtitle">
          Explore Toronto’s 311 service-request trends in real time. See which categories have spiked in the past hour, track historical patterns over days, and view where on the map each request type is clustering across the city.
        </p>
      </header>

      {/* Recent requests */}
      <section className="card">
        <h2>📈 Recent Requests</h2>
        <p className="subtitle">
          Top request categories in the last hour, updated every minute.
        </p>
        <RecentBarChart />
      </section>

      {/* Historical line chart */}
      <section className="card">
        <h2>📅 Requests Over Time</h2>
        <p className="subtitle">
          Daily request volume between any two dates—use the controls to customize the range.
        </p>
        <HistoricalLineChart />
      </section>

      {/* Spatial map */}
      <section className="card">
        <h2>🗺️ Spatial Distribution</h2>
        <p className="subtitle">
          Where in Toronto specific service requests are concentrated. Circle size scales with request count.
        </p>
        <MapView />
      </section>

      <footer className="footer">
        <p>
          Data powered by the City of Toronto’s open 311 API. Built by Antonio Coppe.
        </p>
      </footer>
    </div>
  );
}

export default App;