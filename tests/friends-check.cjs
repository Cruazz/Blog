// Start Vite on port 5173 and set PLAYWRIGHT_MODULE if needed.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
require('node:fs').mkdirSync('scratch', { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const [id, x, y, light] of [['duck', 244, 432, true], ['rock', 416, 456, true], ['ghost', 528, 360, false]]) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
      page.setDefaultTimeout(10000);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(day => {
        localStorage.setItem('blog_reading_mode', 'false');
        localStorage.setItem('blog_theme', day ? 'light' : 'dark');
      }, light);
      await page.route('**/src/components/GameWorld.jsx*', async route => {
        const response = await route.fetch();
        const source = await response.text();
        const body = source.replace(/x: 6\.5 \* TILE_SIZE,\s*y: 11\.5 \* TILE_SIZE/, `x: ${x}, y: ${y}`);
        assert.notEqual(body, source);
        await route.fulfill({ response, body });
      });
      await page.route('**/api/**', route => route.fulfill({ json: [] }));
      await page.goto('http://127.0.0.1:5173/');
      await page.locator('.dpad-action').waitFor();
      await page.keyboard.press('e');
      await page.locator('.friend-speech').waitFor();
      if (id === 'duck') {
        assert.match(await page.locator('.friend-speech').innerText(), /responsible for this duck/);
        await page.locator('.dpad-action').click();
        assert.match(await page.locator('.friend-speech').innerText(), /wait here/);
      } else if (id === 'rock') {
        for (let i = 0; i < 3; i++) await page.keyboard.press('e');
        assert.match(await page.locator('.friend-speech').innerText(), /Bro\. I am a rock/);
      } else {
        assert.match(await page.locator('.friend-speech').innerText(), /Was that too loud/);
      }
      await page.screenshot({ path: `scratch/friend-${id}.png` });
      if (id === 'ghost') {
        await page.getByRole('button', { name: 'Switch to day theme' }).click();
        await page.locator('.friend-speech').waitFor({ state: 'detached' });
        await page.locator('.dpad-action').waitFor({ state: 'detached' });
      }
      assert.deepEqual(errors, []);
      console.log(`PASS ${id}: interaction, English dialogue${id === 'ghost' ? ', hidden in day mode' : ''}`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
