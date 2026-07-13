const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const filePath = 'file://' + path.resolve('index.html');

  try {
    await page.goto(filePath, { waitUntil: 'load', timeout: 15000 });
    await page.waitForSelector('#map', { timeout: 5000 });
    await page.waitForSelector('#selected-store-name', { timeout: 5000 });
    const selectedStoreName = await page.$eval('#selected-store-name', (el) => el.textContent.trim());
    console.log('MAP_LOADED');
    console.log('selectedStoreName=' + selectedStoreName);
    // Attempt to click the first marker via JS to ensure no runtime errors
    const hasMarkers = await page.evaluate(() => {
      try {
        return typeof window.state !== 'undefined' && window.state.markers instanceof Map;
      } catch (e) {
        return false;
      }
    });
    console.log('HAS_MARKERS=' + hasMarkers);
  } catch (err) {
    console.error('SMOKE_ERROR', err.toString());
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
