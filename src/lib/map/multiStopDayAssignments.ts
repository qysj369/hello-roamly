export type MultiStopDayAssignment = {
  dayNumber: number;
  stopName: string;
  previousStop: string | null;
  isDepthDay: boolean;
};

/** 4天3站 → 第1/2天各一站，第3-4天末站深度游 */
export function buildMultiStopDayAssignments(
  stops: string[],
  totalDays: number,
): MultiStopDayAssignment[] {
  if (stops.length === 0 || totalDays <= 0) {
    return [];
  }

  const days = Math.max(totalDays, stops.length);

  if (days <= stops.length) {
    return stops.slice(0, days).map((stop, index) => ({
      dayNumber: index + 1,
      stopName: stop,
      previousStop: index > 0 ? stops[index - 1]! : null,
      isDepthDay: false,
    }));
  }

  const assignments: MultiStopDayAssignment[] = [];
  for (let index = 0; index < stops.length - 1; index += 1) {
    assignments.push({
      dayNumber: index + 1,
      stopName: stops[index]!,
      previousStop: index > 0 ? stops[index - 1]! : null,
      isDepthDay: false,
    });
  }

  const lastStop = stops[stops.length - 1]!;
  const lastBlockStart = stops.length;
  for (let day = lastBlockStart; day <= days; day += 1) {
    assignments.push({
      dayNumber: day,
      stopName: lastStop,
      previousStop: day === lastBlockStart ? (stops.length >= 2 ? stops[stops.length - 2]! : null) : lastStop,
      isDepthDay: day > lastBlockStart,
    });
  }

  return assignments;
}
