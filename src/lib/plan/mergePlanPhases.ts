import { parsePlanSections, serializePlanSections } from '@/lib/plan/parsePlanSections';

/** 合并第一阶段（简介+行程）与第二阶段（蜗牛提示+避坑） */
export function mergePlanPhases(phase1: string, phase2: string): string {
  const first = parsePlanSections(phase1.trim());
  const second = parsePlanSections(phase2.trim());

  return serializePlanSections({
    intro: first.intro || second.intro,
    itinerary: first.itinerary || second.itinerary,
    snailTips: second.snailTips || first.snailTips,
    pitfalls: second.pitfalls || first.pitfalls,
    isLegacy: false,
  });
}
