/**
 * 顶栏功能冒烟：首页搜索 + 导航各入口可打开、无白屏。
 * 用法: node scripts/smoke-header-routes.mjs [baseUrl]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'https://helloroamly.com';

const NAV = [
  { label: '首页', path: '/' },
  { label: '管家', path: '/ai' },
  { label: '我的', path: '/profile' },
];

async function assertNoCrash(page) {
  const err = page.locator('text=页面暂时无法显示');
  await err.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
  if (await err.isVisible()) {
    throw new Error('error boundary: 页面暂时无法显示');
  }
}

/** 首页只允许顶栏一处规划搜索框，禁止地图 overlay 重复挂载 */
async function assertSingleHomeSearchInput(page) {
  const allInputs = page.locator('.home-map-trail-control__input');
  const count = await allInputs.count();
  if (count !== 1) {
    throw new Error(`首页搜索框应唯一，实际 ${count} 个 .home-map-trail-control__input`);
  }

  const headerInputs = page.locator('.home-map-trail-control--header .home-map-trail-control__input');
  if ((await headerInputs.count()) !== 1) {
    throw new Error('唯一搜索框必须在顶栏 .home-map-trail-control--header 内');
  }

  const mapOverlayInputs = page.locator(
    '#home-map-trail .home-map-trail-control__input, .home-map-trail-wall .home-map-trail-control__input',
  );
  if ((await mapOverlayInputs.count()) !== 0) {
    throw new Error('地图区域内不得出现第二套搜索框');
  }

  const nonHeaderPanels = page.locator(
    '.home-map-trail-control:not(.home-map-trail-control--header)',
  );
  if ((await nonHeaderPanels.count()) !== 0) {
    throw new Error('不得挂载 overlay/above 地图搜索面板');
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  const failures = [];

  try {
    console.log(`\n=== 顶栏冒烟 ${BASE} ===\n`);

    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await assertNoCrash(page);
    await assertSingleHomeSearchInput(page);
    console.log('✓ 首页仅 1 个顶栏搜索框（地图无重复）');

    const search = page.locator('.home-map-trail-control--header .home-map-trail-control__input').first();
    await search.waitFor({ state: 'visible', timeout: 15000 });
    await search.fill('成都');
    console.log('✓ 顶栏搜索框可见且可输入');

    const planBtn = page.locator('.home-map-trail-control--header button:has-text("一键规划")').first();
    await planBtn.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✓ 一键规划按钮可见');

    for (const item of NAV) {
      try {
        const link = page.getByRole('link', { name: item.label }).first();
        await link.click({ timeout: 10000 });
        await page.waitForURL(new RegExp(item.path === '/' ? '/$|/$' : item.path.replace(/\//g, '\\/')), {
          timeout: 15000,
        });
        await assertNoCrash(page);
        console.log(`✓ ${item.label} → ${item.path}`);
      } catch (e) {
        failures.push({ item: item.label, error: e.message });
        console.error(`✗ ${item.label}: ${e.message}`);
      }
    }

    if (failures.length) {
      process.exitCode = 1;
      console.error('\n失败项:', failures);
    } else {
      console.log('\n全部顶栏入口通过');
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
