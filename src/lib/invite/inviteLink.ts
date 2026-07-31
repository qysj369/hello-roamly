import { resolveSiteOrigin } from '@/lib/seo/config';
import { paths } from '@/router/paths';

export const INVITE_QUERY = {
  ref: 'ref',
} as const;

export function buildInviteLink(code: string): string {
  const origin = resolveSiteOrigin();
  const url = new URL(paths.home, origin);
  url.searchParams.set(INVITE_QUERY.ref, code.trim().toUpperCase());
  return url.toString();
}

export function parseInviteCodeFromSearch(search: string): string | null {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const raw = params.get(INVITE_QUERY.ref)?.trim();
  if (!raw || raw.length < 4) {
    return null;
  }
  return raw.toUpperCase();
}

export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
}
