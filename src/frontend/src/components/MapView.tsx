// @ts-nocheck
import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import axios from 'axios';
import { FeatureCollection } from '../api';
// ← point at your big file now:
import centroidData from '../data/postal_centroids_canada.json';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1) load categories
  useEffect(() => {
    axios.get<string[]>(
      `${process.env.REACT_APP_API_URL}/api/requests/types`
    )
    .then(res => {
      setTypes(res.data);
      if (res.data.length) setCategory(res.data[0]);
    })
    .catch(err => console.error('Failed to fetch types:', err));
  }, []);

  // 2) load geo features
  useEffect(() => {
    if (!category) return;
    setLoading(true);
    setError(null);

    axios.get<FeatureCollection>(
      `${process.env.REACT_APP_API_URL}/api/requests/map`,
      { params: { category, minutes: timeframe } }
    )
    .then(res => setGeo(res.data))
    .catch(() => setError('Failed to load map data'))
    .finally(() => setLoading(false));
  }, [category, timeframe]);

  if (!types.length) return <div>Loading categories…</div>;
  if (loading)       return <div>Loading map…</div>;
  if (error)         return <div>{error}</div>;
  if (!geo?.features.length) 
                     return <div>No data for selected category/timeframe.</div>;

  // filter out any postal_area we don't have centroids for
  const validFeatures = geo.features.filter(f =>
    typeof centroidData[f.properties.postal_area] !== 'undefined'
  );
  if (!validFeatures.length) {
    return <div>No mappable data (all areas missing centroids).</div>;
  }

  // compute max for marker‐sizing
  const counts   = validFeatures.map(f => f.properties.count);
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
          <select
            value={timeframe}
            onChange={e => setTimeframe(Number(e.target.value))}
          >
            {TIMEFRAMES.map(tf => (
              <option key={tf.minutes} value={tf.minutes}>
                {tf.label}
              </option>
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

        {validFeatures.map((f, i) => {
          const coord     = centroidData[f.properties.postal_area] as [number,number];
          const radius    = 5 + (f.properties.count / maxCount) * 20;
          const fillOpacity = Math.min(f.properties.count / maxCount, 0.8);

          return (
            <CircleMarker
              key={i}
              center={coord}
              radius={radius}
              pathOptions={{ color: '#007bff', fillColor: '#007bff', fillOpacity }}
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
