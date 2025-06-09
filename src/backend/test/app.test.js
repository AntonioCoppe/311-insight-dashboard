// src/backend/__tests__/app.test.js
// Mocks for PostgreSQL
jest.mock('pg', () => {
  const mPool = { query: jest.fn() };
  return { Pool: jest.fn(() => mPool) };
});

// Mocks for Redis
jest.mock('redis', () => ({ createClient: jest.fn() }));

const { createClient } = require('redis');
const redisMock = { connect: jest.fn(), get: jest.fn(), setEx: jest.fn() };
createClient.mockReturnValue(redisMock);

const { Pool } = require('pg');
const poolMock = new Pool();

const request = require('supertest');
const app = require('../app');

describe('🚀 API Endpoints', () => {
  beforeEach(() => {
    poolMock.query.mockReset();
    redisMock.get.mockReset();
    redisMock.setEx.mockReset();
  });

  test('GET /health → 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');
  });

  test('GET /api/requests/types returns list of types', async () => {
    poolMock.query.mockResolvedValueOnce({
      rows: [{ request_type: 'A' }, { request_type: 'B' }]
    });
    const res = await request(app).get('/api/requests/types');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(['A', 'B']);
  });

  test('GET /api/requests/recent?minutes=30 returns counts', async () => {
    // cache miss
    redisMock.get.mockResolvedValueOnce(null);
    poolMock.query.mockResolvedValueOnce({
      rows: [{ request_type: 'X', count: 5 }]
    });
    const res = await request(app).get('/api/requests/recent?minutes=30');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ request_type: 'X', count: 5 }]);
    expect(redisMock.setEx).toHaveBeenCalled();
  });

  test('GET /api/requests/recent?minutes=0 → 400 validation', async () => {
    const res = await request(app).get('/api/requests/recent?minutes=0');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /api/requests/map?category=Graffiti returns geoJSON', async () => {
    poolMock.query.mockResolvedValueOnce({
      rows: [
        { postal_area: 'M5V', count: 3 },
        { postal_area: 'M8Y', count: 7 }
      ]
    });
    const res = await request(app).get('/api/requests/map?category=Graffiti');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { postal_area: 'M5V', count: 3 }, geometry: null },
        { type: 'Feature', properties: { postal_area: 'M8Y', count: 7 }, geometry: null }
      ]
    });
  });

  test('GET /api/requests/map missing category → 400', async () => {
    const res = await request(app).get('/api/requests/map');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
