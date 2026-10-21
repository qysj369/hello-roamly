import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://127.0.0.1:5199';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
const entry = page.getByRole('button', { name: '登上蜗牛号' });
await entry.waitFor({ timeout: 20000 });
await entry.click();
await page.getByRole('heading', { name: '选择航线' }).waitFor({ timeout: 8000 });
const fromValue = await page.locator('#snail-flight-from').inputValue();
const toValue = await page.locator('#snail-flight-to').inputValue();
await page.getByRole('button', { name: '确认航线，登机' }).click();
await page.waitForURL(/snail-flight/, { timeout: 15000 });

const canvas = page.locator('.snail-flight__canvas canvas, .cesium-widget canvas').first();
await canvas.waitFor({ timeout: 45000 });
const caption = page.locator('.snail-flight__captions');
await caption.waitFor({ timeout: 8000 });
const takeoffText = (await caption.innerText()).replace(/\s+/g, '');
await page.getByRole('button', { name: '关闭字幕' }).click();
const captionsHidden = await caption.evaluate((node) => node.hasAttribute('hidden') || node.hidden);
await page.getByRole('button', { name: '显示字幕' }).click();
const disclaimer = await page.locator('.snail-flight__disclaimer').innerText();
await page.getByRole('button', { name: '退出' }).click();
await page.waitForURL((url) => url.pathname === '/', { timeout: 10000 });
const backHome = await page.getByRole('button', { name: '登上蜗牛号' }).isVisible();

const report = {
  fromValue,
  toValue,
  takeoffText,
  captionsHidden,
  disclaimer,
  backHome,
  errors: errors.slice(0, 12),
};

const checks = [
  ['首页入口可点', true],
  ['默认济南历下', fromValue === 'jinan-lixia'],
  ['默认青岛', toValue === 'qingdao'],
  ['起飞字幕', takeoffText.includes('济南历下') || takeoffText.includes('登机完毕')],
  ['可关闭字幕', captionsHidden === true],
  ['免责声明', disclaimer.includes('观光模拟')],
  ['退出回首页', backHome === true],
];

for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
}
console.log(JSON.stringify(report, null, 2));
const failed = checks.some(([, ok]) => !ok);
await browser.close();
process.exit(failed ? 1 : 0);
