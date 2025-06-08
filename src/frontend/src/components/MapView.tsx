// src/components/MapView.tsx
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import { FeatureCollection } from '../api';

const TIMEFRAMES = [
  { label: 'Last 1 hour', minutes: 60 },
  { label: 'Last 6 hours', minutes: 360 },
  { label: 'Last 12 hours', minutes: 720 },
  { label: 'Last 24 hours', minutes: 1440 },
  { label: 'Last 7 days', minutes: 10080 },
];

export function MapView() {
  const [geo, setGeo] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[0].minutes);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get<FeatureCollection>(
      `${process.env.REACT_APP_API_URL}/requests/map`,
      { params: { category: 'Graffiti', minutes: timeframe } }
    )
    .then(res => {
      setGeo(res.data);
    })
    .catch(err => {
      console.error(err);
      setError('Failed to load map data');
    })
    .finally(() => setLoading(false));
  }, [timeframe]);

  if (loading) return <div>Loading map…</div>;
  if (error) return <div>{error}</div>;
  if (!geo?.features.length) return <div>No data for selected timeframe.</div>;

  return (
    <div>
      <label>
        Timeframe:&nbsp;
        <select value={timeframe} onChange={e => setTimeframe(Number(e.target.value))}>
          {TIMEFRAMES.map(tf => (
            <option key={tf.minutes} value={tf.minutes}>{tf.label}</option>
          ))}
        </select>
      </label>

      <MapContainer
        center={[43.65, -79.38]}
        zoom={11}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geo.features.map((f, i) => (
          <CircleMarker
            key={i}
            center={[43.65, -79.38]}
            radius={5 + f.properties.count / 50}
          >
            <Popup>
              {f.properties.postal_area}: {f.properties.count}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
