import { demoGuides } from '@/data/demoGuides';
import { extractCityFromPlanText } from '@/lib/map/geocodeTravelPlan';
import type { Guide } from '@/types/domain/guide';
import type { TravelOptions } from '@/types/domain/travelOptions';

/**
 * AI 计划卡片的 presentation（封面、作者、城市）挂靠某条攻略。
 * 模型 JSON 不含 guideId，故用选项 → 目的地 → prompt 关键词逐级回退，保证总有可展示的视觉模板。
 */
export function resolveGuideForPlan(options: TravelOptions, prompt: string): Guide {
  if (options.guideId) {
    const byId = demoGuides.find((g) => g.id === options.guideId);
    if (byId) {
      return byId;
    }
  }

  const destination = options.destination?.trim();
  if (destination) {
    // destination 可能是「成都·宽窄巷子」，用 includes 兼容细粒度地点
    const byCity = demoGuides.find((g) => g.city === destination || destination.includes(g.city));
    if (byCity) {
      return byCity;
    }
  }

  const byPrompt = demoGuides.find((g) => prompt.includes(g.city));
  if (byPrompt) {
    return byPrompt;
  }

  const cityHint =
    extractCityFromPlanText(prompt) || extractCityFromPlanText(options.destination || '');
  if (cityHint) {
    const byHint = demoGuides.find(
      (g) => g.city === cityHint || g.city === cityHint.replace(/市$/, ''),
    );
    if (byHint) {
      return byHint;
    }
  }

  // 未知城市勿默认挂靠成都（demoGuides[0]），改用中性杭州模板
  return demoGuides.find((g) => g.id === 'hangzhou') ?? demoGuides[0];
}
