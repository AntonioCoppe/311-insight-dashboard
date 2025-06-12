import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
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
  ChartOptions
} from 'chart.js';
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
import axios from 'axios';
import LiquidGlassWrapper from './LiquidGlassWrapper';
import dayjs from 'dayjs';
import { useRequestTypes } from '../hooks/useRequestTypes';
import Select from 'react-select';
import { exportToCSV } from '../utils/exportToCSV';

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

interface HistoricalItem {
  date: string;
  request_type?: string;
  count: number;
}

export default function HistoricalLineChart() {
  const today = dayjs().format('YYYY-MM-DD');
  const sevenDaysAgo = dayjs().subtract(6, 'day').format('YYYY-MM-DD');

  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState<HistoricalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { types, loading: typesLoading, error: typesError } = useRequestTypes();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    async function fetchHistorical() {
      if (dayjs(startDate).isAfter(endDate)) {
        setError('Start date must be on or before End date');
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const res = await axios.get<HistoricalItem[]>(
          `${process.env.REACT_APP_API_URL}/requests/historical`,
          { params: { start: startDate, end: endDate, types: selectedTypes.join(',') } }
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
  }, [startDate, endDate, selectedTypes]);

  const colors = ['#007aff', '#34c759', '#ff9500', '#ff2d55', '#5856d6'];
  const getColorForType = (type: string) => {
    const index = Math.abs(
      type.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)
    ) % colors.length;
    return colors[index];
  };

  // Filter out undefined, then build a unique string[] of types
  const uniqueTypes = [
    ...new Set(
      data
        .map(d => d.request_type)
        .filter((t): t is string => t !== undefined)
    )
  ];

  const chartData = {
    datasets:
      uniqueTypes.length > 0
        ? uniqueTypes.map(type => ({
            label: type,
            data: data
              .filter(d => d.request_type === type)
              .map(d => ({ x: d.date, y: d.count })),
            borderColor: getColorForType(type),
            fill: false,
            tension: 0.2,
          }))
        : [
            {
              label: 'All Requests',
              data: data.map(d => ({ x: d.date, y: d.count })),
              borderColor: '#007aff',
              fill: false,
              tension: 0.2,
            },
          ],
  };

  const options: ChartOptions<'line'> = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM D, YYYY',
          displayFormats: { day: 'MMM D, YYYY' },
        },
        title: { display: true, text: 'Date' },
      },
      y: {
        title: { display: true, text: 'Number of Requests' },
      },
    },
    plugins: {
      tooltip: {},
      legend: { position: 'top' },
    },
  };

  const handleExport = () => {
    const fields =
      uniqueTypes.length > 0 ? ['date', 'request_type', 'count'] : ['date', 'count'];
    exportToCSV(data, fields, 'historical_requests.csv');
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

      {typesError && <div className="error">{typesError}</div>}
      {!typesLoading && (
        <Select
          isMulti
          options={types.map(t => ({ value: t, label: t }))}
          value={selectedTypes.map(t => ({ value: t, label: t }))}
          onChange={selected => setSelectedTypes(selected.map(s => s.value))}
          placeholder="Select request types..."
        />
      )}

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div>Loading historical data…</div>
      ) : (
        <Line data={chartData} options={options} />
      )}

      <button onClick={handleExport}>Export to CSV</button>
    </LiquidGlassWrapper>
  );
}
