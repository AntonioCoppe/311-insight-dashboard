// src/components/HistoricalLineChart.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';

// Chart.js & Day.js adapter for v4
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  type ChartOptions,    // ← import ChartOptions type
  type TimeUnit         // ← import TimeUnit union
} from 'chart.js';
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';

import LiquidGlassWrapper from './LiquidGlassWrapper';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function HistoricalLineChart() {
  const today        = dayjs().format('YYYY-MM-DD');
  const sevenDaysAgo = dayjs().subtract(6, 'day').format('YYYY-MM-DD');

  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate,   setEndDate]   = useState(today);
  const [data,      setData]      = useState<{ date: string; count: number }[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

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

  // Convert your data into the { x: Date, y: number } format
  const chartData = {
    datasets: [
      {
        label: 'Requests',
        data: data.map(d => ({ x: d.date, y: d.count })),
        fill: false,
        tension: 0.2,
        borderColor: '#007aff',
        pointBackgroundColor: '#007aff',
      },
    ],
  };

  // *** Annotate as ChartOptions<'line'> ***
  const options: ChartOptions<'line'> = {
    scales: {
      x: {
        type: 'time',
        time: {
          // 'day' is one of the allowed TimeUnit literals
          unit: 'day' as TimeUnit,
          tooltipFormat: 'MMM D, YYYY',
          displayFormats: {
            day: 'MMM D, YYYY',
          },
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Requests',
        },
      },
    },
    plugins: {
      tooltip: {
        // Chart.js will use our tooltipFormat above
      },
    },
  };

  return (
    <LiquidGlassWrapper className="chart-card historical-line-chart">
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
      {loading
        ? <div>Loading historical data…</div>
        : <Line data={chartData} options={options} />
      }
    </LiquidGlassWrapper>
  );
}
