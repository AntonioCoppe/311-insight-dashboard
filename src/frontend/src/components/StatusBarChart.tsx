import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import LiquidGlassWrapper from './LiquidGlassWrapper';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface StatusItem { status: string; count: number; }

export default function StatusBarChart() {
  const [data, setData] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<StatusItem[]>(`${process.env.REACT_APP_API_URL}/api/requests/resolution`)
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load resolution data'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = {
    labels: data.map(d => d.status),
    datasets: [
      {
        label: 'Requests',
        data: data.map(d => d.count),
        backgroundColor: '#5856d6',
      },
    ],
  };

  return (
    <LiquidGlassWrapper className="chart-card">
      {error && <div className="error">{error}</div>}
      {loading ? <div>Loading resolution data…</div> : <Bar data={chartData} />}
    </LiquidGlassWrapper>
  );
}
