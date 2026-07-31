/**
 * 线上功能键扩展冒烟
 * 用法: node scripts/smoke-features-production.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://helloroamly.com';

async function assertNoCrash(page) {
  const err = page.locator('text=页面暂时无法显示');
  if (await err.isVisible()) {
    throw new Error('error boundary: 页面暂时无法显示');
  }
}

async function ok(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    return true;
  } catch (error) {
    console.error(`✗ ${name}: ${error instanceof Error ? error.message : error}`);
    return false;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  let passed = 0;
  let failed = 0;

  console.log(`\n=== 功能键扩展冒烟 ${BASE} ===\n`);

  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await assertNoCrash(page);

  if (
    await ok('首页语音按钮已隐藏', async () => {
      if ((await page.locator('.home-map-search-voice__mic').count()) > 0) {
        throw new Error('语音按钮仍可见');
      }
    })
  ) {
    passed += 1;
  } else failed += 1;

  if (
    await ok('首页无 AI 小标', async () => {
      if ((await page.locator('.home-map-trail-control__ai-mark').count()) > 0) {
        throw new Error('AI 标仍存在');
      }
    })
  ) {
    passed += 1;
  } else failed += 1;

  if (
    await ok('顶栏搜索可输入', async () => {
      const input = page.locator('.home-map-trail-control--header .home-map-trail-control__input').first();
      await input.waitFor({ state: 'visible', timeout: 10000 });
      await input.fill('扬州 三天');
      const value = await input.inputValue();
      if (!value.includes('扬州')) {
        throw new Error('输入未生效');
      }
    })
  ) {
    passed += 1;
  } else failed += 1;

  if (
    await ok('一键规划可点击', async () => {
      const btn = page.locator('.home-map-trail-control--header button:has-text("一键规划")').first();
      await btn.waitFor({ state: 'visible', timeout: 10000 });
      if (await btn.isDisabled()) {
        throw new Error('按钮被禁用');
      }
      await btn.click();
      await page.waitForTimeout(2500);
      await assertNoCrash(page);
      const alert = page.locator('[role="alert"]');
      if (await alert.isVisible()) {
        throw new Error((await alert.innerText()).trim());
      }
    })
  ) {
    passed += 1;
  } else failed += 1;

  const pages = [
    { name: 'AI 顾问', path: '/ai' },
    { name: '发现', path: '/discover' },
    { name: '攻略', path: '/guides' },
    { name: '旅游搭子', path: '/travel-buddies' },
    { name: '消息', path: '/messages' },
    { name: '蜗居', path: '/profile' },
    { name: '关于', path: '/about' },
  ];

  for (const item of pages) {
    if (
      await ok(`${item.name}页可打开`, async () => {
        await page.goto(`${BASE}${item.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await assertNoCrash(page);
        await page.waitForSelector('body', { timeout: 10000 });
      })
    ) {
      passed += 1;
    } else failed += 1;
  }

  console.log(`\n通过 ${passed} / 失败 ${failed}`);
  await browser.close();
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
