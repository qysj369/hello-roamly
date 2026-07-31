import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto('https://helloroamly.com/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(5000);

const canvas = page.locator('canvas');
const canvasBox = await canvas.first().boundingBox();
if (canvasBox) {
  await page.mouse.click(canvasBox.x + canvasBox.width * 0.52, canvasBox.y + canvasBox.height * 0.48);
  await page.waitForTimeout(2500);
}

const overlay = page.locator('.blind-box-overlay');
const overlayVisible = (await overlay.count()) > 0 ? await overlay.first().isVisible() : false;
const overlayText = overlayVisible ? await overlay.first().innerText() : '';
const lockLabel = await page.locator('.capsule-overlay__lock').textContent().catch(() => null);

console.log(
  JSON.stringify(
    {
      earthClickOnly: true,
      overlayVisible,
      overlayText: overlayText.slice(0, 160),
      lockLabel,
    },
    null,
    2,
  ),
);

await browser.close();
