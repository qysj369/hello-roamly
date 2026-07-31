import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('pageerror', (err) => {
  console.log('message:', err.message);
  console.log('stack:', err.stack);
});
await page.goto('http://127.0.0.1:5201/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
await browser.close();
