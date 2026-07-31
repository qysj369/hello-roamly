import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });

const tests = [
  'https://map.baidu.com/@12947571.96,4838236.75,21z,87t',
  'https://map.baidu.com/mobile/webapp/index/streetview',
];

for (const url of tests) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
    const imgs = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .map((i) => i.src)
        .filter((s) => s.includes('pano') || s.includes('street') || s.includes('qt='))
        .slice(0, 3),
    );
    console.log(url.slice(0, 60), 'title:', (await page.title()).slice(0, 40), 'panoImgs:', imgs.length);
  } catch (e) {
    console.log(url.slice(0, 60), 'ERR', e.message.slice(0, 80));
  }
}

await browser.close();
