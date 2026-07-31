import { chromium } from 'playwright';

const AK = 'E4805d16520de693a3fe707cdc962045';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
const logs = [];
page.on('console', (m) => logs.push(m.text()));
page.on('pageerror', (e) => logs.push('ERR:' + e.message));
page.on('response', (r) => {
  if (r.url().includes('map.baidu.com') && r.status() >= 400) {
    logs.push('HTTP ' + r.status() + ' ' + r.url().slice(0, 100));
  }
});

await page.goto(`https://api.map.baidu.com/api?v=3.0&ak=${AK}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);
const body = await page.content();
console.log('body len', body.length, 'has BMap', body.includes('BMap'));

await page.goto('about:blank');
await page.setContent('<div id="p" style="width:900px;height:600px"></div>');
const resp = await page.addScriptTag({ url: `https://api.map.baidu.com/api?v=3.0&ak=${AK}` });
console.log('script added', resp ? 'ok' : 'fail');
await page.waitForTimeout(5000);
const hasBMap = await page.evaluate(() => ({
  bmap: typeof window.BMap,
  keys: window.BMap ? Object.keys(window.BMap).slice(0, 20) : [],
  panorama: typeof window.BMap?.Panorama,
}));
console.log(JSON.stringify(hasBMap, null, 2));
console.log('logs', logs.slice(0, 15));
await browser.close();
