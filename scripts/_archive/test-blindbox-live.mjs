import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const logs = [];
page.on('console', (msg) => logs.push(msg.text()));

await page.goto('https://helloroamly.com/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(5000);

const sparkBtn = page.locator('button[aria-label="旅行盲盒"]');
const sparkCount = await sparkBtn.count();
const sparkVisible = sparkCount > 0 ? await sparkBtn.first().isVisible() : false;

if (sparkVisible) {
  await sparkBtn.first().click({ force: true });
  await page.waitForTimeout(2000);
}

const overlay = page.locator('.blind-box-overlay');
let overlayVisible = (await overlay.count()) > 0 ? await overlay.first().isVisible() : false;
let overlayText = overlayVisible ? await overlay.first().innerText() : '';

const canvas = page.locator('canvas');
const canvasBox = await canvas.first().boundingBox().catch(() => null);
if (canvasBox) {
  await page.mouse.click(canvasBox.x + canvasBox.width * 0.52, canvasBox.y + canvasBox.height * 0.48);
  await page.waitForTimeout(2000);
}

const overlayAfterEarth = (await overlay.count()) > 0 ? await overlay.first().isVisible() : false;
const overlayTextAfter = overlayAfterEarth ? await overlay.first().innerText() : '';

console.log(
  JSON.stringify(
    {
      sparkCount,
      sparkVisible,
      overlayVisible,
      overlayAfterEarth,
      overlayText: overlayText.slice(0, 160),
      overlayTextAfter: overlayTextAfter.slice(0, 160),
      hasCapsuleClass: await page.evaluate(() =>
        document.documentElement.classList.contains('capsule-one-active'),
      ),
      indexJs: await page.evaluate(() =>
        document.querySelector('script[type="module"]')?.getAttribute('src'),
      ),
      errors: logs.filter((l) => /error/i.test(l)).slice(0, 8),
    },
    null,
    2,
  ),
);

await browser.close();
