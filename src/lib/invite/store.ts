import type { InviteReferralRow, InviteReward } from '@/types/domain/invite';

const PENDING_REF_KEY = 'hello-roamly-invite-pending-ref';
const DEMO_REFERRALS_KEY = 'hello-roamly-invite-demo-referrals';
const DEMO_REWARDS_KEY = 'hello-roamly-invite-demo-rewards';

export function getPendingInviteCode(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(PENDING_REF_KEY);
  } catch {
    return null;
  }
}

export function setPendingInviteCode(code: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(PENDING_REF_KEY, code);
  } catch {
    // ignore
  }
}

export function clearPendingInviteCode(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(PENDING_REF_KEY);
  } catch {
    // ignore
  }
}

export function listDemoReferrals(userId: string): InviteReferralRow[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(`${DEMO_REFERRALS_KEY}:${userId}`);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as InviteReferralRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendDemoReferral(userId: string, row: InviteReferralRow): void {
  if (typeof window === 'undefined') {
    return;
  }
  const existing = listDemoReferrals(userId);
  const next = [row, ...existing].slice(0, 50);
  try {
    window.localStorage.setItem(`${DEMO_REFERRALS_KEY}:${userId}`, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function listDemoGrantedRewards(userId: string): InviteReward[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(`${DEMO_REWARDS_KEY}:${userId}`);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as InviteReward[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendDemoGrantedReward(userId: string, reward: InviteReward): void {
  if (typeof window === 'undefined') {
    return;
  }
  const existing = listDemoGrantedRewards(userId);
  const next = [reward, ...existing].slice(0, 20);
  try {
    window.localStorage.setItem(`${DEMO_REWARDS_KEY}:${userId}`, JSON.stringify(next));
  } catch {
    // ignore
  }
}
