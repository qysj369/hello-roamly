import { L as DEMO_CURRENT_USER_ID, dh as http, e0 as readEnv, f0 as useQueryClient, eV as useMutation, d_ as queryKeys, e$ as useQuery } from "./index-DwV1qlqh.js";
import { T as TRAVEL_BUDDY_API } from "./paths-DVmRdz8n.js";
import { a as TRAVEL_BUDDY_BUDGET_OPTIONS, c as TRAVEL_BUDDY_TAG_OPTIONS } from "./travelBuddy-D507Vifi.js";
import { i as create } from "./vendor-three-Blpl5Qyv.js";
function defaultTravelBuddyStartDate(daysFromNow = 3) {
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}
function formatTravelBuddyBudgetLabel(range) {
  var _a;
  return ((_a = TRAVEL_BUDDY_BUDGET_OPTIONS.find((item) => item.value === range)) == null ? void 0 : _a.label) ?? range;
}
function formatTravelBuddyTagLabel(tag) {
  var _a;
  return ((_a = TRAVEL_BUDDY_TAG_OPTIONS.find((item) => item.value === tag)) == null ? void 0 : _a.label) ?? tag;
}
function sortSeekingTravelBuddyPosts(items) {
  return items.filter((item) => item.status === "seeking").sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
function formatTravelBuddyStartDate(isoDate) {
  const date = /* @__PURE__ */ new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short"
  });
}
function formatTravelBuddyPublishedAt(iso) {
  const date = new Date(iso);
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 36e5);
  if (diffHours < 1) {
    return "刚刚";
  }
  if (diffHours < 24) {
    return `${diffHours} 小时前`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} 天前`;
  }
  return date.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}
function buildTravelBuddyInterestMessage(post) {
  return `你好！我对你在「${post.destination}」${formatTravelBuddyStartDate(post.startDate)} 出发的结伴需求感兴趣，想聊聊具体安排。`;
}
const STORAGE_KEY = "hello-roamly:travel-buddies";
function daysAgoIso(days) {
  return new Date(Date.now() - days * 864e5).toISOString();
}
function daysFromDateIso(days) {
  return defaultTravelBuddyStartDate(days);
}
const DEMO_TRAVEL_BUDDY_POSTS = [
  {
    id: "buddy-seed-hz-2d",
    userId: "user-roamly-demo",
    destination: "杭州 · 西湖环线",
    startDate: daysFromDateIso(2),
    budgetRange: "500_1000",
    tags: ["meal", "photo"],
    description: "女生，会拍照，求饭搭子一起逛西湖周边，不住同一间房也行。",
    status: "seeking",
    createdAt: daysAgoIso(1),
    updatedAt: daysAgoIso(1)
  },
  {
    id: "buddy-seed-cq-3d",
    userId: "user-nomad",
    destination: "重庆",
    startDate: daysFromDateIso(4),
    budgetRange: "1000_2000",
    tags: ["meal", "carpool_room"],
    description: "男生，会开车，可拼车；火锅搭子优先，青旅拼房分摊。",
    status: "seeking",
    createdAt: daysAgoIso(3),
    updatedAt: daysAgoIso(3)
  },
  {
    id: "buddy-seed-dl-4d",
    userId: "user-maple",
    destination: "大理 · 洱海骑行",
    startDate: daysFromDateIso(6),
    budgetRange: "1000_2000",
    tags: ["photo", "hiking", "carpool_room"],
    description: "想环洱海拍照，接受电瓶车或徒步段，求节奏相近的蜗友。",
    status: "seeking",
    createdAt: daysAgoIso(5),
    updatedAt: daysAgoIso(5)
  }
];
function readTravelBuddiesFromStorage() {
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
function writeTravelBuddiesToStorage(items) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function mergeSeedPosts(existing) {
  const existingIds = new Set(existing.map((item) => item.id));
  const seeds = DEMO_TRAVEL_BUDDY_POSTS.filter((seed) => !existingIds.has(seed.id));
  if (seeds.length === 0) {
    return existing;
  }
  return [...seeds, ...existing];
}
function newPostId() {
  return `buddy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
const useTravelBuddiesStore = create((set, get) => ({
  items: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) {
      return;
    }
    const merged = mergeSeedPosts(readTravelBuddiesFromStorage());
    writeTravelBuddiesToStorage(merged);
    set({ items: merged, hydrated: true });
  },
  listSeeking: () => sortSeekingTravelBuddyPosts(get().items),
  addPost: (input, userId = DEMO_CURRENT_USER_ID) => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const post = {
      id: newPostId(),
      userId,
      ...input,
      status: "seeking",
      createdAt: now,
      updatedAt: now
    };
    set((state) => {
      const items = [post, ...state.items];
      writeTravelBuddiesToStorage(items);
      return { items };
    });
    return post;
  },
  getById: (id) => get().items.find((item) => item.id === id)
}));
function useRemoteApi() {
  return Boolean(readEnv("VITE_API_BASE_URL"));
}
function listFromLocal() {
  const store = useTravelBuddiesStore.getState();
  store.hydrate();
  const items = store.listSeeking();
  return { items, total: items.length };
}
async function fetchTravelBuddyList() {
  if (useRemoteApi()) {
    const { data } = await http.get(TRAVEL_BUDDY_API.list, {
      params: { status: "seeking" }
    });
    return {
      items: sortSeekingTravelBuddyPosts(data.items),
      total: data.total
    };
  }
  return listFromLocal();
}
async function createTravelBuddyPost(payload) {
  if (useRemoteApi()) {
    const { data } = await http.post(
      TRAVEL_BUDDY_API.create,
      payload
    );
    return data;
  }
  const item = useTravelBuddiesStore.getState().addPost(payload);
  return { item };
}
function useTravelBuddyList() {
  return useQuery({
    queryKey: queryKeys.travelBuddies.list(),
    queryFn: fetchTravelBuddyList,
    staleTime: 3e4
  });
}
function useCreateTravelBuddy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createTravelBuddyPost(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.travelBuddies.list() });
    }
  });
}
export {
  formatTravelBuddyPublishedAt as a,
  buildTravelBuddyInterestMessage as b,
  formatTravelBuddyStartDate as c,
  defaultTravelBuddyStartDate as d,
  formatTravelBuddyTagLabel as e,
  formatTravelBuddyBudgetLabel as f,
  useTravelBuddyList as g,
  useCreateTravelBuddy as u
};
