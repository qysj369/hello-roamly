import { f3 as useSiteChatStore } from "./index-DwV1qlqh.js";
function peerMetaFromMatchCandidate(candidate) {
  return {
    peerUserId: candidate.userId,
    peerUsername: candidate.username,
    peerAvatar: candidate.avatar
  };
}
function buildBuddyWelcomeMessage(candidate) {
  const parts = [
    `你好！我看到我们在 ${candidate.seekingDestination} 的行程匹配度有 ${candidate.matchScore}%。`,
    `我计划 ${candidate.seekingDays} 天，预算约 ${candidate.seekingBudgetLabel}。`
  ];
  if (candidate.seekingMessage) {
    parts.push(candidate.seekingMessage);
  }
  parts.push("有兴趣一起结伴吗？");
  return parts.join(" ");
}
function ensureBuddyConversation(peer, welcomeMessage) {
  const store = useSiteChatStore.getState();
  store.hydrate();
  const conversationId = store.openConversation(peer);
  if (welcomeMessage && !store.hasMessages(conversationId)) {
    store.appendMessage({
      conversationId,
      senderId: peer.peerUserId,
      text: welcomeMessage
    });
  }
  return conversationId;
}
function formatChatTime(iso) {
  const date = new Date(iso);
  const now = /* @__PURE__ */ new Date();
  const isToday = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  if (isToday) {
    return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
export {
  buildBuddyWelcomeMessage as b,
  ensureBuddyConversation as e,
  formatChatTime as f,
  peerMetaFromMatchCandidate as p
};
