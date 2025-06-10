// @ts-nocheck
import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import { FeatureCollection } from '../api';
import centroidData from '../data/postal_centroids.json';
import LiquidGlassWrapper from './LiquidGlassWrapper';

const TIMEFRAMES = [
  { label: 'Last 1 hour', minutes: 60 },
  { label: 'Last 6 hours', minutes: 360 },
  { label: 'Last 12 hours', minutes: 720 },
  { label: 'Last 24 hours', minutes: 1440 },
  { label: 'Last 7 days', minutes: 10080 },
];

const DEFAULT_CENTER: [number, number] = [43.65, -79.38];

export function MapView() {
  const [types, setTypes] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');
  const [timeframe, setTimeframe] = useState<number>(TIMEFRAMES[0].minutes);
  const [geo, setGeo] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load available categories
  useEffect(() => {
    axios.get<string[]>(`${process.env.REACT_APP_API_URL}/requests/types`)
      .then(res => {
        setTypes(res.data);
        if (res.data.length) setCategory(res.data[0]);
      })
      .catch(err => console.error('Failed to fetch types:', err));
  }, []);

  // Load geo data when category or timeframe changes
  useEffect(() => {
    if (!category) return;
    setLoading(true);
    setError(null);
    axios.get<FeatureCollection>(
      `${process.env.REACT_APP_API_URL}/requests/map`,
      { params: { category, minutes: timeframe } }
    )
    .then(res => setGeo(res.data))
    .catch(err => {
      console.error('Error loading map data:', err);
      setError('Failed to load map data');
    })
    .finally(() => setLoading(false));
  }, [category, timeframe]);

  if (!types.length) return <div>Loading categories…</div>;
  if (loading) return <div>Loading map…</div>;
  if (error) return <div>{error}</div>;
  if (!geo?.features.length) return <div>No data for selected category/timeframe.</div>;

  // Determine max count for scaling
  const counts = geo.features.map(f => f.properties.count);
  const maxCount = Math.max(...counts, 1);

  return (
    <LiquidGlassWrapper className="map-card">
      <div className="map-controls">
        <label>
          Category:&nbsp;
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        &nbsp;&nbsp;
        <label>
          Timeframe:&nbsp;
          <select value={timeframe} onChange={e => setTimeframe(Number(e.target.value))}>
            {TIMEFRAMES.map(tf => (
              <option key={tf.minutes} value={tf.minutes}>{tf.label}</option>
            ))}
          </select>
        </label>
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={11}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geo.features.map((f, i) => {
          const coord = centroidData[f.properties.postal_area] || DEFAULT_CENTER;
          const radius = 5 + (f.properties.count / maxCount) * 20;
          const fillOpacity = Math.min(f.properties.count / maxCount, 0.8);
          return (
            <CircleMarker
              key={i}
              center={coord}
              radius={radius}
              pathOptions={{ fillOpacity, color: '#007bff', fillColor: '#007bff' }}
            >
              <Popup>
                {f.properties.postal_area}: {f.properties.count}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </LiquidGlassWrapper>
  );
}
