import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (err) => errors.push(err.message));
await page.goto('https://helloroamly.com/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(4000);
const rootText = await page.locator('#root').innerText().catch(() => '');
console.log('rootTextLen:', rootText.length);
console.log('errors:', errors);
await browser.close();
