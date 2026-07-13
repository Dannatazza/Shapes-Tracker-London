const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

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
    if (Array.isArray(payload)) {
      db.insertLogsBatch(payload);
    } else if (payload && typeof payload === 'object') {
      db.insertLog(payload);
    } else {
      return res.status(400).json({ error: 'invalid payload' });
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'failed to insert logs' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
