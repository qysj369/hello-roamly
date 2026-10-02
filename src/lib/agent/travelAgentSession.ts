import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type TravelAgentMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export const TRAVEL_AGENT_SESSION_KEY = 'holo-travel-agent-session';
const MAX_SNAPSHOTS = 8;
const MAX_MESSAGES = 40;
/** 旧会话里混进了「上一版行程」重复快照，读到低版本时丢掉 undo 栈 */
export const TRAVEL_AGENT_SESSION_SCHEMA = 2;

export type PlanSnapshot = {
  id: string;
  at: number;
  label: string;
  plan: SearchStructuredPlan;
};

export type TravelAgentSessionRecord = {
  sessionId: string;
  schemaVersion?: number;
  messages: TravelAgentMessage[];
  plan: SearchStructuredPlan | null;
  snapshots: PlanSnapshot[];
  updatedAt: number;
};

export function cloneSearchPlan(plan: SearchStructuredPlan): SearchStructuredPlan {
  return structuredClone(plan);
}

export function searchPlansLookEqual(a: SearchStructuredPlan, b: SearchStructuredPlan): boolean {
  return (
    JSON.stringify(a.baseInfo) === JSON.stringify(b.baseInfo) &&
    JSON.stringify(a.dayList) === JSON.stringify(b.dayList) &&
    JSON.stringify(a.budgetList) === JSON.stringify(b.budgetList)
  );
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function createTravelAgentSessionId(): string {
  return `agent-session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readTravelAgentSession(): TravelAgentSessionRecord | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(TRAVEL_AGENT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TravelAgentSessionRecord;
    if (!parsed?.sessionId) return null;
    if (parsed.schemaVersion !== TRAVEL_AGENT_SESSION_SCHEMA) {
      return { ...parsed, snapshots: [], schemaVersion: TRAVEL_AGENT_SESSION_SCHEMA };
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeTravelAgentSession(record: TravelAgentSessionRecord): void {
  if (!canUseStorage()) return;
  const compact: TravelAgentSessionRecord = {
    ...record,
    schemaVersion: TRAVEL_AGENT_SESSION_SCHEMA,
    messages: record.messages.slice(-MAX_MESSAGES),
    snapshots: record.snapshots.slice(-MAX_SNAPSHOTS),
    updatedAt: Date.now(),
  };
  window.localStorage.setItem(TRAVEL_AGENT_SESSION_KEY, JSON.stringify(compact));
}

/** 改之前压一版，回退时弹出 */
export function pushPlanSnapshot(
  snapshots: PlanSnapshot[],
  plan: SearchStructuredPlan | null,
  label: string,
): PlanSnapshot[] {
  if (!plan) return snapshots;
  const cloned = cloneSearchPlan(plan);
  const last = snapshots[snapshots.length - 1];
  if (last && searchPlansLookEqual(last.plan, cloned)) return snapshots;
  return [
    ...snapshots,
    {
      id: `snap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      at: Date.now(),
      label,
      plan: cloned,
    },
  ].slice(-MAX_SNAPSHOTS);
}

export function popPlanSnapshot(
  snapshots: PlanSnapshot[],
): { plan: SearchStructuredPlan; label: string; snapshots: PlanSnapshot[] } | null {
  if (snapshots.length === 0) return null;
  const last = snapshots[snapshots.length - 1];
  return { plan: last.plan, label: last.label, snapshots: snapshots.slice(0, -1) };
}

/** 连点回退时跳过与当前行程相同的快照，落到真正不同的一版 */
export function popDistinctPlanSnapshot(
  snapshots: PlanSnapshot[],
  current: SearchStructuredPlan | null,
): { plan: SearchStructuredPlan; label: string; snapshots: PlanSnapshot[] } | null {
  let rest = snapshots;
  while (rest.length > 0) {
    const last = rest[rest.length - 1];
    rest = rest.slice(0, -1);
    if (!current || !searchPlansLookEqual(last.plan, current)) {
      return { plan: last.plan, label: last.label, snapshots: rest };
    }
  }
  return null;
}
