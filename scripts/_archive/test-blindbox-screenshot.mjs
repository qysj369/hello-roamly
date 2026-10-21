import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto('https://helloroamly.com/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(5000);

const sparkBtn = page.locator('button[aria-label="旅行盲盒"]');
await sparkBtn.first().click({ force: true });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(outDir, 'blindbox-800ms.png'), fullPage: true });
await page.waitForTimeout(1200);
await page.screenshot({ path: path.join(outDir, 'blindbox-2000ms.png'), fullPage: true });

const states = await page.evaluate(() => ({
  overlay: !!document.querySelector('.blind-box-overlay'),
  inputOpen: !!document.querySelector('.capsule-hud-input'),
  inputVisible: !!document.querySelector('.capsule-overlay__input'),
  lock: document.querySelector('.capsule-overlay__lock')?.textContent?.trim(),
}));

console.log(JSON.stringify(states, null, 2));
await browser.close();
