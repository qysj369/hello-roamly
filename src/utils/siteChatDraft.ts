const SITE_CHAT_DRAFT_KEY = 'roamly-site-chat-draft';

export function stashSiteChatDraft(message: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(SITE_CHAT_DRAFT_KEY, message);
}

export function consumeSiteChatDraft(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const value = sessionStorage.getItem(SITE_CHAT_DRAFT_KEY);
  if (value) {
    sessionStorage.removeItem(SITE_CHAT_DRAFT_KEY);
  }
  return value;
}

export function peekSiteChatDraft(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(SITE_CHAT_DRAFT_KEY);
}
