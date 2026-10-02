/** 最长专名优先：避免「上海」命中「上海博物馆」，也避免「滨江」抢走外滩。 */
export function scoreSpotNameHit(label: string, keys: string[], needle: string): number {
  const a = label.trim();
  const b = needle.trim();
  if (!a || !b) return 0;
  if (a === b) return 1000 + a.length;
  if (keys.includes(b)) return 900 + b.length;
  if ((b.startsWith(a) || a.startsWith(b)) && a.length >= 3) return 400 + a.length;
  let best = 0;
  for (const key of keys) {
    if (key.length < 2) continue;
    if (b === key) best = Math.max(best, 900 + key.length);
    else if (b.startsWith(key) || key.startsWith(b)) best = Math.max(best, 500 + key.length);
    else if (key.length >= 4 && (b.includes(key) || key.includes(b))) best = Math.max(best, 200 + key.length);
  }
  return best;
}
