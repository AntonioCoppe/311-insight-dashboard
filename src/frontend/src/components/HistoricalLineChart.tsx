import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getHistorical, HistoricalItem } from '../api';

export function HistoricalLineChart() {
  const [data, setData] = useState<HistoricalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // last 7 days
    const end = new Date().toISOString().slice(0,10);
    const start = new Date(Date.now() - 6*24*3600*1000).toISOString().slice(0,10);
    getHistorical(start, end).then(rows => {
      setData(rows);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading historical data…</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="count" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
