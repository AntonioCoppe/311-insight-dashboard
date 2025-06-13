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
// Initialize Redis client
const redis = createClient({ url: process.env.REDIS_URL });

// only attach error‐handler if `on` is present
if (typeof redis.on === 'function') {
  redis.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
  });
}

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
    // allow any origin (good for local/dev)
    origin: '*',
    methods: ['GET','POST'],
    credentials: true
  }
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

// 1. Recent counts with optional types filter
app.get('/api/requests/recent', async (req, res) => {
  const minutes = parseInt(req.query.minutes || '60', 10);
  const types = req.query.types ? req.query.types.split(',') : null;
  if (isNaN(minutes) || minutes <= 0 || minutes > 1440) {
    return res.status(400).json({ error: 'minutes must be a number between 1 and 1440' });
  }

  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const cacheKey = `recent:${minutes}:${types ? types.join(',') : 'all'}`;
  try {
    const data = await withCache(cacheKey, 60, async () => {
      let query = `
        SELECT request_type, COUNT(*)::INT AS count
        FROM requests
        WHERE created_at >= $1
      `;
      const params = [since];
      if (types) {
        query += ' AND request_type = ANY($2)';
        params.push(types);
      }
      query += ' GROUP BY request_type ORDER BY count DESC';
      const { rows } = await pool.query(query, params);
      return rows;
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Historical counts with optional types filter
app.get('/api/requests/historical', async (req, res) => {
  const { start, end, types } = req.query;
  if (!dayjs(start).isValid() || !dayjs(end).isValid() || dayjs(start).isAfter(end)) {
    return res.status(400).json({ error: 'start and end must be valid dates, start ≤ end' });
  }

  const typesArray = types ? types.split(',') : null;
  const cacheKey = `historical:${start}:${end}:${types ? types : 'all'}`;
  try {
    const data = await withCache(cacheKey, 3600, async () => {
      let query;
      let params = [start, end];
      if (typesArray) {
        query = `
          SELECT DATE(created_at) AS date, request_type, COUNT(*)::INT AS count
          FROM requests
          WHERE created_at BETWEEN $1::timestamp AND $2::timestamp
          AND request_type = ANY($3)
          GROUP BY DATE(created_at), request_type
          ORDER BY date, request_type
        `;
        params.push(typesArray);
      } else {
        query = `
          SELECT DATE(created_at) AS date, COUNT(*)::INT AS count
          FROM requests
          WHERE created_at BETWEEN $1::timestamp AND $2::timestamp
          GROUP BY DATE(created_at)
          ORDER BY date
        `;
      }
      const { rows } = await pool.query(query, params);
      return rows;
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Yearly top 5 request types
app.get('/api/requests/yearly_top', async (req, res) => {
  const year = parseInt(req.query.year || new Date().getFullYear(), 10);
  if (isNaN(year) || year < 2000 || year > 2100) {
    return res.status(400).json({ error: 'year must be a valid number' });
  }
  const start = `${year}-01-01`;
  const end = `${year + 1}-01-01`;
  const cacheKey = `yearly_top:${year}`;
  try {
    const data = await withCache(cacheKey, 3600, async () => {
      const { rows } = await pool.query(
        `SELECT request_type, COUNT(*)::INT AS count
         FROM requests
         WHERE created_at >= $1::date AND created_at < $2::date
         GROUP BY request_type
         ORDER BY count DESC
         LIMIT 5`,
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

// 3. Map data (unchanged)
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

// GET /api/requests/types (unchanged)
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

// New endpoint to trigger updates (unchanged)
app.post('/update-recent', async (req, res) => {
  await broadcastRecentUpdates();
  res.send('Update triggered');
});

// Function to broadcast updates (unchanged)
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

// Health check (unchanged)
app.get('/health', (req, res) => res.send('OK'));

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
  });
  io.attach(server);
}

// Export the Express app as the module itself, so `require('../app')` is the app
module.exports = app;
// Attach additional exports as properties
module.exports.io = io;
module.exports.broadcastRecentUpdates = broadcastRecentUpdates;