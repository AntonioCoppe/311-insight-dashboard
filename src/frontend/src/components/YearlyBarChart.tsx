import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import LiquidGlassWrapper from './LiquidGlassWrapper';
import { getYearlyTop, RecentItem } from '../api';
import { exportToCSV } from '../utils/exportToCSV';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function YearlyBarChart() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getYearlyTop(year)
      .then(items => setData(items))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [year]);

  const chartData = {
    labels: data.map(d => d.request_type),
    datasets: [
      {
        label: `Top Requests ${year}`,
        data: data.map(d => d.count),
        backgroundColor: '#34c759',
      },
    ],
  };

  return (
    <LiquidGlassWrapper className="chart-card">
      <label>
        Year:{' '}
        <input
          type="number"
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          min="2000"
          max={currentYear}
        />
      </label>
      {error && <div className="error">{error}</div>}
      {loading ? <div>Loading yearly data…</div> : <Bar data={chartData} />}
      <button onClick={() => exportToCSV(data, ['request_type', 'count'], 'yearly_top.csv')}>
        Export to CSV
      </button>
    </LiquidGlassWrapper>
  );
}
