import React from 'react';
import { RecentBarChart } from './components/RecentBarChart';
import { HistoricalLineChart } from './components/HistoricalLineChart';
import { MapView } from './components/MapView';

function App() {
  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Toronto 311 Insight Dashboard</h1>
      <section>
        <h2>Recent Requests (last hour)</h2>
        <RecentBarChart />
      </section>
      <section>
        <h2>Requests Over Time (past week)</h2>
        <HistoricalLineChart />
      </section>
      <section>
        <h2>Spatial Distribution: Graffiti</h2>
        <MapView />
      </section>
    </div>
  );
}

export default App;
