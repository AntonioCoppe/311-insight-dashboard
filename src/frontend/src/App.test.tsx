import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock Chart.js adapter and chart components to avoid ESM parsing issues
jest.mock('chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm', () => ({}));
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
  Bar: () => <div data-testid="bar-chart" />,
}));
jest.mock('axios');
jest.mock('./components/HistoricalLineChart', () => () => <div data-testid="historical" />);
jest.mock('./components/RecentBarChart', () => () => <div data-testid="recent" />);
jest.mock('./components/MapView', () => ({ MapView: () => <div data-testid="map" /> }));

import App from './App';

test('renders dashboard heading', () => {
  render(<App />);
  const heading = screen.getByText(/311 Insight Dashboard/i);
  expect(heading).toBeInTheDocument();
});
