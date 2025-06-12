import React, { useState, useEffect, useCallback } from 'react';
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
import { useRequestTypes } from '../hooks/useRequestTypes';
import Select from 'react-select';
import { exportToCSV } from '../utils/exportToCSV';
import { io } from 'socket.io-client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function RecentBarChart() {
  const [data, setData] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { types, loading: typesLoading, error: typesError } = useRequestTypes();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleRecentUpdate = useCallback((updatedData: RecentItem[]) => {
    const filteredData = selectedTypes.length > 0
      ? updatedData.filter(d => selectedTypes.includes(d.request_type))
      : updatedData;
    setData(filteredData);
  }, [selectedTypes]);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000');
    socket.on('recentUpdate', handleRecentUpdate);

    return () => {
      socket.off('recentUpdate', handleRecentUpdate);
      socket.disconnect();
    };
  }, [handleRecentUpdate]);

  useEffect(() => {
    setLoading(true);
    getRecent(60, selectedTypes.length > 0 ? selectedTypes : undefined)
      .then(items => setData(items))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedTypes]);

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
      {loading ? <div>Loading recent data…</div> : <Bar data={chartData} />}
      <button onClick={() => exportToCSV(data, ['request_type', 'count'], 'recent_requests.csv')}>Export to CSV</button>
    </LiquidGlassWrapper>
  );
}