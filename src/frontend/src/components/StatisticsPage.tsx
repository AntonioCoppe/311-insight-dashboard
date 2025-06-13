import React from 'react';
import HistoricalLineChart from './HistoricalLineChart';
import YearlyBarChart from './YearlyBarChart';

export default function StatisticsPage() {
  return (
    <div className="dashboard-grid">
      <HistoricalLineChart />
      <YearlyBarChart />
    </div>
  );
}
