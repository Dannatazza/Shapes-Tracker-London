const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// Simple in-memory rate limiter per IP: sliding window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 300; // max requests per window per IP
const ipHits = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  const hits = ipHits.get(ip) || [];
  const recent = hits.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  ipHits.set(ip, recent);
  if (recent.length > RATE_LIMIT_MAX) {
    res.status(429).json({ error: 'rate limit exceeded' });
    return;
  }
  next();
}

// apply rate limiter to write endpoints
app.use('/api/logs', rateLimit);

app.get('/api/stores', (req, res) => {
  try {
    const stores = db.getStores();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: 'failed to load stores' });
  }
});

app.get('/api/logs', (req, res) => {
  try {
    const recentHours = Number(req.query.hours) || 24;
    const recentMs = recentHours * 60 * 60 * 1000;
    const logs = db.getRecentLogs(recentMs);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'failed to load logs' });
  }
});

app.post('/api/logs', (req, res) => {
  try {
    const payload = req.body;
    let inserted = 0;
    if (Array.isArray(payload)) {
      // insert only non-duplicates within dedupe window
      db.insertLogsBatch(payload);
      inserted = payload.length; // approximate; db dedupes internally
    } else if (payload && typeof payload === 'object') {
      const ok = db.insertLog(payload);
      inserted = ok ? 1 : 0;
    } else {
      return res.status(400).json({ error: 'invalid payload' });
    }

    res.status(201).json({ ok: true, inserted });
  } catch (err) {
    res.status(500).json({ error: 'failed to insert logs' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
