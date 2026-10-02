import { BRAND_DOMAIN, BRAND_NAME, BRAND_NAME_EN } from '@/lib/config/brandCopy';
import { SITE_SHARE_REFERENCE_LINE } from '@/lib/config/siteCompliance';
import { withBrandShareTitle } from '@/lib/config/brandMindshare';
import { searchPlanCatchyTitle, searchPlanHeaderLine, searchPlanLocalBudgetLabel } from '@/lib/home/searchPlanShareCopy';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export function searchPlanBudgetLabel(plan: SearchStructuredPlan): string {
  return searchPlanLocalBudgetLabel(plan);
}

export function searchPlanShareTitle(plan: SearchStructuredPlan): string {
  return withBrandShareTitle(searchPlanCatchyTitle(plan).replace(/[《》]/g, ''));
}

/** 行程卡片 → 纯文本，供复制 / 系统分享（不含推销词） */
export function formatSearchPlanCopyText(plan: SearchStructuredPlan): string {
  const { baseInfo, budgetList, dayList, globalTips } = plan;
  const lines: string[] = [
    searchPlanCatchyTitle(plan),
    searchPlanHeaderLine(plan),
    `出发：${baseInfo.startCity}`,
  ];
  if (baseInfo.theme) {
    lines.push(`主题：${baseInfo.theme}`);
  }

  if (budgetList.length > 0) {
    lines.push('', '【预算明细】');
    for (const item of budgetList) {
      const tip = item.tip.trim() ? `  ${item.tip.trim()}` : '';
      lines.push(`${item.item}  人均${item.perPerson}元${tip}`);
    }
  }

  for (const day of dayList) {
    const heading = day.title.trim() || `第${day.day}天`;
    lines.push('', `【${heading}】`);
    if (day.hotelArea.trim()) {
      lines.push(`住宿片区：${day.hotelArea.trim()}`);
    }
    if (day.traffic.length > 0) {
      lines.push('交通：');
      for (const item of day.traffic) {
        if (item.desc.trim()) lines.push(`- ${item.desc.trim()}`);
      }
    }
    if (day.spots.length > 0) {
      lines.push('景点：');
      for (const spot of day.spots) {
        const intro = spot.intro.trim() ? ` · ${spot.intro.trim()}` : '';
        lines.push(`- ${spot.name}${intro}`);
      }
    }
    if (day.foods.length > 0) {
      lines.push('美食：');
      for (const food of day.foods) {
        lines.push(`- ${food.shop} · ${food.dish} · 人均${food.perCost}元`);
      }
    }
    if (day.tips.trim()) {
      lines.push(`【行程亮点】${day.tips.trim()}`);
    }
  }

  if (globalTips.length > 0) {
    lines.push('', '【本次行程专属贴士】');
    for (const tip of globalTips) {
      if (tip.trim()) lines.push(`- ${tip.trim()}`);
    }
  }

  lines.push('', `${BRAND_NAME}｜路慢，方能读懂山河`, `${BRAND_NAME_EN} · ${BRAND_DOMAIN}`);
  return lines.join('\n');
}

/** 微信卡片摘要：景点 + 店名，让对方一眼看到路线厚度 */
export function searchPlanShareCardDesc(plan: SearchStructuredPlan): string {
  const bits = plan.dayList.flatMap((day) => {
    const spot = day.spots[0]?.name.trim();
    const food = day.foods[0]?.shop.replace(/（[^）]*）$/u, '').trim();
    return [spot, food].filter(Boolean);
  });
  return [...new Set(bits)].slice(0, 4).join(' · ').slice(0, 80);
}

/** 一键分享：完整每日行程 + 攻略页链接 */
export function buildSearchPlanSharePacket(
  plan: SearchStructuredPlan,
  shareUrl?: string | null,
): string {
  const body = formatSearchPlanCopyText(plan).trim();
  const lines = [body];
  const url = shareUrl?.trim();
  if (url && !body.includes(url)) {
    lines.push('', url);
  }
  if (!body.includes(SITE_SHARE_REFERENCE_LINE)) {
    lines.push('', SITE_SHARE_REFERENCE_LINE);
  }
  return lines.join('\n').trim();
}
