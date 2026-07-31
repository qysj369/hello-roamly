import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { c as consumeSiteChatDraft } from "./siteChatDraft-DGMj78fI.js";
import { ap as Send, bl as cn, L as DEMO_CURRENT_USER_ID, dh as http, e0 as readEnv, cU as getSiteChatSelfUserId, Z as Link, m as AvatarImage, f8 as userProfilePath, a3 as MessageCircle, aj as SNAIL_GLOBAL_COPY, a6 as NavLink, dt as isSelfChatMessage, f3 as useSiteChatStore, F as ContentModerationRejectedError, eY as useParams, eU as useLocation, bU as findUserById, bh as chatThreadPageSeo, dE as messagesPageSeo, eX as usePageSeo, dS as paths } from "./index-DwV1qlqh.js";
import { T as TRAVEL_BUDDY_BRAND } from "./travelBuddy-D507Vifi.js";
import { B as BUDDY_MESSAGES_API } from "./paths-DVmRdz8n.js";
import { m as messagesInboxPath, a as messagesThreadPath } from "./messagesPaths-DTRnqq0a.js";
import { f as formatChatTime } from "./siteChat-Ca1zNh94.js";
import { a as assertContentAllowed } from "./moderate-B_EMCIaW.js";
import { a as MotionPage, M as MotionBlock } from "./MotionPage-Bc8Pg75O.js";
import "./vendor-three-Blpl5Qyv.js";
function SiteChatComposer({
  onSend,
  disabled,
  isSending = false,
  submitError,
  initialDraft,
  className
}) {
  const [draft, setDraft] = reactExports.useState("");
  reactExports.useEffect(() => {
    var _a;
    const pending = (initialDraft == null ? void 0 : initialDraft.trim()) || ((_a = consumeSiteChatDraft()) == null ? void 0 : _a.trim());
    if (pending) {
      setDraft(pending);
    }
  }, [initialDraft]);
  const handleSend = reactExports.useCallback(async () => {
    const text = draft.trim();
    if (!text || disabled || isSending) {
      return;
    }
    await onSend(text);
    setDraft("");
  }, [disabled, draft, isSending, onSend]);
  const handleKeyDown = reactExports.useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );
  const inputDisabled = disabled || isSending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: cn("border-t border-slate-100 bg-white p-3", className), children: [
    submitError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-xs text-rose-700", role: "alert", children: submitError }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: draft,
          onChange: (event) => setDraft(event.target.value),
          onKeyDown: handleKeyDown,
          rows: 2,
          disabled: inputDisabled,
          placeholder: "输入消息…",
          className: "min-h-[2.5rem] flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-slate-50"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: handleSend,
          disabled: inputDisabled || !draft.trim(),
          className: "inline-flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400",
          "aria-label": "发送消息",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4", "aria-hidden": true })
        }
      )
    ] })
  ] });
}
const STORAGE_KEY = "hello-roamly:buddy-messages";
function readBuddyMessagesFromStorage() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function writeBuddyMessagesToStorage(items) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function newMessageId() {
  return `bmsg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function isThreadMessage(message, buddyPostId, selfUserId, peerUserId) {
  if (message.buddyPostId !== buddyPostId) {
    return false;
  }
  const set = /* @__PURE__ */ new Set([message.fromUserId, message.toUserId]);
  return set.has(selfUserId) && set.has(peerUserId);
}
function listBuddyMessagesLocal(params) {
  const selfUserId = params.selfUserId ?? DEMO_CURRENT_USER_ID;
  let items = readBuddyMessagesFromStorage().filter(
    (message) => isThreadMessage(message, params.buddyPostId, selfUserId, params.peerUserId)
  );
  if (params.since) {
    const sinceMs = new Date(params.since).getTime();
    items = items.filter((message) => new Date(message.createdAt).getTime() > sinceMs);
  }
  items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const updated = readBuddyMessagesFromStorage().map((message) => {
    if (isThreadMessage(message, params.buddyPostId, selfUserId, params.peerUserId) && message.toUserId === selfUserId && !message.isRead) {
      return { ...message, isRead: true };
    }
    return message;
  });
  writeBuddyMessagesToStorage(updated);
  return items;
}
function sendBuddyMessageLocal(params) {
  const message = {
    id: newMessageId(),
    buddyPostId: params.buddyPostId,
    fromUserId: params.fromUserId ?? DEMO_CURRENT_USER_ID,
    toUserId: params.toUserId,
    content: params.content.trim(),
    isRead: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const items = [...readBuddyMessagesFromStorage(), message];
  writeBuddyMessagesToStorage(items);
  return message;
}
function useRemoteApi() {
  return Boolean(readEnv("VITE_API_BASE_URL"));
}
async function fetchBuddyMessages(params) {
  if (useRemoteApi()) {
    const { data } = await http.get(BUDDY_MESSAGES_API.list, {
      params
    });
    return data;
  }
  return {
    items: listBuddyMessagesLocal({
      buddyPostId: params.buddyPostId,
      peerUserId: params.peerUserId,
      since: params.since
    })
  };
}
async function sendBuddyMessage(payload) {
  if (useRemoteApi()) {
    const { data } = await http.post(
      BUDDY_MESSAGES_API.send,
      payload
    );
    return data;
  }
  return {
    item: sendBuddyMessageLocal({
      buddyPostId: payload.buddyPostId,
      toUserId: payload.toUserId,
      content: payload.content
    })
  };
}
const POLL_INTERVAL_MS = 3e3;
function useBuddyMessageThread(params) {
  const { buddyPostId, peerUserId, enabled = true } = params;
  const [messages, setMessages] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const lastFetchedAtRef = reactExports.useRef(void 0);
  const load = reactExports.useCallback(async () => {
    if (!buddyPostId || !peerUserId || !enabled) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { items } = await fetchBuddyMessages({
        buddyPostId,
        peerUserId,
        since: lastFetchedAtRef.current
      });
      if (items.length > 0) {
        setMessages((prev) => {
          const map = new Map(prev.map((item) => [item.id, item]));
          for (const item of items) {
            map.set(item.id, item);
          }
          return [...map.values()].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        lastFetchedAtRef.current = items[items.length - 1].createdAt;
      } else if (!lastFetchedAtRef.current) {
        const full = await fetchBuddyMessages({ buddyPostId, peerUserId });
        setMessages(full.items);
        if (full.items.length > 0) {
          lastFetchedAtRef.current = full.items[full.items.length - 1].createdAt;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载消息失败");
    } finally {
      setIsLoading(false);
    }
  }, [buddyPostId, peerUserId, enabled]);
  reactExports.useEffect(() => {
    lastFetchedAtRef.current = void 0;
    setMessages([]);
    if (!buddyPostId || !peerUserId || !enabled) {
      return void 0;
    }
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [buddyPostId, peerUserId, enabled, load]);
  const send = reactExports.useCallback(
    async (content) => {
      if (!buddyPostId || !peerUserId) {
        return;
      }
      const { item } = await sendBuddyMessage({
        buddyPostId,
        toUserId: peerUserId,
        content
      });
      setMessages((prev) => [...prev, item]);
      lastFetchedAtRef.current = item.createdAt;
    },
    [buddyPostId, peerUserId]
  );
  const selfUserId = getSiteChatSelfUserId();
  return { messages, isLoading, error, send, selfUserId, reload: load };
}
function BuddyChatThread({
  conversation,
  buddyPostId,
  showSafetyNotice = true,
  contextLabel,
  draftMessage,
  showBackLink = false,
  className
}) {
  const { messages, send, selfUserId } = useBuddyMessageThread({
    buddyPostId,
    peerUserId: conversation.peerUserId,
    enabled: true
  });
  const [submitError, setSubmitError] = reactExports.useState(null);
  const [isSending, setIsSending] = reactExports.useState(false);
  const [draftSent, setDraftSent] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!draftMessage || draftSent || messages.length > 0) {
      return;
    }
    setDraftSent(true);
    void send(draftMessage);
  }, [draftMessage, draftSent, messages.length, send]);
  const handleSend = reactExports.useCallback(
    async (text) => {
      setSubmitError(null);
      setIsSending(true);
      try {
        await send(text);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "发送失败");
      } finally {
        setIsSending(false);
      }
    },
    [send]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex min-h-[20rem] flex-1 flex-col bg-slate-50/50", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center gap-3 border-b border-slate-200/80 bg-white px-4 py-3", children: [
      showBackLink && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: messagesInboxPath(),
          className: "text-xs font-semibold text-brand-600 hover:text-brand-700 sm:hidden",
          children: "← 会话"
        }
      ),
      conversation.peerAvatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        AvatarImage,
        {
          src: conversation.peerAvatar,
          displayName: conversation.peerUsername,
          size: 40,
          className: "h-10 w-10"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700",
          "aria-hidden": true,
          children: conversation.peerUsername.slice(0, 1)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "truncate text-sm font-semibold text-slate-900", children: conversation.peerUsername }),
        contextLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-emerald-700", children: contextLabel }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: userProfilePath(conversation.peerUserId),
            className: "text-xs text-brand-600 hover:underline",
            children: "查看主页"
          }
        )
      ] })
    ] }),
    showSafetyNotice && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs leading-relaxed text-amber-900",
        role: "note",
        children: TRAVEL_BUDDY_BRAND.safetyNotice
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-3 overflow-y-auto px-4 py-4", children: [
      messages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-slate-500", children: "发送第一条消息，开始初步沟通" }),
      messages.map((message) => {
        const isSelf = message.fromUserId === selfUserId;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn("flex", isSelf ? "justify-end" : "justify-start"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  isSelf ? "rounded-br-md bg-emerald-600 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words", children: message.content }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: cn(
                        "mt-1 text-[10px]",
                        isSelf ? "text-emerald-100" : "text-slate-400"
                      ),
                      children: formatChatTime(message.createdAt)
                    }
                  )
                ]
              }
            )
          },
          message.id
        );
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteChatComposer, { onSend: handleSend, isSending, submitError })
  ] });
}
function SiteChatConversationList({
  conversations,
  activePeerId,
  className
}) {
  if (conversations.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "flex flex-col items-center justify-center px-4 py-12 text-center",
          className
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-10 w-10 text-slate-300", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-medium text-slate-700", children: SNAIL_GLOBAL_COPY.emptyState }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "在旅伴匹配中向蜗友发起聊天吧" }),
          "      "
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: cn("divide-y divide-slate-100", className), "aria-label": "会话列表", children: conversations.map((conversation) => {
    const isActive = conversation.id === activePeerId;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      NavLink,
      {
        to: messagesThreadPath(conversation.peerUserId),
        className: ({ isActive: routeActive }) => cn(
          "flex items-center gap-3 px-4 py-3 transition",
          (isActive || routeActive) && "bg-violet-50/80",
          !isActive && !routeActive && "hover:bg-slate-50"
        ),
        children: [
          conversation.peerAvatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            AvatarImage,
            {
              src: conversation.peerAvatar,
              displayName: conversation.peerUsername,
              size: 44,
              className: "h-11 w-11 shrink-0"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700",
              "aria-hidden": true,
              children: conversation.peerUsername.slice(0, 1)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-semibold text-slate-900", children: conversation.peerUsername }),
              conversation.updatedAt && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "time",
                {
                  className: "shrink-0 text-[10px] text-slate-400",
                  dateTime: conversation.updatedAt,
                  children: formatChatTime(conversation.updatedAt)
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-1 text-xs text-slate-500", children: conversation.lastMessagePreview ?? "开始聊天" })
          ] }),
          conversation.unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white", children: conversation.unreadCount > 9 ? "9+" : conversation.unreadCount })
        ]
      }
    ) }, conversation.id);
  }) });
}
function SiteChatMessageList({
  messages,
  peerUsername,
  className
}) {
  const endRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    var _a;
    (_a = endRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  if (messages.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: cn(
          "flex flex-1 items-center justify-center px-4 text-center text-sm text-slate-500",
          className
        ),
        children: "还没有消息，发一句打个招呼吧"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: cn("flex-1 space-y-3 overflow-y-auto px-4 py-4", className), "aria-live": "polite", children: [
    messages.map((message) => {
      const isSelf = isSelfChatMessage(message.senderId);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: cn("flex", isSelf ? "justify-end" : "justify-start"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[85%]", children: [
        !isSelf && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-0.5 text-[10px] font-medium text-slate-500", children: peerUsername }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
              isSelf ? "rounded-br-md bg-violet-600 text-white" : "rounded-bl-md border border-slate-200/80 bg-white text-slate-800"
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words", children: message.text })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "time",
          {
            className: cn(
              "mt-0.5 block text-[10px]",
              isSelf ? "text-right text-slate-400" : "text-slate-400"
            ),
            dateTime: message.createdAt,
            children: formatChatTime(message.createdAt)
          }
        )
      ] }) }, message.id);
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: endRef, "aria-hidden": true })
  ] });
}
const EMPTY_CHAT_MESSAGES = [];
function SiteChatThread({
  conversation,
  showBackLink = false,
  showSafetyNotice = false,
  initialDraft,
  className
}) {
  const messages = useSiteChatStore(
    (state) => state.messagesByConversation[conversation.id] ?? EMPTY_CHAT_MESSAGES
  );
  const sendMessage = useSiteChatStore((state) => state.sendMessage);
  const markRead = useSiteChatStore((state) => state.markConversationRead);
  reactExports.useEffect(() => {
    markRead(conversation.id);
  }, [conversation.id, markRead]);
  const [submitError, setSubmitError] = reactExports.useState(null);
  const [isSending, setIsSending] = reactExports.useState(false);
  const handleSend = reactExports.useCallback(
    async (text) => {
      setSubmitError(null);
      setIsSending(true);
      try {
        await assertContentAllowed({
          scene: "site_chat",
          text,
          bizId: conversation.id
        });
        sendMessage(conversation.id, text);
      } catch (error) {
        if (error instanceof ContentModerationRejectedError) {
          setSubmitError(error.message);
          return;
        }
        setSubmitError(error instanceof Error ? error.message : "发送失败");
      } finally {
        setIsSending(false);
      }
    },
    [conversation.id, sendMessage]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex min-h-[20rem] flex-1 flex-col bg-slate-50/50", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center gap-3 border-b border-slate-200/80 bg-white px-4 py-3", children: [
      showBackLink && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: messagesInboxPath(),
          className: "text-xs font-semibold text-brand-600 hover:text-brand-700 sm:hidden",
          children: "← 会话"
        }
      ),
      conversation.peerAvatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        AvatarImage,
        {
          src: conversation.peerAvatar,
          displayName: conversation.peerUsername,
          size: 40,
          className: "h-10 w-10"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700",
          "aria-hidden": true,
          children: conversation.peerUsername.slice(0, 1)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "truncate text-sm font-semibold text-slate-900", children: conversation.peerUsername }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: userProfilePath(conversation.peerUserId),
            className: "text-xs text-brand-600 hover:underline",
            children: "查看主页"
          }
        )
      ] })
    ] }),
    showSafetyNotice && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs leading-relaxed text-amber-900",
        role: "note",
        children: TRAVEL_BUDDY_BRAND.safetyNotice
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteChatMessageList, { messages, peerUsername: conversation.peerUsername }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SiteChatComposer,
      {
        onSend: handleSend,
        isSending,
        submitError,
        initialDraft
      }
    )
  ] });
}
function MessagesPage() {
  const { peerUserId } = useParams();
  const location = useLocation();
  const routeState = location.state ?? null;
  const hydrate = useSiteChatStore((state) => state.hydrate);
  const openConversation = useSiteChatStore((state) => state.openConversation);
  const storedConversation = useSiteChatStore(
    (state) => peerUserId ? state.conversations[peerUserId] : void 0
  );
  const conversationMap = useSiteChatStore((state) => state.conversations);
  const conversations = reactExports.useMemo(
    () => Object.values(conversationMap).sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    ),
    [conversationMap]
  );
  const peerUser = peerUserId ? findUserById(peerUserId) : void 0;
  const activeConversation = reactExports.useMemo(() => {
    if (storedConversation) {
      return storedConversation;
    }
    if (!peerUser) {
      return void 0;
    }
    return {
      id: peerUser.id,
      peerUserId: peerUser.id,
      peerUsername: peerUser.username,
      peerAvatar: peerUser.avatar,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      unreadCount: 0
    };
  }, [peerUser, storedConversation]);
  const pageSeo = reactExports.useMemo(
    () => activeConversation && peerUserId ? chatThreadPageSeo(activeConversation.peerUsername, peerUserId) : messagesPageSeo(),
    [activeConversation, peerUserId]
  );
  usePageSeo(pageSeo);
  reactExports.useEffect(() => {
    hydrate();
  }, [hydrate]);
  reactExports.useEffect(() => {
    if (!peerUser) {
      return;
    }
    openConversation({
      peerUserId: peerUser.id,
      peerUsername: peerUser.username,
      peerAvatar: peerUser.avatar
    });
  }, [openConversation, peerUser]);
  const useBuddyThread = Boolean((routeState == null ? void 0 : routeState.buddyPostId) && activeConversation);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionPage, { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-semibold text-slate-900", children: "站内消息" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: useBuddyThread ? "伸出触角 · 结伴初步沟通（轮询同步）" : "与蜗友的私信" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: paths.travelBuddies,
          className: "text-xs font-semibold text-brand-600 hover:text-brand-700",
          children: "伸出触角"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { className: "flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm sm:min-h-[32rem]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid min-h-[28rem] flex-1 sm:grid-cols-[minmax(0,17rem)_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "aside",
        {
          className: cn(
            "border-b border-slate-200/80 sm:border-b-0 sm:border-r",
            peerUserId ? "hidden sm:block" : "block"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "border-b border-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-500", children: "会话列表" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SiteChatConversationList, { conversations, activePeerId: peerUserId })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "section",
        {
          className: cn("flex min-h-[24rem] flex-1 flex-col", !peerUserId && "hidden sm:flex"),
          children: activeConversation && useBuddyThread && (routeState == null ? void 0 : routeState.buddyPostId) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            BuddyChatThread,
            {
              conversation: activeConversation,
              buddyPostId: routeState.buddyPostId,
              showSafetyNotice: routeState.showSafetyNotice ?? true,
              contextLabel: routeState.contextLabel,
              draftMessage: routeState.draftMessage,
              showBackLink: true
            }
          ) : activeConversation ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            SiteChatThread,
            {
              conversation: activeConversation,
              showBackLink: true,
              showSafetyNotice: routeState == null ? void 0 : routeState.showSafetyNotice,
              initialDraft: routeState == null ? void 0 : routeState.draftMessage
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col items-center justify-center px-6 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-12 w-12 text-slate-300", "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-medium text-slate-700", children: "选择会话开始聊天" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "在左侧选择联系人，或从伸出触角点击「感兴趣」" })
          ] })
        }
      )
    ] }) })
  ] });
}
export {
  MessagesPage as default
};
