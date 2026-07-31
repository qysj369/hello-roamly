import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://127.0.0.1:5203/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);
const sceneBox = await page.locator('.capsule-scene').boundingBox();
const homeBox = await page.locator('.capsule-one-home').boundingBox();
console.log('scene:', sceneBox);
console.log('home:', homeBox);
await browser.close();
