// Start Vite on port 5173; set PLAYWRIGHT_MODULE if Playwright is not on NODE_PATH.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => console.error(error.message));
    await page.addInitScript(() => {
      localStorage.setItem('blog_reading_mode', 'false');
      localStorage.setItem('blog_theme', 'light');
      const draw = CanvasRenderingContext2D.prototype.fillRect;
      CanvasRenderingContext2D.prototype.fillRect = function (x, y, w, h) {
        if (this.fillStyle === '#3da35d' && w === 12 && h === 11) window.playerX = x + 6;
        return draw.call(this, x, y, w, h);
      };
    });
    // Place the player beside the Scholar so the check does not depend on walking across the map.
    await page.route('**/src/components/GameWorld.jsx*', async route => {
      const response = await route.fetch();
      const source = await response.text();
      const body = source.replace(/x: 6\.5 \* TILE_SIZE,\s*y: 11\.5 \* TILE_SIZE/, 'x: 100, y: 176');
      assert.notEqual(body, source, 'Spawn fixture must be applied');
      await route.fulfill({ response, body });
    });
    await page.route('**/api/**', route => route.fulfill({ json: [] }));
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForFunction(() => window.playerX === 100);
    await page.keyboard.down('ArrowRight');
    await page.locator('.interact-message').waitFor();
    await page.waitForFunction(() => window.playerX > 178);
    await page.keyboard.up('ArrowRight');
    await page.locator('.interact-message').waitFor({ state: 'detached' });
    await page.keyboard.down('ArrowLeft');
    await page.waitForFunction(() => window.playerX < 155);
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.press('e');
    await page.locator('.scholar-dialogue-box').waitFor();
    console.log('PASS: one held key crosses the E interaction radius without stopping; E still opens Scholar');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
