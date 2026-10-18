/**
 * 城市弹窗四段标准化模板校验
 * 结构：城市简介 → 核心地标 → 本地美食与街巷 → 出行贴士
 * @see CITY_PREVIEW_SECTION_ORDER in productPositioning
 */

import {
  BANNED_ECOMMERCE_WORDS,
  CITY_PREVIEW_SECTION_ORDER,
} from '@/lib/config/productPositioning';
import {
  getHoloCityPreviewPanel,
  listHoloCityPreviewPanelCities,
  type HoloCityPreviewPanel,
} from '@/data/holoCityPreviewPanel';

export type CityPreviewTemplateIssue = {
  city: string;
  field: string;
  message: string;
};

function foodHasPlace(food: HoloCityPreviewPanel['foods'][number]): boolean {
  return Boolean(food.shop?.trim() || food.area?.trim() || food.note?.trim());
}

/** 校验单城是否符合四段模板与内容约束 */
export function validateCityPreviewTemplate(
  city: string,
  panel: HoloCityPreviewPanel,
): CityPreviewTemplateIssue[] {
  const issues: CityPreviewTemplateIssue[] = [];

  if (!panel.intro?.trim() || panel.intro.trim().length < 20) {
    issues.push({ city, field: 'intro', message: '城市简介过短或缺失' });
  }
  if (!panel.spots?.length) {
    issues.push({ city, field: 'spots', message: '缺少核心地标' });
  }
  if (!panel.foods?.length) {
    issues.push({ city, field: 'foods', message: '缺少本地美食' });
  } else if (panel.foods.some((food) => !foodHasPlace(food))) {
    issues.push({ city, field: 'foods', message: '美食须带街区/门店/说明参考' });
  }
  if (!panel.transit?.trim()) {
    issues.push({ city, field: 'transit', message: '缺少出行贴士（交通）' });
  }
  if (!panel.tips?.length) {
    issues.push({ city, field: 'tips', message: '缺少慢行提醒' });
  }

  const blob = [
    panel.intro,
    panel.transit,
    ...panel.tips,
    ...panel.foods.map((f) => [f.name, f.shop, f.area, f.note].filter(Boolean).join('')),
    ...panel.spots.map((s) => `${s.name}${s.blurb}`),
  ].join('\n');

  for (const word of BANNED_ECOMMERCE_WORDS) {
    if (blob.includes(word)) {
      issues.push({ city, field: 'copy', message: `含电商禁词「${word}」` });
    }
  }

  return issues;
}

/** 校验全部已配置城市弹窗文案 */
export function validateAllCityPreviewTemplates(): CityPreviewTemplateIssue[] {
  const issues: CityPreviewTemplateIssue[] = [];
  for (const city of listHoloCityPreviewPanelCities()) {
    const panel = getHoloCityPreviewPanel(city);
    if (!panel) {
      issues.push({ city, field: 'panel', message: '面板缺失' });
      continue;
    }
    issues.push(...validateCityPreviewTemplate(city, panel));
  }
  return issues;
}

export const CITY_PREVIEW_TEMPLATE_LABELS = CITY_PREVIEW_SECTION_ORDER;
