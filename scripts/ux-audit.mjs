/**
 * 全站 UX / 可访问性 / 构建合理性自动化审计
 * 用法: node scripts/ux-audit.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.argv[2] ?? 'http://49.232.221.38';
const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'audit-output');

const ROUTES = [
  { name: '首页', path: '/' },
  { name: '发现', path: '/discover' },
  { name: '攻略', path: '/guides' },
  { name: '旅游搭子', path: '/travel-buddies' },
  { name: '消息', path: '/messages' },
  { name: '蜗居', path: '/profile' },
];

const findings = [];

function add(severity, area, issue, detail = '') {
  findings.push({ severity, area, issue, detail });
}

async function auditPage(page, route) {
  const url = `${BASE}${route.path}`;
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

  const title = await page.title();
  const h1Count = await page.locator('h1').count();
  const skipLink = page.locator('a[href="#main-content"], .skip-link, text=跳到主内容').first();
  const skipVisible = await skipLink.isVisible().catch(() => false);

  if (h1Count === 0) {
    add('medium', route.name, '缺少 h1 标题', url);
  } else if (h1Count > 1) {
    add('low', route.name, `多个 h1（${h1Count} 个）`, url);
  }

  if (skipVisible) {
    add('high', route.name, '「跳到主内容」链接可见（应仅屏幕阅读器可见）', url);
  }

  const errorBoundary = page.locator('text=页面暂时无法显示');
  if (await errorBoundary.isVisible().catch(() => false)) {
    add('critical', route.name, '页面触发 Error Boundary', url);
  }

  const imagesWithoutAlt = await page.locator('img:not([alt])').count();
  if (imagesWithoutAlt > 0) {
    add('medium', route.name, `${imagesWithoutAlt} 张图片缺少 alt`, url);
  }

  const buttonsWithoutName = await page.evaluate(() => {
    return [...document.querySelectorAll('button')].filter((btn) => {
      const text = btn.textContent?.trim();
      const aria = btn.getAttribute('aria-label');
      return !text && !aria;
    }).length;
  });
  if (buttonsWithoutName > 0) {
    add('medium', route.name, `${buttonsWithoutName} 个按钮无可见文字/aria-label`, url);
  }

  const horizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
  });
  if (horizontalScroll) {
    add('high', route.name, '页面出现横向滚动条（布局溢出）', url);
  }

  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    const jsSize = resources
      .filter((r) => r.name.includes('.js'))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const cssSize = resources
      .filter((r) => r.name.includes('.css'))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0);
    return {
      domContentLoaded: nav?.domContentLoadedEventEnd,
      load: nav?.loadEventEnd,
      jsTransferKb: Math.round(jsSize / 1024),
      cssTransferKb: Math.round(cssSize / 1024),
      resourceCount: resources.length,
    };
  });

  if (perf.jsTransferKb > 800) {
    add('medium', route.name, `JS 传输体积偏大（约 ${perf.jsTransferKb} KB）`, url);
  }

  if (consoleErrors.length > 0) {
    const red = consoleErrors.filter((e) => !e.includes('Intervention') && !e.includes('Canvas2D'));
    if (red.length > 0) {
      add('high', route.name, `控制台错误 ${red.length} 条`, red.slice(0, 3).join(' | '));
    }
  }

  return { title, perf, consoleErrors };
}

async function auditDiscoverSearch(page) {
  await page.goto(`${BASE}/discover`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.setViewportSize({ width: 390, height: 844 });

  const search = page.locator('input[type="search"]').first();
  await search.waitFor({ state: 'visible', timeout: 15000 });

  const beforeScroll = await page.evaluate(() => window.scrollY);
  await search.fill('冰岛');
  await page.waitForTimeout(800);
  const afterScroll = await page.evaluate(() => window.scrollY);

  const resultHintNearSearch = await page
    .locator('section[aria-label="发现页搜索与筛选"]')
    .locator('text=/找到|条|结果|暂无/')
    .count();

  if (resultHintNearSearch === 0) {
    add(
      'high',
      '发现页',
      '搜索后搜索框附近无结果反馈',
      '用户输入「冰岛」后不知道是否生效，需滚到下方才能看到变化',
    );
  }

  const filterBadge = page.locator('button:has-text("更多筛选") span.rounded-full').first();
  const badgeVisible = await filterBadge.isVisible().catch(() => false);
  if (badgeVisible) {
    const badgeText = await filterBadge.textContent();
    add(
      'medium',
      '发现页',
      '「更多筛选」badge 与搜索条件混用',
      `搜索框输入也会显示 badge「${badgeText?.trim()}」，易误解为高级筛选已开启`,
    );
  }

  if (afterScroll > beforeScroll + 40) {
    add(
      'medium',
      '发现页',
      '输入搜索后页面自动滚动',
      `scrollY ${beforeScroll} → ${afterScroll}，打断用户继续操作筛选`,
    );
  }

  const blindBox = page.locator('text=今日盲盒');
  if (await blindBox.isVisible().catch(() => false)) {
    add(
      'medium',
      '发现页',
      '「今日盲盒」仍在线上',
      '与搜索/精选灵感功能重叠，用户反馈无实际意义',
    );
  }

  const feedCards = page.locator('[class*="masonry"], .discover-masonry, a[href*="/guides/"], a[href*="/plans/"]');
  const feedCount = await feedCards.count();
  if (feedCount === 0) {
    add('high', '发现页', '筛选后瀑布流无可见卡片', '搜索「冰岛」后下方可能没有内容展示');
  }
}

async function auditHomeSearch(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.setViewportSize({ width: 1280, height: 800 });

  const searchInputs = page.locator('.home-map-trail-control__input');
  const count = await searchInputs.count();
  if (count !== 1) {
    add('critical', '首页', `搜索框数量异常（${count}，应为 1）`, BASE);
  }

  const mapOverlaySearch = page.locator(
    '#home-map-trail .home-map-trail-control__input, .home-map-trail-wall .home-map-trail-control__input',
  );
  if ((await mapOverlaySearch.count()) > 0) {
    add('high', '首页', '地图区域存在重复搜索框', '与顶栏搜索职责重叠');
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`\n=== UX 审计 ${BASE} ===\n`);

  for (const route of ROUTES) {
    try {
      const meta = await auditPage(page, route);
      console.log(`✓ ${route.name} — ${meta.title} (JS ~${meta.perf.jsTransferKb}KB)`);
    } catch (error) {
      add('critical', route.name, '页面加载失败', error.message);
      console.error(`✗ ${route.name}: ${error.message}`);
    }
  }

  try {
    await auditDiscoverSearch(page);
    console.log('✓ 发现页搜索交互审计完成');
  } catch (error) {
    add('critical', '发现页', '搜索交互审计失败', error.message);
    console.error(`✗ 发现页搜索: ${error.message}`);
  }

  try {
    await auditHomeSearch(page);
    console.log('✓ 首页搜索布局审计完成');
  } catch (error) {
    add('critical', '首页', '搜索布局审计失败', error.message);
  }

  await browser.close();

  const report = {
    baseUrl: BASE,
    auditedAt: new Date().toISOString(),
    summary: {
      critical: findings.filter((f) => f.severity === 'critical').length,
      high: findings.filter((f) => f.severity === 'high').length,
      medium: findings.filter((f) => f.severity === 'medium').length,
      low: findings.filter((f) => f.severity === 'low').length,
    },
    findings,
  };

  const reportPath = path.join(OUT_DIR, 'ux-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n--- 问题汇总 ---\n');
  for (const f of findings) {
    console.log(`[${f.severity.toUpperCase()}] ${f.area}: ${f.issue}`);
    if (f.detail) {
      console.log(`    ${f.detail}`);
    }
  }

  console.log(`\n报告已写入: ${reportPath}`);
  console.log(
    `合计: critical=${report.summary.critical} high=${report.summary.high} medium=${report.summary.medium} low=${report.summary.low}`,
  );

  if (report.summary.critical > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
