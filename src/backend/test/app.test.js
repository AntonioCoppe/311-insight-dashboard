const request = require('supertest');
const app = require('../app');

// Basic health check
it('GET /health should return OK', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.text).toBe('OK');
});

// Invalid minutes param
it('GET /api/requests/recent with invalid minutes should return 400', async () => {
  const res = await request(app).get('/api/requests/recent?minutes=0');
  expect(res.status).toBe(400);
});

// Historical endpoint with end before start
it('GET /api/requests/historical with invalid date range returns 400', async () => {
  const res = await request(app).get('/api/requests/historical?start=2023-01-10&end=2023-01-01');
  expect(res.status).toBe(400);
});

// Map endpoint without category
it('GET /api/requests/map without category returns 400', async () => {
  const res = await request(app).get('/api/requests/map');
  expect(res.status).toBe(400);
});
