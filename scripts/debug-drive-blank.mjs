import { chromium } from 'playwright';

const url = process.argv[2] || 'http://127.0.0.1:4188/drive/杭州';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on('console', (msg) => console.log('CONSOLE', msg.type(), msg.text()));
page.on('pageerror', (err) => console.log('PAGEERROR', err.message));

await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(8000);

const info = await page.evaluate(() => {
  const street = document.querySelector('.holo-drive__street');
  const canvas = document.querySelector('.holo-drive__street-canvas');
  const overlay = document.querySelector('.holo-drive__street-overlay');
  const kids = canvas ? [...canvas.children].map((el) => ({
    tag: el.tagName,
    className: el.className,
    w: el.clientWidth,
    h: el.clientHeight,
  })) : [];
  return {
    street: street
      ? { w: street.clientWidth, h: street.clientHeight, html: street.className }
      : null,
    canvas: canvas
      ? { w: canvas.clientWidth, h: canvas.clientHeight, childCount: canvas.children.length, kids }
      : null,
    overlayText: overlay?.textContent?.trim() ?? null,
    hasBMap: Boolean(window.BMap?.Panorama),
    canvases: [...document.querySelectorAll('canvas')].map((c) => ({
      w: c.width,
      h: c.height,
      cw: c.clientWidth,
      ch: c.clientHeight,
    })),
  };
});

console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: 'audit-output/drive-blank-debug.png', fullPage: true });
console.log('screenshot: audit-output/drive-blank-debug.png');
await browser.close();
