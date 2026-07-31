import { DEMO_USERS } from '@/data/demoUsers';

/** 是否同一自然日（本地时区） */
export function isSameCalendarDay(isoA: string, isoB: Date = new Date()): boolean {
  const a = new Date(isoA);
  return (
    a.getFullYear() === isoB.getFullYear() &&
    a.getMonth() === isoB.getMonth() &&
    a.getDate() === isoB.getDate()
  );
}

/** 演示数据：今日公开发布的旅行瞬间数量 */
export function countDemoMomentsPublishedToday(now: Date = new Date()): number {
  let count = 0;
  for (const user of DEMO_USERS) {
    for (const moment of user.travelMoments) {
      if (moment.visibility === 'private') {
        continue;
      }
      if (isSameCalendarDay(moment.createdAt, now)) {
        count += 1;
      }
    }
  }
  return count;
}

/** 演示：AI 对话活跃基数（无后端时的可信起点） */
export function getHomeAiChatsSeed(): number {
  const hour = new Date().getHours();
  return 10 + (hour % 8) + Math.floor(hour / 3);
}

export function clampLiveStat(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
