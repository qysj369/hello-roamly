const SITE_CHAT_DRAFT_KEY = "roamly-site-chat-draft";
function stashSiteChatDraft(message) {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(SITE_CHAT_DRAFT_KEY, message);
}
function consumeSiteChatDraft() {
  if (typeof window === "undefined") {
    return null;
  }
  const value = sessionStorage.getItem(SITE_CHAT_DRAFT_KEY);
  if (value) {
    sessionStorage.removeItem(SITE_CHAT_DRAFT_KEY);
  }
  return value;
}
export {
  consumeSiteChatDraft as c,
  stashSiteChatDraft as s
};
