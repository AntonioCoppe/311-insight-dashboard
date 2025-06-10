// src/components/RecentBarChart.tsx
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import LiquidGlassWrapper from './LiquidGlassWrapper';
import { getRecent, RecentItem } from '../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function RecentBarChart() {
  const [data, setData]       = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    // default is last 60 minutes; pass a different number if you like
    getRecent()
      .then(items => setData(items))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const chartData = {
    labels: data.map(d => d.request_type),
    datasets: [
      {
        label: 'Last 60 minutes',
        data: data.map(d => d.count),
        backgroundColor: '#34c759',
      },
    ],
  };

  return (
    <LiquidGlassWrapper className="chart-card">
      {error && <div className="error">{error}</div>}
      {loading
        ? <div>Loading recent data…</div>
        : <Bar data={chartData} />}
    </LiquidGlassWrapper>
  );
}
