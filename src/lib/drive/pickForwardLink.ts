/** 归一化航向角到 [0, 360) */
export function normalizeHeading(deg: number): number {
  const value = deg % 360;
  return value < 0 ? value + 360 : value;
}

/** 两航向角最短差（0～180） */
export function headingDelta(a: number, b: number): number {
  const diff = Math.abs(normalizeHeading(a) - normalizeHeading(b)) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * 按当前视角挑选「前方」相邻全景点。
 * 优先与当前 heading 最接近的道路；无链接时返回 null。
 */
export function pickForwardLink(
  links: readonly BMapPanoramaLink[] | null | undefined,
  currentHeading: number,
  visitedIds?: ReadonlySet<string>,
): BMapPanoramaLink | null {
  if (!links?.length) {
    return null;
  }

  const fresh = visitedIds
    ? links.filter((link) => link?.id && !visitedIds.has(link.id))
    : links.filter((link) => Boolean(link?.id));
  const pool = fresh.length > 0 ? fresh : links.filter((link) => Boolean(link?.id));
  if (pool.length === 0) {
    return null;
  }

  let best = pool[0];
  let bestScore = headingDelta(currentHeading, best.heading);

  for (let i = 1; i < pool.length; i += 1) {
    const link = pool[i];
    const score = headingDelta(currentHeading, link.heading);
    if (score < bestScore) {
      best = link;
      bestScore = score;
    }
  }

  return best;
}
