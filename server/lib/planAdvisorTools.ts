import { extractPlanPoiCandidates } from '@/lib/plan/extractPlanPoiCandidates';
import { parsePlanSections } from '@/lib/plan/parsePlanSections';
import { validatePlanBudget, type PlanBudgetValidation } from '@/lib/plan/planBudgetValidator';
import { fetchAmapWeatherLive, type AmapWeatherHint } from './amapWeatherServer';
import { serverAmapPlaceTextSearch } from './amapGeocodeServer';
import type { ServerEnv } from './deepseekServer';

export type PlanPoiCheck = {
  name: string;
  verified: boolean;
  label: string | null;
};

export type PlanAdvisorToolsReport = {
  budget: PlanBudgetValidation;
  weather: AmapWeatherHint;
  poiChecks: PlanPoiCheck[];
  footnotes: string[];
  combinedFootnote: string | null;
};

export async function runPlanAdvisorTools(
  content: string,
  locationName: string,
  env: ServerEnv,
): Promise<PlanAdvisorToolsReport> {
  const sections = parsePlanSections(content);
  const budget = validatePlanBudget(content);
  const weatherCity = locationName.includes('→')
    ? (locationName.split('→')[0]?.trim() ?? locationName)
    : locationName;
  const weather = await fetchAmapWeatherLive(weatherCity, env);

  const candidates = extractPlanPoiCandidates(sections.itinerary, 5);
  const poiChecks: PlanPoiCheck[] = [];

  const hasAmapKey = Boolean(env.AMAP_WEB_SERVICE_KEY ?? env.VITE_AMAP_WEB_SERVICE_KEY);

  if (hasAmapKey) {
    for (const name of candidates) {
      const hit = await serverAmapPlaceTextSearch(name, locationName, env);
      poiChecks.push({
        name,
        verified: Boolean(hit),
        label: hit?.label ?? null,
      });
    }
  } else {
    for (const name of candidates) {
      poiChecks.push({
        name,
        verified: false,
        label: null,
      });
    }
  }

  const footnotes: string[] = [];
  if (budget.footnote) {
    footnotes.push(budget.footnote.replace(/^>\s*/, ''));
  }

  if (!weather.available) {
    footnotes.push(`> 🌤️ **天气提示**：${weather.summary}`);
  } else {
    footnotes.push(`> 🌤️ **天气参考**：${weather.summary}（出发前请再查实时预报）`);
  }

  const unverified = poiChecks.filter((item) => !item.verified);
  if (!hasAmapKey) {
    footnotes.push('> 📍 **地点校验**：POI 服务未配置，景点名称请以地图 App 自行核实。');
  } else if (unverified.length > 0) {
    footnotes.push(
      `> 📍 **地点待核实**：${unverified.map((item) => item.name).join('、')}（高德未匹配到，请出发前确认）`,
    );
  } else if (poiChecks.length > 0) {
    footnotes.push(`> 📍 **地点校验**：${poiChecks.length} 处景点已在高德匹配。`);
  }

  const combinedFootnote = footnotes.length > 0 ? footnotes.join('\n\n') : null;

  return {
    budget,
    weather,
    poiChecks,
    footnotes,
    combinedFootnote,
  };
}
