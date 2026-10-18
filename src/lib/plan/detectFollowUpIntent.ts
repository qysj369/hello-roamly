export type FollowUpIntent = 'budget' | 'pace' | 'free_spots' | 'transport' | 'general';

export function detectFollowUpIntent(message: string): FollowUpIntent {
  const text = message.trim();
  if (/预算|省钱|压到|降到|不超过|¥|\d+\s*元/.test(text)) {
    return 'budget';
  }
  if (/轻松|不要太累|少赶|慢点|休息|躺平|减.*天/.test(text)) {
    return 'pace';
  }
  if (/免费|不花钱|0元|穷游|漫行|省钱景点/.test(text)) {
    return 'free_spots';
  }
  if (/交通|地铁|公交|高铁|飞机|大巴|用车/.test(text)) {
    return 'transport';
  }
  return 'general';
}

export function buildFollowUpIntentHint(intent: FollowUpIntent, locationName: string): string {
  switch (intent) {
    case 'budget':
      return `保持目的地仍为「${locationName}」；优先调整花费表与流水账分项，使总计误差 ≤ ¥10，不要换城市。`;
    case 'pace':
      return `保持目的地仍为「${locationName}」；减少每日景点数量、增加机动时间，不要删掉已锁定的目的地。`;
    case 'free_spots':
      return `保持目的地仍为「${locationName}」；多用免费景点/街区，在流水账标注「免费」。`;
    case 'transport':
      return `保持目的地仍为「${locationName}」；只改交通段落，门到门衔接写清站点与步行距离。`;
    default:
      return `保持目的地仍为「${locationName}」；以最新用户消息为准做局部修改，禁止改成其他城市。`;
  }
}
