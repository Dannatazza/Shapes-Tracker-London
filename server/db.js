const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  brand TEXT,
  name TEXT,
  address TEXT,
  lat REAL,
  lng REAL
);

CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  product TEXT,
  storeId TEXT,
  storeName TEXT,
  loggedAt TEXT
);
`);

// Seed stores if empty
const count = db.prepare('SELECT COUNT(1) as c FROM stores').get().c;
if (!count) {
  const insert = db.prepare('INSERT INTO stores (id, brand, name, address, lat, lng) VALUES (@id, @brand, @name, @address, @lat, @lng)');
  const stores = [
    { id: 'waitrose-kings-road', brand: 'Waitrose', name: "Waitrose King's Road", address: "196 King's Road, Chelsea", lat: 51.4877, lng: -0.168 },
    { id: 'waitrose-canary-wharf', brand: 'Waitrose', name: 'Waitrose Canary Wharf', address: 'Canada Square, Canary Wharf', lat: 51.5049, lng: -0.0195 },
    { id: 'waitrose-bloomsbury', brand: 'Waitrose', name: 'Waitrose Bloomsbury', address: 'The Brunswick, Bloomsbury', lat: 51.5243, lng: -0.1238 },
    { id: 'waitrose-bayswater', brand: 'Waitrose', name: 'Waitrose Bayswater', address: 'Porchester Road, Bayswater', lat: 51.5145, lng: -0.1885 },
    { id: 'waitrose-wandsworth', brand: 'Waitrose', name: 'Waitrose Wandsworth', address: 'Southside Shopping Centre, Wandsworth', lat: 51.4558, lng: -0.1939 },
    { id: 'waitrose-balham', brand: 'Waitrose', name: 'Waitrose Balham', address: 'Balham High Road', lat: 51.4431, lng: -0.1513 },
    { id: 'waitrose-finchley-road', brand: 'Waitrose', name: 'Waitrose Finchley Road', address: 'Finchley Road, Swiss Cottage', lat: 51.5432, lng: -0.1748 },
    { id: 'waitrose-westfield-stratford', brand: 'Waitrose', name: 'Waitrose Stratford City', address: 'Westfield Stratford City', lat: 51.5433, lng: -0.0077 },
    { id: 'waitrose-highbury', brand: 'Waitrose', name: 'Waitrose Highbury Corner', address: 'Highbury Corner, Islington', lat: 51.546, lng: -0.1036 },
    { id: 'waitrose-dulwich', brand: 'Waitrose', name: 'Waitrose East Dulwich', address: 'Lordship Lane, East Dulwich', lat: 51.4566, lng: -0.0757 },
    { id: 'waitrose-richmond', brand: 'Waitrose', name: 'Waitrose Richmond', address: 'Sheen Road, Richmond', lat: 51.4613, lng: -0.3035 },
    { id: 'waitrose-westfield-white-city', brand: 'Waitrose', name: 'Waitrose White City', address: 'Westfield London, White City', lat: 51.5076, lng: -0.2219 },
    { id: 'morrisons-camden', brand: 'Morrisons', name: 'Morrisons Camden', address: 'Camden Goods Yard, Chalk Farm Road', lat: 51.5417, lng: -0.148 },
    { id: 'morrisons-peckham', brand: 'Morrisons', name: 'Morrisons Peckham', address: 'Aylesham Centre, Rye Lane', lat: 51.4716, lng: -0.0692 },
    { id: 'morrisons-holloway', brand: 'Morrisons', name: 'Morrisons Holloway', address: 'Seven Sisters Road, Holloway', lat: 51.5594, lng: -0.1165 },
    { id: 'morrisons-stratford', brand: 'Morrisons', name: 'Morrisons Stratford', address: 'The Grove, Stratford', lat: 51.5421, lng: 0.0013 },
    { id: 'morrisons-acton', brand: 'Morrisons', name: 'Morrisons Acton', address: 'King Street, Acton', lat: 51.5085, lng: -0.2675 },
    { id: 'morrisons-chingford', brand: 'Morrisons', name: 'Morrisons Chingford', address: 'South Chingford', lat: 51.6072, lng: -0.0178 },
    { id: 'morrisons-erith', brand: 'Morrisons', name: 'Morrisons Erith', address: 'James Watt Way, Erith', lat: 51.4805, lng: 0.1748 },
    { id: 'morrisons-wimbledon', brand: 'Morrisons', name: 'Morrisons Wimbledon', address: 'The Broadway, Wimbledon', lat: 51.4204, lng: -0.2047 }
  ];

  const insertMany = db.transaction((items) => {
    for (const s of items) insert.run(s);
  });
  insertMany(stores);
}

function getStores() {
  return db.prepare('SELECT * FROM stores ORDER BY name').all();
}

function getRecentLogs(recentWindowMs = 24 * 60 * 60 * 1000) {
  const since = new Date(Date.now() - recentWindowMs).toISOString();
  return db.prepare('SELECT * FROM logs WHERE loggedAt >= ? ORDER BY loggedAt DESC').all(since);
}

function insertLog(log) {
  const stmt = db.prepare('INSERT OR IGNORE INTO logs (id, product, storeId, storeName, loggedAt) VALUES (@id, @product, @storeId, @storeName, @loggedAt)');
  stmt.run(log);
}

function insertLogsBatch(logs) {
  const insert = db.prepare('INSERT OR IGNORE INTO logs (id, product, storeId, storeName, loggedAt) VALUES (@id, @product, @storeId, @storeName, @loggedAt)');
  const tx = db.transaction((items) => {
    for (const l of items) insert.run(l);
  });
  tx(logs);
}

module.exports = { getStores, getRecentLogs, insertLog, insertLogsBatch };
