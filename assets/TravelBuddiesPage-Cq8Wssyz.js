import { j as jsxRuntimeExports, a as reactExports } from "./vendor-react-DtfH6MSw.js";
import { b as TRAVEL_BUDDY_STATUS_LABELS, T as TRAVEL_BUDDY_BRAND } from "./travelBuddy-D507Vifi.js";
import { bU as findUserById, x as CalendarDays, Z as Link, m as AvatarImage, aD as User, f8 as userProfilePath, a1 as MapPin, bl as cn, f3 as useSiteChatStore, eW as useNavigate, eX as usePageSeo, dS as paths, aj as SNAIL_GLOBAL_COPY } from "./index-DwV1qlqh.js";
import { c as formatTravelBuddyStartDate, f as formatTravelBuddyBudgetLabel, e as formatTravelBuddyTagLabel, a as formatTravelBuddyPublishedAt, b as buildTravelBuddyInterestMessage, g as useTravelBuddyList } from "./useTravelBuddyList-CsTlqFhT.js";
import { a as MotionPage, M as MotionBlock } from "./MotionPage-Bc8Pg75O.js";
import { a as messagesThreadPath } from "./messagesPaths-DTRnqq0a.js";
import { P as Plus } from "./plus-CkCpxI1f.js";
import "./vendor-three-Blpl5Qyv.js";
import "./paths-DVmRdz8n.js";
function TravelBuddyCard({ post, onInterest, className }) {
  const author = findUserById(post.userId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "article",
    {
      className: cn(
        "flex flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold text-slate-900", children: post.destination }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700", children: TRAVEL_BUDDY_STATUS_LABELS[post.status] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1.5 text-sm text-slate-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3.5 w-3.5 shrink-0", "aria-hidden": true }),
              "出发 ",
              formatTravelBuddyStartDate(post.startDate)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700", children: formatTravelBuddyBudgetLabel(post.budgetRange) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 flex flex-wrap gap-1.5", children: post.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "li",
          {
            className: "rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700",
            children: formatTravelBuddyTagLabel(tag)
          },
          tag
        )) }),
        post.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600", children: post.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3", children: [
          author ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: userProfilePath(author.id),
              className: "flex min-w-0 items-center gap-2 text-sm text-slate-700 hover:text-emerald-700",
              children: [
                author.avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  AvatarImage,
                  {
                    src: author.avatar,
                    displayName: author.username,
                    size: 32,
                    className: "h-8 w-8"
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-slate-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-slate-500", "aria-hidden": true }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-medium", children: author.username })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-slate-500", children: "蜗友" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-[11px] text-slate-400", children: formatTravelBuddyPublishedAt(post.createdAt) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => onInterest(post),
            className: "mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4", "aria-hidden": true }),
              "感兴趣"
            ]
          }
        )
      ]
    }
  );
}
function openTravelBuddyInterestChat(post, navigate) {
  const author = findUserById(post.userId);
  if (!author) {
    return;
  }
  const store = useSiteChatStore.getState();
  store.hydrate();
  store.openConversation({
    peerUserId: author.id,
    peerUsername: author.username,
    peerAvatar: author.avatar
  });
  navigate(messagesThreadPath(author.id), {
    state: {
      buddyPostId: post.id,
      showSafetyNotice: true,
      draftMessage: buildTravelBuddyInterestMessage(post),
      contextLabel: `${post.destination} · 伸出触角`
    }
  });
}
function TravelBuddiesPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useTravelBuddyList();
  usePageSeo({
    title: `${TRAVEL_BUDDY_BRAND.name} — 蜗牛旅行`,
    description: TRAVEL_BUDDY_BRAND.tagline,
    path: paths.travelBuddies
  });
  const handleInterest = reactExports.useCallback(
    (post) => {
      openTravelBuddyInterestChat(post, navigate);
    },
    [navigate]
  );
  const items = (data == null ? void 0 : data.items) ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionPage, { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-slate-900", children: TRAVEL_BUDDY_BRAND.feedTitle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: TRAVEL_BUDDY_BRAND.feedSubtitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: paths.travelBuddyNew,
          className: "inline-flex shrink-0 items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4", "aria-hidden": true }),
            "发布"
          ]
        }
      )
    ] }) }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "加载结伴需求中…" }) }),
    isError && /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700", children: [
      "加载失败",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => void refetch(),
          className: "ml-2 font-semibold underline",
          children: "重试"
        }
      )
    ] }) }),
    !isLoading && !isError && items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500", children: SNAIL_GLOBAL_COPY.emptyState.replace("轨迹", "结伴需求") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: items.map((post) => /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TravelBuddyCard, { post, onInterest: handleInterest }) }, post.id)) })
  ] });
}
export {
  TravelBuddiesPage as default
};
