const { chromium } = require('playwright');
const path = require('path');
const { spawn } = require('child_process');

function startServer() {
  const server = spawn('node', ['server/index.js'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('server start timeout')), 10000);
    server.stdout.on('data', (d) => {
      const s = d.toString();
      if (s.includes('Server listening on')) {
        clearTimeout(timeout);
        resolve(server);
      }
    });
    server.stderr.on('data', (d) => {
      // forward errors but don't fail immediately
      console.error('SERVER_ERR', d.toString());
    });
  });
}

(async () => {
  let serverProc;
  try {
    serverProc = await startServer();

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    const base = 'http://localhost:3000';

    // Seed server logs via API
    const now = new Date().toISOString();
    const logs = [
      {
        id: 'waitrose-kings-road-arnotts-chicken-0',
        product: "Arnott's Shapes Chicken",
        storeId: 'waitrose-kings-road',
        storeName: "Waitrose King's Road",
        loggedAt: now,
      },
    ];

    const post = await page.request.post(base + '/api/logs', { data: logs });
    if (post.status() >= 400) {
      console.error('POST_FAILED', await post.text());
      process.exitCode = 2;
      await browser.close();
      return;
    }

    await page.goto(base + '/', { waitUntil: 'load', timeout: 15000 });
    await page.waitForSelector('#map', { timeout: 5000 });

    // Wait for an in-stock marker to appear
    await page.waitForSelector('.store-marker.in-stock', { timeout: 5000 });
    const marker = await page.$('.store-marker.in-stock');
    if (!marker) {
      console.error('NO_IN_STOCK_MARKER');
      process.exitCode = 2;
      return;
    }

    // Click the marker
    await marker.click({ force: true });

    // Wait for popup flavour list
    await page.waitForSelector('.popup-flavour-list li', { timeout: 5000 });
    const flavours = await page.$$eval('.popup-flavour-list li strong', (els) => els.map((e) => e.textContent.trim()));
    console.log('FLAVOURS=' + flavours.join(','));

    await browser.close();
  } catch (err) {
    console.error('SMOKE_CLICK_ERROR', err.toString());
    process.exitCode = 2;
  } finally {
    if (serverProc) serverProc.kill();
  }
})();
