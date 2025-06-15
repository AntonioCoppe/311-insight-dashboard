import React from 'react';
import HistoricalLineChart from './HistoricalLineChart';
import YearlyBarChart from './YearlyBarChart';
import StatusBarChart from './StatusBarChart';

export default function StatisticsPage() {
  return (
    <div className="page-content">
      <div className="dashboard-grid">
        <HistoricalLineChart />
        <YearlyBarChart />
      </div>
      <StatusBarChart />
    </div>
  );
}
