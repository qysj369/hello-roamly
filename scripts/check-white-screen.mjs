import { chromium } from 'playwright';

const urls = [
  'https://helloroamly.com/',
  'http://49.232.221.38/',
  'http://127.0.0.1:5199/',
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const url of urls) {
  const errors = [];
  const failed = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`PAGEERROR: ${err.message}`));
  page.on('requestfailed', (req) => failed.push(`${req.url()} -> ${req.failure()?.errorText}`));

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    const rootText = await page.locator('#root').innerText().catch(() => '');
    const rootHtml = await page.locator('#root').innerHTML().catch(() => '');
    const title = await page.title();
    console.log(`\n=== ${url} ===`);
    console.log('title:', title);
    console.log('rootTextLen:', rootText.length, rootText.slice(0, 120));
    console.log('rootHtmlLen:', rootHtml.length);
    console.log('errors:', errors.slice(0, 8));
    console.log('failed:', failed.slice(0, 8));
  } catch (e) {
    console.log(`\n=== ${url} ===`);
    console.log('NAV_FAIL:', e.message);
    console.log('errors:', errors.slice(0, 8));
    console.log('failed:', failed.slice(0, 8));
  }
}

await browser.close();
