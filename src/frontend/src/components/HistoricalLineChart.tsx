import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function HistoricalLineChart() {
  const today = dayjs().format('YYYY-MM-DD');
  const sevenDaysAgo = dayjs().subtract(6, 'day').format('YYYY-MM-DD');

  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistorical() {
      if (dayjs(startDate).isAfter(endDate)) {
        setError('Start date must be on or before End date');
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const res = await axios.get<{ date: string; count: number }[]>(
          `${process.env.REACT_APP_API_URL}/requests/historical`,
          { params: { start: startDate, end: endDate } }
        );
        setData(res.data);
      } catch (e) {
        console.error(e);
        setError('Failed to load historical data');
      } finally {
        setLoading(false);
      }
    }
    fetchHistorical();
  }, [startDate, endDate]);

  // Prepare Chart.js dataset
  const chartData = {
    labels: data.map(d => dayjs(d.date).format('MMM D')),
    datasets: [
      {
        label: 'Requests',
        data: data.map(d => d.count),
        fill: false,
        tension: 0.2,
      },
    ],
  };

  return (
    <div>
      <div className="date-controls">
        <label>
          Start:{' '}
          <input
            type="date"
            max={endDate}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </label>
        &nbsp;&nbsp;
        <label>
          End:{' '}
          <input
            type="date"
            min={startDate}
            max={today}
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </label>
      </div>

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div>Loading historical data…</div>
      ) : (
        <Line data={chartData} />
      )}
    </div>
  );
}