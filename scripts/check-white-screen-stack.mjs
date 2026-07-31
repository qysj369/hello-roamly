import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];

page.on('pageerror', (err) => {
  errors.push({ message: err.message, stack: err.stack });
});

await page.goto('https://helloroamly.com/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
console.log(JSON.stringify(errors, null, 2));
await browser.close();
