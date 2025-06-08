import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getRecent, RecentItem } from '../api';

export function RecentBarChart() {
  const [data, setData] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecent(60).then(rows => {
      setData(rows);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading recent data…</div>;
  if (!data.length) return <div>No requests in the last hour.</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="request_type" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" />
      </BarChart>
    </ResponsiveContainer>
  );
}
