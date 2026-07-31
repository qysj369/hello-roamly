import { CITY_COORDINATES } from '@/data/cityCoordinates';

const KNOWN_CITIES = Object.keys(CITY_COORDINATES);

/** 从自然语言中提取目的地（如「去济南玩三天」→ 济南） */
export function extractDestinationFromPrompt(text: string): string | undefined {
  const trimmed = text.trim();
  if (!trimmed) {
    return undefined;
  }

  for (const city of KNOWN_CITIES) {
    if (trimmed.includes(city)) {
      return city;
    }
  }

  const goMatch = trimmed.match(/去([\u4e00-\u9fa5]{2,6})/);
  if (goMatch?.[1]) {
    return goMatch[1];
  }

  const playMatch = trimmed.match(/([\u4e00-\u9fa5]{2,6})(?:玩|旅游|自由行)/);
  return playMatch?.[1];
}

/** 从文案中提取天数（如「三天」「3天」） */
export function extractDaysFromPrompt(text: string): number | undefined {
  const trimmed = text.trim();
  if (!trimmed) {
    return undefined;
  }

  const digitMatch = trimmed.match(/(\d+)\s*天/);
  if (digitMatch?.[1]) {
    const days = Number.parseInt(digitMatch[1], 10);
    if (days >= 1 && days <= 30) {
      return days;
    }
  }

  const cnMap: Record<string, number> = {
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  };
  const cnMatch = trimmed.match(/([一二两三四五六七八九十])\s*天/);
  if (cnMatch?.[1]) {
    return cnMap[cnMatch[1]];
  }

  return undefined;
}
