import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });

for (const city of ['成都', '济南']) {
  await page.goto('http://127.0.0.1:4177/drive/' + encodeURIComponent(city), {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForTimeout(city === '成都' ? 12000 : 3000);
  const overlay = await page.locator('.holo-drive__street-overlay, .holo-drive__panel h2').first().textContent().catch(() => null);
  const hasPano = await page.locator('.holo-drive__street-canvas canvas').count();
  console.log(city, { overlay: overlay?.trim(), canvasCount: hasPano });
  await page.screenshot({ path: `scripts/drive-${city}.png` });
}

await browser.close();
