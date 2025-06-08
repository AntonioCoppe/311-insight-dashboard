import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL;

export interface RecentItem { request_type: string; count: number; }
export interface HistoricalItem { date: string; count: number; }
export interface Feature { type: 'Feature'; properties: { postal_area: string; count: number }; geometry: any; }
export interface FeatureCollection { type: 'FeatureCollection'; features: Feature[]; }

export function getRecent(minutes = 60) {
  return axios
    .get<RecentItem[]>(`${BASE}/requests/recent`, { params: { minutes } })
    .then(res => res.data);
}

export function getHistorical(start: string, end: string) {
  return axios
    .get<HistoricalItem[]>(`${BASE}/requests/historical`, { params: { start, end } })
    .then(res => res.data);
}

export function getMapData(category: string) {
  return axios
    .get<FeatureCollection>(`${BASE}/requests/map`, { params: { category } })
    .then(res => res.data);
}
