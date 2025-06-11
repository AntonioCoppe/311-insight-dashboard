require('dotenv').config({ path: __dirname + '/.env' });
console.log('Loaded REDIS_URL:', process.env.REDIS_URL); // Debug log
const express = require('express');
const { Pool } = require('pg');
const { createClient } = require('redis');
const dayjs = require('dayjs');
const cors = require('cors');
const { Server } = require('socket.io');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Redis client
const redis = createClient({ url: process.env.REDIS_URL });

redis.on('error', (err) => {
  console.error('Redis Client Error:', err.message);
});

// Ensure Redis is connected before proceeding
async function initializeRedis() {
  try {
    await redis.connect();
    console.log('Redis connected successfully');
  } catch (err) {
    console.error('Failed to connect to Redis:', err.message);
    process.exit(1); // Exit if Redis connection fails
  }
}

initializeRedis();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const io = new Server({
  cors: {
    origin: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});

async function withCache(key, ttlSeconds, fetchFn) {
  if (!redis.isOpen) {
    await initializeRedis(); // Reconnect if not open
  }
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  const fresh = await fetchFn();
  await redis.setEx(key, ttlSeconds, JSON.stringify(fresh)); // Ensure async
  return fresh;
}

// 1. Recent counts
app.get('/api/requests/recent', async (req, res) => {
  const minutes = parseInt(req.query.minutes || '60', 10);
  if (isNaN(minutes) || minutes <= 0 || minutes > 1440) {
    return res.status(400).json({ error: 'minutes must be a number between 1 and 1440' });
  }

  const cacheKey = `recent:${minutes}`;
  try {
    const data = await withCache(cacheKey, 60, async () => {
      const { rows } = await pool.query(
        `SELECT request_type, COUNT(*)::INT AS count
         FROM requests
         WHERE created_at >= NOW() - INTERVAL '${minutes} minutes'
         GROUP BY request_type
         ORDER BY count DESC`
      );
      return rows;
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Historical counts
app.get('/api/requests/historical', async (req, res) => {
  const { start, end } = req.query;
  if (!dayjs(start).isValid() || !dayjs(end).isValid() || dayjs(start).isAfter(end)) {
    return res.status(400).json({ error: 'start and end must be valid dates, start ≤ end' });
  }

  const cacheKey = `historical:${start}:${end}`;
  try {
    const data = await withCache(cacheKey, 3600, async () => {
      const { rows } = await pool.query(
        `SELECT DATE(created_at) AS date, COUNT(*)::INT AS count
         FROM requests
         WHERE created_at BETWEEN $1::timestamp AND $2::timestamp
         GROUP BY DATE(created_at)
         ORDER BY date`,
        [start, end]
      );
      return rows;
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Map data
app.get('/api/requests/map', async (req, res) => {
  const category = req.query.category;
  if (!category) {
    return res.status(400).json({ error: 'category query parameter is required' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT postal_area, COUNT(*)::INT AS count
       FROM requests
       WHERE request_type = $1
       GROUP BY postal_area`,
      [category]
    );
    res.json({
      type: 'FeatureCollection',
      features: rows.map(r => ({
        type: 'Feature',
        properties: { postal_area: r.postal_area, count: r.count },
        geometry: null
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/requests/types
app.get('/api/requests/types', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT request_type
      FROM requests
      ORDER BY request_type
    `);
    res.json(rows.map(r => r.request_type));
  } catch (err) {
    console.error('Error fetching types:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New endpoint to trigger updates
app.post('/update-recent', async (req, res) => {
  await broadcastRecentUpdates();
  res.send('Update triggered');
});

// Function to broadcast updates
async function broadcastRecentUpdates(minutes = 60) {
  if (!redis.isOpen) {
    await initializeRedis(); // Reconnect if not open
  }
  await withCache(`recent:${minutes}`, 60, async () => {
    const { rows } = await pool.query(
      `SELECT request_type, COUNT(*)::INT AS count
       FROM requests
       WHERE created_at >= NOW() - INTERVAL '${minutes} minutes'
       GROUP BY request_type
       ORDER BY count DESC`
    );
    io.emit('recentUpdate', rows);
  });
}

// Health check
app.get('/health', (req, res) => res.send('OK'));

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
  });
  io.attach(server);
}

module.exports = { app, io, broadcastRecentUpdates };