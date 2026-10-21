import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://127.0.0.1:5199';
const MIN_DISTANCE = 7.5;
const TARGET_Y = 0.55;

function latLngFromOffset(x, y, z) {
  const r = Math.hypot(x, y, z) || 1;
  const lat = (Math.asin(y / r) * 180) / Math.PI;
  let lng = (Math.atan2(z, -x) * 180) / Math.PI - 180;
  if (lng > 180) lng -= 360;
  if (lng < -180) lng += 360;
  return { lat, lng, radius: r };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.locator('.earth-fly-to').waitFor({ timeout: 20000 });
await page.waitForTimeout(2200);

async function canvasHasGlobe() {
  const buf = await page.locator('canvas').first().screenshot();
  let min = 255;
  let max = 0;
  for (let i = 0; i + 3 < buf.length; i += 64) {
    const lum = (buf[i] + buf[i + 1] + buf[i + 2]) / 3;
    min = Math.min(min, lum);
    max = Math.max(max, lum);
  }
  return { ok: max - min > 18, min, max, reason: max - min > 18 ? 'globe' : 'flat' };
}

const labels = await page.locator('.earth-fly-to__btn').allInnerTexts();
const roamBefore = await page.locator('.earth-roam-toggle').textContent();

async function cameraLook() {
  return page.evaluate(({ targetY }) => {
    const canvas = document.querySelector('canvas');
    const camera = canvas?.__capsule?.camera;
    if (!camera) return null;
    const { x, y, z } = camera.position;
    return { x, y, z, targetY };
  }, { targetY: TARGET_Y });
}

function lookOf(sample) {
  if (!sample) return null;
  return latLngFromOffset(sample.x, sample.y - sample.targetY, sample.z);
}

const globeBefore = await canvasHasGlobe();
const start = lookOf(await cameraLook());

await page.getByRole('button', { name: '巴黎' }).click();
const parisSamples = [];
for (let i = 0; i < 18; i += 1) {
  await page.waitForTimeout(180);
  const look = lookOf(await cameraLook());
  if (look) parisSamples.push(look);
}
const parisEnd = parisSamples.at(-1);
const globeAfterParis = await canvasHasGlobe();
const parisPanel = page.locator('.earth-fly-card');
await parisPanel.waitFor({ timeout: 4000 });
const parisPanelText = (await parisPanel.innerText()).replace(/\s+/g, '');
const generateVisible = await page.getByRole('button', { name: '生成旅行行程' }).isVisible();
await page.getByRole('button', { name: '生成旅行行程' }).click();
await page.getByRole('button', { name: '正在生成行程…' }).waitFor({ timeout: 4000 });
await page
  .locator('.earth-fly-card__plan, .earth-fly-card__action:not([disabled])')
  .first()
  .waitFor({ timeout: 90000 });
const afterGenerate = (await parisPanel.innerText()).replace(/\s+/g, '');
const generateSettled =
  afterGenerate.includes('塞纳') ||
  afterGenerate.includes('再试一次') ||
  Boolean(await page.locator('.earth-fly-card__plan').count());
await page.getByRole('button', { name: '关闭' }).click();
const parisPanelClosed = (await page.locator('.earth-fly-card').count()) === 0;

await page.getByRole('button', { name: '拉萨' }).click();
await page.waitForTimeout(280);
const beforeDrag = lookOf(await cameraLook());
const canvasBox = await page.locator('canvas').first().boundingBox();
if (!canvasBox) {
  throw new Error('canvas missing');
}
await page.mouse.move(canvasBox.x + canvasBox.width * 0.55, canvasBox.y + canvasBox.height * 0.48);
await page.mouse.down();
await page.mouse.move(canvasBox.x + canvasBox.width * 0.72, canvasBox.y + canvasBox.height * 0.42, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(2400);
const afterDrag = lookOf(await cameraLook());
const lhasaTarget = { lat: 29.65, lng: 91.12 };
const panelGoneAfterDrag = (await page.locator('.earth-fly-card').count()) === 0;

await page.getByRole('button', { name: '里约热内卢' }).click();
await page.locator('.earth-fly-card').waitFor({ timeout: 7000 });
const rioPanelText = (await page.locator('.earth-fly-card').innerText()).replace(/\s+/g, '');
await page.mouse.move(canvasBox.x + canvasBox.width * 0.5, canvasBox.y + canvasBox.height * 0.5);
await page.mouse.down();
await page.mouse.move(canvasBox.x + canvasBox.width * 0.38, canvasBox.y + canvasBox.height * 0.58, {
  steps: 8,
});
await page.mouse.up();
await page.waitForTimeout(200);
const rioPanelClosedByDrag = (await page.locator('.earth-fly-card').count()) === 0;

await page.getByRole('button', { name: '开启漫游' }).click();
await page.waitForTimeout(400);
const roamAfter = await page.locator('.earth-roam-toggle').textContent();
await page.getByRole('button', { name: '停止漫游' }).click();

const minRadius = Math.min(...parisSamples.map((item) => item.radius));
const maxStep = parisSamples.slice(1).reduce((max, item, index) => {
  const prev = parisSamples[index];
  const step = Math.hypot(item.lat - prev.lat, item.lng - prev.lng);
  return Math.max(max, step);
}, 0);

const dragCancelled =
  Math.hypot((afterDrag?.lat ?? 0) - lhasaTarget.lat, (afterDrag?.lng ?? 0) - lhasaTarget.lng) > 12;

const report = {
  labels,
  roamBefore,
  roamAfter,
  globeBefore,
  globeAfterParis,
  start,
  parisEnd,
  beforeDrag,
  afterDrag,
  minRadius,
  maxStep,
  dragCancelled,
  parisPanelText,
  generateVisible,
  generateSettled,
  parisPanelClosed,
  panelGoneAfterDrag,
  rioPanelText,
  rioPanelClosedByDrag,
  errors,
};

const checks = [
  ['地球画面可见', globeBefore.ok === true],
  ['飞到巴黎后地球仍可见', globeAfterParis.ok === true],
  ['三个目的地按钮', labels.join('|') === '巴黎|拉萨|里约热内卢'],
  ['漫游开关仍在', roamBefore?.includes('开启漫游') === true],
  ['飞向巴黎对准北纬西欧', Boolean(parisEnd && Math.abs(parisEnd.lat - 48.8566) < 3 && Math.abs(parisEnd.lng - 2.3522) < 3)],
  ['镜头离开起始中国视角', Boolean(start && parisEnd && Math.abs(parisEnd.lng - start.lng) > 40)],
  ['飞行无瞬移', maxStep < 25],
  ['最低离地距离', minRadius >= MIN_DISTANCE - 0.05],
  ['拖拽中断拉萨飞行', dragCancelled],
  ['飞抵后弹出巴黎文案', parisPanelText.includes('巴黎') && parisPanelText.includes('塞纳河')],
  ['面板带生成行程按钮', generateVisible === true],
  ['生成后有行程或可重试', generateSettled === true],
  ['点击关闭可收起面板', parisPanelClosed],
  ['拖拽中断后面板不出现', panelGoneAfterDrag],
  ['飞抵里约弹出文案', rioPanelText.includes('里约热内卢') && rioPanelText.includes('大西洋')],
  ['抵达后拖拽关闭面板', rioPanelClosedByDrag],
  ['漫游可再开启', roamAfter?.includes('停止漫游') === true],
  ['控制台无报错', errors.length === 0],
];

for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
}
console.log(JSON.stringify(report, null, 2));

const failed = checks.some(([, ok]) => !ok);
await browser.close();
process.exit(failed ? 1 : 0);
