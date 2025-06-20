import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL;

export interface RecentItem { request_type: string; count: number; }
export interface HistoricalItem { date: string; request_type?: string; count: number; }
export interface Feature { type: 'Feature'; properties: { postal_area: string; count: number }; geometry: any; }
export interface FeatureCollection { type: 'FeatureCollection'; features: Feature[]; }
export interface StatusCount { status: string; count: number; }

export function getRecent(minutes = 60, types?: string[]) {
  const params: any = { minutes };
  if (types && types.length > 0) {
    params.types = types.join(',');
  }
  return axios.get<RecentItem[]>(`${BASE}/api/requests/recent`, { params }).then(res => res.data);
}

export function getHistorical(start: string, end: string, types?: string[]) {
  const params: any = { start, end };
  if (types && types.length > 0) {
    params.types = types.join(',');
  }
  return axios.get<HistoricalItem[]>(`${BASE}/api/requests/historical`, { params }).then(res => res.data);
}

export function getMapData(category: string) {
  return axios.get<FeatureCollection>(`${BASE}/api/requests/map`, { params: { category } }).then(res => res.data);
}

export function getYearlyTop(year: number) {
  return axios
    .get<RecentItem[]>(`${BASE}/api/requests/yearly_top`, { params: { year } })
    .then(res => res.data);
}

export function getStatusCounts() {
  return axios
    .get<StatusCount[]>(`${BASE}/api/requests/resolution`)
    .then(res => res.data);
}