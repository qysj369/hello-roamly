import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { af as QueryObserver, dc as hasPreviousPage, db as hasNextPage, eL as useBaseQuery, bw as createLucideIcon, e1 as readMomentLikesStorage, fb as writeMomentLikesStorage, e$ as useQuery, d_ as queryKeys, f0 as useQueryClient, eV as useMutation, aW as awardMomentSaltIfLiked, cq as getMomentTags, N as DEMO_USER_CONNECTIONS, O as DEMO_USER_FAVORITE_PLAN_IDS, bT as findTravelPlanById, bf as canViewTravelMoment, cN as getRecentTravelPlans, cA as getPlanCreator, L as DEMO_CURRENT_USER_ID, bU as findUserById, dp as isEnrichedTravelPlan, eQ as useGeneratedPlansStore, e_ as usePlanInteractions, dl as isChinaPrimaryMarket, a1 as MapPin, bl as cn, aI as X, _ as LoaderCircle, $ as Map$1, a7 as NavigationControl, a2 as Marker, cr as getMomentUploadPreviewAlt, a8 as OptimizedImage, ax as TRAVEL_MOMENT_VISIBILITY_OPTIONS, f4 as useTravelMomentsStore, at as Sparkles, eF as travelMomentSharePath, ba as buildShareUrl, eC as trackShareOutcome, cn as getMomentDescription, fd as xhsInputToCopyText, e5 as renderXhsPosterSlides, e4 as renderSharePoster, dB as mapShareInputToXhs, dd as hashtagsFromTags, ec as resolveRemoteImageUrl, cm as getMomentCoverUrl, aq as Share2, ae as QrCode, ar as SharePosterDialog, bu as createChinaPosterVariants, aj as SNAIL_GLOBAL_COPY, Y as Heart, a3 as MessageCircle, cs as getMomentVideoAlt, cp as getMomentImageAlt, z as ChevronLeft, D as ChevronRight, f1 as useReducedMotion, j as AnimatePresence, dG as motion, co as getMomentDetailText, Z as Link, f8 as userProfilePath, b_ as formatRelativeZh, c9 as getCountryLabel, m as AvatarImage, aF as Users, cZ as getTravelMomentVisibilityLabel, w as CONTRIBUTION_TITLE_TIERS, dM as object, et as string, bE as email, aJ as _enum, aZ as boolean, eI as union, dL as number, aU as array, az as TravelPersonalityKind, dA as literal, Q as Dialog, dW as profilePathForUser, cK as getProfileBio, bZ as formatProfileStatCount, ck as getInterestLabel, eM as useContributionScoreStore, eO as useDemoUserProfileStore, d8 as hasCustomBio, cL as getProfileTravelData, v as CONTRIBUTION_SCORE_RULES, au as TRAVEL_BADGE_META, dq as isInviteEnabled, U as Gift, aE as UserFacingErrorAlert, aT as areEqualByPlanRef, cz as getPlanCoverUrl, cC as getPlanDestination, cx as getPlanCoverAlt, cB as getPlanDaysLabel, cw as getPlanBudgetLabel, s as Bot, eG as travelPlanDetailPath, r as Bookmark, dQ as parseTravelMomentIdFromHash, eE as travelMomentDomId, dX as profileSavedPlansPath, dS as paths, dw as isTravelMomentShareHash, cM as getProfileVisibilityLabel, eW as useNavigate, eU as useLocation, g as APP_NAME, f7 as userProfilePageSeo, eX as usePageSeo, dO as parseShareAttribution, eB as trackShareLandingView } from "./index-DwV1qlqh.js";
import { h as httpUrlSchema, u as userIdSchema, i as isoDateTimeSchema, n as nonEmptyStringSchema, p as positiveIntSchema, a as nonNegativeIntSchema, c as countryCodeSchema, g as guestSessionIdSchema } from "./shared-jn_3pZJw.js";
import { P as Pencil } from "./pencil-BlnFE1Bo.js";
import { E as Earth } from "./earth-uhLNJ2d4.js";
import { M as MapPinned } from "./map-pinned-CwnGvlJZ.js";
import { u as useInvalidateInviteSummary, c as claimInviteReward, b as useInviteSummary, a as InviteCodeCardSkeleton, I as InviteCodeCard, S as Shield } from "./useInviteSummary-BqXiTpQp.js";
import { M as MapServicePlaceholder } from "./MapServicePlaceholder-Xf-uj5s5.js";
import { r as reverseGeocodePlace, g as geocodePlace } from "./geocodeTravelPlan-BXQEsjoj.js";
import { l as loadAmap } from "./amapGeocoderClient-CjYlis2t.js";
import { r as resolveMapProvider, D as DEFAULT_AMAP_VIEW, a as DEFAULT_MAP_VIEW, i as hasMapService, f as getMapboxToken } from "./provider-CMJI8edA.js";
import { H as Hash } from "./hash-KQEgZgI2.js";
import { P as Plus } from "./plus-CkCpxI1f.js";
import { T as Trash2 } from "./trash-2-DMzHlprq.js";
import { u as useDropzone } from "./index-BRXLhkE0.js";
import { L as Lock, G as Globe, a as useUserPlans, b as useUserPublicPlans } from "./useUserPlans-BzrRig6S.js";
import { u as useInfiniteScroll } from "./useInfiniteScroll-BdqSKKek.js";
import { S as SavedUserPlanListItem } from "./SavedUserPlanListItem-Unfb5qtf.js";
import { A as ArrowRight } from "./arrow-right-Dgfp7Y9Z.js";
import { a as MotionPage, M as MotionBlock } from "./MotionPage-Bc8Pg75O.js";
import { u as useUserProfile } from "./useUserProfile-BWk44L_o.js";
import { g as getTravelPlanCompanionPath } from "./travelPlanCompanionNavigation-DBWwdSWF.js";
import { u as useShareLandingTracking } from "./useShareLandingTracking-DSPHg4qR.js";
import { a as messagesThreadPath } from "./messagesPaths-DTRnqq0a.js";
import { e as ensureBuddyConversation } from "./siteChat-Ca1zNh94.js";
import { A as ArrowLeft } from "./arrow-left-DfGUbiny.js";
import "./vendor-three-Blpl5Qyv.js";
import "./check-fuogZiuU.js";
import "./appMode-mvxqt0jz.js";
import "./knownOriginFallbacks-BTkbXw-0.js";
import "./credentials-BlGlDwm4.js";
var InfiniteQueryObserver = class extends QueryObserver {
  constructor(client, options) {
    super(client, options);
  }
  bindMethods() {
    super.bindMethods();
    this.fetchNextPage = this.fetchNextPage.bind(this);
    this.fetchPreviousPage = this.fetchPreviousPage.bind(this);
  }
  setOptions(options) {
    options._type = "infinite";
    super.setOptions(options);
  }
  getOptimisticResult(options) {
    options._type = "infinite";
    return super.getOptimisticResult(options);
  }
  fetchNextPage(options) {
    return this.fetch({
      ...options,
      meta: {
        fetchMore: { direction: "forward" }
      }
    });
  }
  fetchPreviousPage(options) {
    return this.fetch({
      ...options,
      meta: {
        fetchMore: { direction: "backward" }
      }
    });
  }
  createResult(query, options) {
    var _a, _b;
    const { state } = query;
    const parentResult = super.createResult(query, options);
    const { isFetching, isRefetching, isError, isRefetchError } = parentResult;
    const fetchDirection = (_b = (_a = state.fetchMeta) == null ? void 0 : _a.fetchMore) == null ? void 0 : _b.direction;
    const isFetchNextPageError = isError && fetchDirection === "forward";
    const isFetchingNextPage = isFetching && fetchDirection === "forward";
    const isFetchPreviousPageError = isError && fetchDirection === "backward";
    const isFetchingPreviousPage = isFetching && fetchDirection === "backward";
    const result = {
      ...parentResult,
      fetchNextPage: this.fetchNextPage,
      fetchPreviousPage: this.fetchPreviousPage,
      hasNextPage: hasNextPage(options, state.data),
      hasPreviousPage: hasPreviousPage(options, state.data),
      isFetchNextPageError,
      isFetchingNextPage,
      isFetchPreviousPageError,
      isFetchingPreviousPage,
      isRefetchError: isRefetchError && !isFetchNextPageError && !isFetchPreviousPageError,
      isRefetching: isRefetching && !isFetchingNextPage && !isFetchingPreviousPage
    };
    return result;
  }
};
function useInfiniteQuery(options, queryClient) {
  return useBaseQuery(
    options,
    InfiniteQueryObserver
  );
}
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$9 = [
  [
    "path",
    {
      d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
      key: "1yiouv"
    }
  ],
  ["circle", { cx: "12", cy: "8", r: "6", key: "1vp47v" }]
];
const Award = createLucideIcon("award", __iconNode$9);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$8 = [
  [
    "path",
    {
      d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
      key: "3c2336"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const BadgeCheck = createLucideIcon("badge-check", __iconNode$8);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$7 = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  [
    "path",
    {
      d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
      key: "11g9vi"
    }
  ]
];
const Bell = createLucideIcon("bell", __iconNode$7);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$6 = [
  [
    "path",
    {
      d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
      key: "18u6gg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
];
const Camera = createLucideIcon("camera", __iconNode$6);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["path", { d: "M16 5h6", key: "1vod17" }],
  ["path", { d: "M19 2v6", key: "4bpg5p" }],
  ["path", { d: "M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5", key: "1ue2ih" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }]
];
const ImagePlus = createLucideIcon("image-plus", __iconNode$5);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  [
    "path",
    {
      d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
      key: "10ikf1"
    }
  ]
];
const Play = createLucideIcon("play", __iconNode$4);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978", key: "1n3hpd" }],
  ["path", { d: "M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978", key: "rfe1zi" }],
  ["path", { d: "M18 9h1.5a1 1 0 0 0 0-5H18", key: "7xy6bh" }],
  ["path", { d: "M4 22h16", key: "57wxv0" }],
  ["path", { d: "M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z", key: "1mhfuq" }],
  ["path", { d: "M6 9H4.5a1 1 0 0 1 0-5H6", key: "tex48p" }]
];
const Trophy = createLucideIcon("trophy", __iconNode$3);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["circle", { cx: "12", cy: "8", r: "5", key: "1hypcn" }],
  ["path", { d: "M20 21a8 8 0 0 0-16 0", key: "rfgkzh" }]
];
const UserRound = createLucideIcon("user-round", __iconNode$2);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2", key: "cjf0a3" }],
  ["path", { d: "M7 2v20", key: "1473qp" }],
  ["path", { d: "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7", key: "j28e5" }]
];
const Utensils = createLucideIcon("utensils", __iconNode$1);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",
      key: "ftymec"
    }
  ],
  ["rect", { x: "2", y: "6", width: "14", height: "12", rx: "2", key: "158x01" }]
];
const Video = createLucideIcon("video", __iconNode);
const TOGGLE_LIKE_DELAY_MS = 120;
function delay$1(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
async function fetchMomentLikes() {
  return readMomentLikesStorage();
}
async function toggleMomentLikeApi(momentId) {
  await delay$1(TOGGLE_LIKE_DELAY_MS);
  const current = readMomentLikesStorage();
  const next = current.includes(momentId) ? current.filter((id) => id !== momentId) : [...current, momentId];
  writeMomentLikesStorage(next);
  return next;
}
function useMomentLikes(enabled = true) {
  return useQuery({
    queryKey: queryKeys.travelMoments.likes(),
    queryFn: fetchMomentLikes,
    enabled,
    staleTime: Infinity,
    gcTime: Infinity
  });
}
function useToggleMomentLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (momentId) => toggleMomentLikeApi(momentId),
    onMutate: async (momentId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.travelMoments.likes() });
      const previous = queryClient.getQueryData(queryKeys.travelMoments.likes()) ?? [];
      const next = previous.includes(momentId) ? previous.filter((id) => id !== momentId) : [...previous, momentId];
      const isNowLiked = !previous.includes(momentId);
      awardMomentSaltIfLiked(momentId, isNowLiked);
      queryClient.setQueryData(queryKeys.travelMoments.likes(), next);
      writeMomentLikesStorage(next);
      return { previous };
    },
    onError: (_error, _momentId, context) => {
      if (context) {
        queryClient.setQueryData(queryKeys.travelMoments.likes(), context.previous);
        writeMomentLikesStorage(context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.travelMoments.likes() });
    }
  });
}
function collectMomentTags(moments) {
  const counts = /* @__PURE__ */ new Map();
  for (const moment of moments) {
    for (const tag of getMomentTags(moment)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN")).map(([tag]) => tag);
}
function filterMomentsByTag(moments, tag) {
  if (!tag) {
    return moments;
  }
  return moments.filter((moment) => getMomentTags(moment).includes(tag));
}
const TRAVEL_MOMENTS_PAGE_SIZE = 2;
const TRAVEL_MOMENTS_FETCH_DELAY_MS = 380;
function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
async function fetchTravelMomentsPage(params) {
  const limit = params.limit ?? TRAVEL_MOMENTS_PAGE_SIZE;
  const filtered = filterMomentsByTag(params.moments, params.tag ?? null);
  const items = filtered.slice(params.offset, params.offset + limit);
  const nextOffset = params.offset + items.length;
  await delay(TRAVEL_MOMENTS_FETCH_DELAY_MS);
  return {
    items,
    nextOffset,
    hasMore: nextOffset < filtered.length,
    total: filtered.length
  };
}
function travelMomentsFingerprint(moments) {
  var _a, _b;
  if (moments.length === 0) {
    return "0";
  }
  const first = ((_a = moments[0]) == null ? void 0 : _a.id) ?? "";
  const last = ((_b = moments[moments.length - 1]) == null ? void 0 : _b.id) ?? "";
  return `${moments.length}:${first}:${last}`;
}
function useInfiniteTravelMoments({
  moments,
  authorId = "profile",
  activeTag = null,
  pageSize = TRAVEL_MOMENTS_PAGE_SIZE,
  enabled = true
}) {
  var _a, _b, _c;
  const fingerprint = travelMomentsFingerprint(moments);
  const query = useInfiniteQuery({
    queryKey: queryKeys.travelMoments.infinite(authorId, activeTag, fingerprint),
    queryFn: ({ pageParam }) => fetchTravelMomentsPage({
      moments,
      offset: pageParam,
      limit: pageSize,
      tag: activeTag
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextOffset : void 0,
    enabled
  });
  const items = reactExports.useMemo(
    () => {
      var _a2;
      return ((_a2 = query.data) == null ? void 0 : _a2.pages.flatMap((page) => page.items)) ?? [];
    },
    [(_a = query.data) == null ? void 0 : _a.pages]
  );
  const total = ((_c = (_b = query.data) == null ? void 0 : _b.pages[0]) == null ? void 0 : _c.total) ?? 0;
  const hasMore = Boolean(query.hasNextPage);
  const loadMore = async () => {
    if (!hasMore || query.isFetchingNextPage) {
      return;
    }
    await query.fetchNextPage();
  };
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: enabled && hasMore,
    isLoading: query.isFetchingNextPage,
    disabled: !enabled || query.isLoading
  });
  const retry = () => {
    void query.refetch();
  };
  return {
    items,
    isLoading: query.isFetchingNextPage,
    isReady: query.isSuccess || query.isError,
    hasMore,
    error: query.error ? "加载失败，请稍后重试" : null,
    total,
    loadMore,
    retry,
    sentinelRef
  };
}
function dedupePlans(plans) {
  const seen = /* @__PURE__ */ new Set();
  return plans.filter((plan) => {
    if (seen.has(plan.id)) {
      return false;
    }
    seen.add(plan.id);
    return true;
  });
}
function getUserProfilePlans(userId, generatedPlans = []) {
  const demoPlans = getRecentTravelPlans(20).filter((plan) => getPlanCreator(plan).id === userId);
  if (userId === DEMO_CURRENT_USER_ID) {
    return dedupePlans([...generatedPlans, ...demoPlans]).sort(
      (a, b) => new Date(getPlanSortTime(b)).getTime() - new Date(getPlanSortTime(a)).getTime()
    );
  }
  return demoPlans;
}
function getPlanSortTime(plan) {
  if (isEnrichedTravelPlan(plan)) {
    return plan.presentation.generatedAt;
  }
  return (/* @__PURE__ */ new Date()).toISOString();
}
function getUserProfileFavoritePlans(userId, favoritedPlanIds, generatedPlans = [], isOwnProfile) {
  const demoIds = DEMO_USER_FAVORITE_PLAN_IDS[userId] ?? [];
  const ids = isOwnProfile && favoritedPlanIds.length > 0 ? favoritedPlanIds : demoIds.length > 0 ? demoIds : favoritedPlanIds;
  return ids.map((id) => findTravelPlanById(id, generatedPlans)).filter((plan) => plan != null);
}
function getUserProfileMoments(user, options) {
  return [...user.travelMoments].filter(
    (moment) => canViewTravelMoment({
      moment,
      authorId: user.id,
      viewerId: options.viewerId,
      isOwnProfile: options.isOwnProfile
    })
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
function resolveProfileCompanions(userIds) {
  return userIds.map((id) => findUserById(id)).filter((user) => user != null).map((user) => ({
    userId: user.id,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio
  }));
}
function getUserProfileFollowing(userId) {
  var _a;
  const following = ((_a = DEMO_USER_CONNECTIONS[userId]) == null ? void 0 : _a.following) ?? [];
  return resolveProfileCompanions(following);
}
function getUserProfileFollowers(userId) {
  var _a;
  const followers = ((_a = DEMO_USER_CONNECTIONS[userId]) == null ? void 0 : _a.followers) ?? [];
  return resolveProfileCompanions(followers);
}
function useUserProfileContent(user, isOwnProfile) {
  const generatedPlans = useGeneratedPlansStore((state) => state.plans);
  const { data: planInteractions } = usePlanInteractions(isOwnProfile);
  const favoritedPlanIds = (planInteractions == null ? void 0 : planInteractions.favorited) ?? [];
  return reactExports.useMemo(() => {
    if (!user) {
      return null;
    }
    return {
      plans: getUserProfilePlans(user.id, generatedPlans),
      moments: getUserProfileMoments(user, {
        isOwnProfile,
        viewerId: DEMO_CURRENT_USER_ID
      }),
      favorites: getUserProfileFavoritePlans(
        user.id,
        favoritedPlanIds,
        generatedPlans,
        isOwnProfile
      ),
      following: getUserProfileFollowing(user.id),
      followers: getUserProfileFollowers(user.id)
    };
  }, [user, generatedPlans, favoritedPlanIds, isOwnProfile]);
}
function getDefaultMapView() {
  if (resolveMapProvider() === "amap") {
    return DEFAULT_AMAP_VIEW;
  }
  return DEFAULT_MAP_VIEW;
}
function formatCoordinatesLabel(coords) {
  const lat = coords.latitude.toFixed(4);
  const lng = coords.longitude.toFixed(4);
  if (isChinaPrimaryMarket()) {
    return `北纬 ${lat}，东经 ${lng}`;
  }
  return `${lat}°N, ${lng}°E`;
}
function MapboxMomentSurface({ pin, initialView, onPick }) {
  const mapboxToken = reactExports.useMemo(() => getMapboxToken(), []);
  if (!mapboxToken) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Map$1,
    {
      mapboxAccessToken: mapboxToken,
      initialViewState: {
        longitude: initialView.longitude,
        latitude: initialView.latitude,
        zoom: pin ? 13 : initialView.zoom
      },
      style: { width: "100%", height: "100%" },
      mapStyle: "mapbox://styles/mapbox/streets-v12",
      attributionControl: true,
      reuseMaps: true,
      cursor: "crosshair",
      onClick: (event) => onPick(event.lngLat.lng, event.lngLat.lat),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationControl, { position: "top-right", showCompass: false, showZoom: true }),
        pin && /* @__PURE__ */ jsxRuntimeExports.jsx(Marker, { longitude: pin.longitude, latitude: pin.latitude, anchor: "bottom", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg ring-2 ring-white",
            "aria-hidden": true,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" })
          }
        ) })
      ]
    }
  );
}
function AmapMomentSurface({ pin, initialView, onPick }) {
  const containerId = reactExports.useId().replace(/:/g, "");
  const mapRef = reactExports.useRef(null);
  const markerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    let disposed = false;
    loadAmap().then((AMapNS) => {
      if (disposed) {
        return;
      }
      const map = new AMapNS.Map(containerId, {
        zoom: pin ? 13 : initialView.zoom,
        center: [initialView.longitude, initialView.latitude],
        viewMode: "2D"
      });
      map.on("click", (event) => {
        onPick(event.lnglat.getLng(), event.lnglat.getLat());
      });
      mapRef.current = map;
    });
    return () => {
      var _a, _b;
      disposed = true;
      (_a = markerRef.current) == null ? void 0 : _a.setMap(null);
      markerRef.current = null;
      (_b = mapRef.current) == null ? void 0 : _b.destroy();
      mapRef.current = null;
    };
  }, [containerId, initialView.latitude, initialView.longitude, initialView.zoom, onPick]);
  reactExports.useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    loadAmap().then((AMapNS) => {
      var _a;
      if (!pin) {
        (_a = markerRef.current) == null ? void 0 : _a.setMap(null);
        markerRef.current = null;
        map.setZoomAndCenter(initialView.zoom, [initialView.longitude, initialView.latitude]);
        return;
      }
      if (!markerRef.current) {
        markerRef.current = new AMapNS.Marker({
          position: [pin.longitude, pin.latitude],
          anchor: "bottom-center"
        });
        markerRef.current.setMap(map);
      } else {
        markerRef.current.setPosition([pin.longitude, pin.latitude]);
      }
      map.setZoomAndCenter(13, [pin.longitude, pin.latitude]);
    });
  }, [initialView.latitude, initialView.longitude, initialView.zoom, pin]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: containerId, className: "h-full w-full" });
}
function TravelMomentMapPicker({
  value,
  onChange,
  className
}) {
  const provider = reactExports.useMemo(() => resolveMapProvider(), []);
  const mapReady = hasMapService();
  const defaultView = reactExports.useMemo(() => getDefaultMapView(), []);
  const [mapOpen, setMapOpen] = reactExports.useState(Boolean(value.coordinates));
  const [isResolving, setIsResolving] = reactExports.useState(false);
  const [mapError, setMapError] = reactExports.useState(null);
  const initialView = reactExports.useMemo(() => {
    if (value.coordinates) {
      return { ...value.coordinates, zoom: defaultView.zoom };
    }
    return defaultView;
  }, [value.coordinates, defaultView]);
  const applyPick = reactExports.useCallback(
    async (longitude, latitude) => {
      setIsResolving(true);
      setMapError(null);
      const result = await reverseGeocodePlace(longitude, latitude);
      setIsResolving(false);
      if (!result) {
        setMapError("无法解析该位置，请重试或手动输入地点");
        onChange({
          label: formatCoordinatesLabel({ longitude, latitude }),
          coordinates: { longitude, latitude }
        });
        return;
      }
      onChange({
        label: result.placeName,
        coordinates: result.coordinates,
        countryCode: result.countryCode
      });
    },
    [onChange]
  );
  const handleGeocodeText = reactExports.useCallback(async () => {
    const query = value.label.trim();
    if (!query || !mapReady) {
      return;
    }
    setIsResolving(true);
    setMapError(null);
    const coords = await geocodePlace(query, { limit: 1 });
    setIsResolving(false);
    if (!coords) {
      setMapError("未找到该地点，请在地图上点击选点");
      return;
    }
    const result = await reverseGeocodePlace(coords.longitude, coords.latitude);
    onChange({
      label: (result == null ? void 0 : result.placeName) ?? query,
      coordinates: coords,
      countryCode: result == null ? void 0 : result.countryCode
    });
    setMapOpen(true);
  }, [mapReady, onChange, value.label]);
  const pin = value.coordinates;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-2", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setMapOpen((prev) => !prev),
          className: cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
            mapOpen ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-violet-200"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5", "aria-hidden": true }),
            mapOpen ? "收起地图" : "地图选点"
          ]
        }
      ),
      value.label.trim() && mapReady && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: handleGeocodeText,
          disabled: isResolving,
          className: "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-200 hover:text-brand-700 disabled:opacity-50",
          children: "文字定位"
        }
      ),
      pin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            onChange({ label: value.label, coordinates: void 0, countryCode: void 0 });
            setMapError(null);
          },
          className: "inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5", "aria-hidden": true }),
            "清除标记"
          ]
        }
      )
    ] }),
    pin && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-emerald-700", children: [
      "已标记：",
      value.label,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-slate-400", children: [
        "(",
        formatCoordinatesLabel(pin),
        ")"
      ] })
    ] }),
    mapError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700", role: "status", children: mapError }),
    mapOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100", children: !mapReady || !provider ? /* @__PURE__ */ jsxRuntimeExports.jsx(MapServicePlaceholder, { className: "min-h-52", compact: true }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-52 w-full sm:h-56", children: provider === "amap" ? /* @__PURE__ */ jsxRuntimeExports.jsx(AmapMomentSurface, { pin, initialView, onPick: applyPick }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MapboxMomentSurface, { pin, initialView, onPick: applyPick }) }),
      isResolving && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex items-center justify-center bg-white/70", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-violet-600", "aria-hidden": true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "正在解析位置" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "border-t border-slate-200/80 bg-white px-3 py-2 text-[10px] text-slate-500", children: "点击地图放置标记，将自动填入地点名称" })
    ] }) })
  ] });
}
const TRAVEL_MOMENT_TAG_PRESETS = [
  "美食",
  "摄影",
  "穷游",
  "自然风光",
  "城市漫步",
  "人文",
  "冒险",
  "亲子",
  "海岛",
  "古镇",
  "夜市",
  "徒步",
  "博物馆",
  "咖啡",
  "露营"
];
const TRAVEL_MOMENT_TAG_LIMITS = {
  maxTags: 8,
  maxTagLength: 16,
  maxDescriptionLength: 500,
  maxDetailLength: 2e3
};
function normalizeTravelMomentTag(raw) {
  return raw.trim().replace(/\s+/g, " ").slice(0, TRAVEL_MOMENT_TAG_LIMITS.maxTagLength);
}
function isValidTravelMomentTag(tag) {
  const normalized = normalizeTravelMomentTag(tag);
  return normalized.length >= 1 && normalized.length <= TRAVEL_MOMENT_TAG_LIMITS.maxTagLength;
}
function toggleTagSelection(selected, tag) {
  const normalized = normalizeTravelMomentTag(tag);
  if (!isValidTravelMomentTag(normalized)) {
    return selected;
  }
  if (selected.includes(normalized)) {
    return selected.filter((item) => item !== normalized);
  }
  if (selected.length >= TRAVEL_MOMENT_TAG_LIMITS.maxTags) {
    return selected;
  }
  return [...selected, normalized];
}
function addCustomTag(selected, raw) {
  const normalized = normalizeTravelMomentTag(raw);
  if (!isValidTravelMomentTag(normalized)) {
    return { tags: selected, error: "标签不能为空" };
  }
  if (selected.includes(normalized)) {
    return { tags: selected, error: "标签已存在" };
  }
  if (selected.length >= TRAVEL_MOMENT_TAG_LIMITS.maxTags) {
    return { tags: selected, error: `最多 ${TRAVEL_MOMENT_TAG_LIMITS.maxTags} 个标签` };
  }
  return { tags: [...selected, normalized] };
}
function isPresetTag(tag) {
  return TRAVEL_MOMENT_TAG_PRESETS.includes(tag);
}
function TravelMomentTagPicker({ value, onChange, className }) {
  const [customDraft, setCustomDraft] = reactExports.useState("");
  const [tagError, setTagError] = reactExports.useState(null);
  const handleTogglePreset = reactExports.useCallback(
    (tag) => {
      setTagError(null);
      onChange(toggleTagSelection(value, tag));
    },
    [onChange, value]
  );
  const handleAddCustom = reactExports.useCallback(() => {
    const result = addCustomTag(value, customDraft);
    onChange(result.tags);
    if (result.error) {
      setTagError(result.error);
      return;
    }
    setTagError(null);
    setCustomDraft("");
  }, [customDraft, onChange, value]);
  const handleCustomKeyDown = reactExports.useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleAddCustom();
      }
    },
    [handleAddCustom]
  );
  const handleRemove = reactExports.useCallback(
    (tag) => {
      onChange(value.filter((item) => item !== tag));
      setTagError(null);
    },
    [onChange, value]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-2", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-slate-600", htmlFor: "moment-custom-tag", children: "标签" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-slate-400", children: [
        value.length,
        "/",
        TRAVEL_MOMENT_TAG_LIMITS.maxTags
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", role: "group", "aria-label": "推荐标签", children: TRAVEL_MOMENT_TAG_PRESETS.map((tag) => {
      const selected = value.includes(tag);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => handleTogglePreset(tag),
          className: cn(
            "rounded-full border px-2.5 py-1 text-xs font-medium transition",
            selected ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
          ),
          "aria-pressed": selected,
          children: [
            "#",
            tag
          ]
        },
        tag
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Hash,
          {
            className: "pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400",
            "aria-hidden": true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "moment-custom-tag",
            type: "text",
            value: customDraft,
            onChange: (event) => setCustomDraft(event.target.value),
            onKeyDown: handleCustomKeyDown,
            placeholder: "自定义标签，回车添加",
            maxLength: TRAVEL_MOMENT_TAG_LIMITS.maxTagLength,
            className: "block w-full rounded-xl border border-slate-200 py-2 pl-8 pr-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: handleAddCustom,
          className: "inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-violet-200",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5", "aria-hidden": true }),
            "添加"
          ]
        }
      )
    ] }),
    tagError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-rose-600", role: "status", children: tagError }),
    value.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-wrap gap-1.5", "aria-label": "已选标签", children: value.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "span",
      {
        className: cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
          isPresetTag(tag) ? "border-violet-200 bg-violet-50 text-violet-800" : "border-cyan-200 bg-cyan-50 text-cyan-800"
        ),
        children: [
          "#",
          tag,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => handleRemove(tag),
              className: "rounded-full p-0.5 hover:bg-black/10",
              "aria-label": `移除标签 ${tag}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3", "aria-hidden": true })
            }
          )
        ]
      }
    ) }, tag)) })
  ] });
}
const TRAVEL_MOMENT_MEDIA_LIMITS = {
  maxImages: 9,
  maxImageBytes: 4 * 1024 * 1024,
  maxVideoBytes: 20 * 1024 * 1024,
  maxTitleLength: 120
};
function isImageFile(file) {
  return file.type.startsWith("image/");
}
function isVideoFile(file) {
  return file.type.startsWith("video/");
}
function validateMomentMediaFile(file) {
  if (isImageFile(file)) {
    if (file.size > TRAVEL_MOMENT_MEDIA_LIMITS.maxImageBytes) {
      return `图片「${file.name}」超过 4MB 上限`;
    }
    return null;
  }
  if (isVideoFile(file)) {
    if (file.size > TRAVEL_MOMENT_MEDIA_LIMITS.maxVideoBytes) {
      return `视频「${file.name}」超过 20MB 上限`;
    }
    return null;
  }
  return "仅支持图片或视频文件";
}
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("无法读取文件"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("无法读取文件"));
    reader.readAsDataURL(file);
  });
}
function revokeMediaPreviewUrls(files) {
  for (const item of files) {
    if (item.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(item.previewUrl);
    }
  }
}
function createMediaFileEntry(file) {
  return {
    id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    kind: isVideoFile(file) ? "video" : "image"
  };
}
function TravelMomentComposeFields({
  title,
  description,
  detail,
  tags,
  locationPin,
  onTitleChange,
  onDescriptionChange,
  onDetailChange,
  onTagsChange,
  onLocationPinChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", htmlFor: "moment-title", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1 block text-xs font-medium text-slate-600", children: "标题（可选）" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          id: "moment-title",
          type: "text",
          value: title,
          onChange: (event) => onTitleChange(event.target.value),
          placeholder: "给瞬间起个标题",
          maxLength: TRAVEL_MOMENT_MEDIA_LIMITS.maxTitleLength,
          className: "block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mb-1 block text-xs font-medium text-slate-600", htmlFor: "moment-description", children: [
        "描述 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-rose-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          id: "moment-description",
          value: description,
          onChange: (event) => onDescriptionChange(event.target.value),
          placeholder: "用一两句话描述这个瞬间，如味道、风景或心情…",
          rows: 3,
          maxLength: TRAVEL_MOMENT_TAG_LIMITS.maxDescriptionLength,
          className: "block w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-right text-xs text-slate-500", children: [
        description.length,
        "/",
        TRAVEL_MOMENT_TAG_LIMITS.maxDescriptionLength
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1 block text-xs font-medium text-slate-600", htmlFor: "moment-detail", children: "详细内容（可选）" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          id: "moment-detail",
          value: detail,
          onChange: (event) => onDetailChange(event.target.value),
          placeholder: "补充更多故事、攻略或避坑提示…",
          rows: 4,
          maxLength: TRAVEL_MOMENT_TAG_LIMITS.maxDetailLength,
          className: "block w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TravelMomentTagPicker, { value: tags, onChange: onTagsChange }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-slate-600", htmlFor: "moment-location-input", children: "位置标记" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MapPin,
          {
            className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",
            "aria-hidden": true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "moment-location-input",
            type: "text",
            value: locationPin.label,
            onChange: (event) => onLocationPinChange({
              label: event.target.value,
              coordinates: void 0,
              countryCode: void 0
            }),
            placeholder: "地点名称，或点击下方地图选点",
            className: "block w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TravelMomentMapPicker, { value: locationPin, onChange: onLocationPinChange })
    ] })
  ] });
}
function TravelMomentMediaSection({
  mediaFiles,
  dropHint,
  isDragActive,
  isPublishing,
  getRootProps,
  getInputProps,
  onRemoveMedia
}) {
  const dropzoneId = "moment-media-dropzone";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ...getRootProps(),
        id: dropzoneId,
        "aria-labelledby": "moment-media-dropzone-label",
        "aria-describedby": "moment-media-dropzone-hint",
        className: cn(
          "mt-4 cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 text-center transition",
          isDragActive ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white/60 hover:border-violet-300 hover:bg-violet-50/30",
          isPublishing && "pointer-events-none opacity-60"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ...getInputProps(), "aria-label": "选择图片或视频文件" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "h-6 w-6", "aria-hidden": true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "moment-media-dropzone-label", className: "mt-2 text-sm font-medium text-slate-800", children: isDragActive ? "松开即可上传" : "点击或拖拽上传图片/视频" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "moment-media-dropzone-hint", className: "mt-1 text-xs text-slate-600", children: dropHint })
        ]
      }
    ),
    mediaFiles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4", children: mediaFiles.map((item, mediaIndex) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "group relative overflow-hidden rounded-lg border border-slate-200", children: [
      item.kind === "video" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square bg-slate-900", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "video",
          {
            src: item.previewUrl,
            className: "h-full w-full object-cover",
            muted: true,
            playsInline: true,
            "aria-label": getMomentUploadPreviewAlt(mediaIndex, "video")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute bottom-1 left-1 inline-flex items-center gap-0.5 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-3 w-3", "aria-hidden": true }),
          "视频"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        OptimizedImage,
        {
          src: item.previewUrl,
          alt: getMomentUploadPreviewAlt(mediaIndex, "image"),
          fill: true,
          priority: true,
          sizes: "120px",
          widths: [120, 240]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onRemoveMedia(item.id),
          className: "absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100",
          "aria-label": "移除媒体",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5", "aria-hidden": true })
        }
      )
    ] }, item.id)) })
  ] });
}
function TravelMomentPublishBar({
  hasVideo,
  imageCount,
  error,
  isPublishing,
  canPublish,
  onPublish
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap items-center justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-slate-400", children: hasVideo ? "1 个视频" : `${imageCount} 张图片` }) }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: "mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800",
        role: "alert",
        children: error
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: onPublish,
        disabled: isPublishing || !canPublish,
        className: "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-500 sm:w-auto",
        children: isPublishing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin", "aria-hidden": true }),
          "发布中…"
        ] }) : "发布瞬间"
      }
    )
  ] });
}
function TravelMomentVisibilityField({
  visibility,
  onChange
}) {
  var _a;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "mt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "text-xs font-medium text-slate-600", children: "可见范围" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: TRAVEL_MOMENT_VISIBILITY_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "label",
      {
        className: cn(
          "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition",
          visibility === option.value ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "moment-visibility",
              value: option.value,
              checked: visibility === option.value,
              onChange: () => onChange(option.value),
              className: "sr-only"
            }
          ),
          option.label
        ]
      },
      option.value
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-[11px] text-slate-500", children: (_a = TRAVEL_MOMENT_VISIBILITY_OPTIONS.find((option) => option.value === visibility)) == null ? void 0 : _a.hint })
  ] });
}
function applyTravelMomentMediaDrop(prev, accepted) {
  if (accepted.length === 0) {
    return { ok: true, files: prev };
  }
  const entries = [];
  for (const file of accepted) {
    const validationError = validateMomentMediaFile(file);
    if (validationError) {
      return { ok: false, error: validationError };
    }
    entries.push(createMediaFileEntry(file));
  }
  const incomingVideo = entries.find((item) => item.kind === "video");
  const incomingImages = entries.filter((item) => item.kind === "image");
  if (incomingVideo && incomingImages.length > 0) {
    revokeMediaPreviewUrls(entries);
    return { ok: false, error: "请分次上传：单次仅支持 1 个视频，或若干图片" };
  }
  if (incomingVideo) {
    revokeMediaPreviewUrls(prev);
    return { ok: true, files: [incomingVideo] };
  }
  if (prev.some((item) => item.kind === "video")) {
    revokeMediaPreviewUrls(entries);
    return { ok: false, error: "已选择视频，无法再添加图片" };
  }
  const merged = [...prev, ...incomingImages];
  if (merged.length > TRAVEL_MOMENT_MEDIA_LIMITS.maxImages) {
    revokeMediaPreviewUrls(incomingImages);
    return { ok: false, error: `最多上传 ${TRAVEL_MOMENT_MEDIA_LIMITS.maxImages} 张图片` };
  }
  return { ok: true, files: merged };
}
function useTravelMomentMediaUpload(disabled = false) {
  const [mediaFiles, setMediaFiles] = reactExports.useState([]);
  const [error, setError] = reactExports.useState(null);
  const mediaFilesRef = reactExports.useRef(mediaFiles);
  mediaFilesRef.current = mediaFiles;
  reactExports.useEffect(
    () => () => {
      revokeMediaPreviewUrls(mediaFilesRef.current);
    },
    []
  );
  const onDrop = reactExports.useCallback((accepted) => {
    setError(null);
    setMediaFiles((prev) => {
      const result = applyTravelMomentMediaDrop(prev, accepted);
      if (!result.ok) {
        setError(result.error);
        return prev;
      }
      return result.files;
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (rejections) => {
      var _a, _b;
      const message = (_b = (_a = rejections[0]) == null ? void 0 : _a.errors[0]) == null ? void 0 : _b.message;
      setError(message ?? "文件类型不支持");
    },
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".mov"]
    },
    maxFiles: TRAVEL_MOMENT_MEDIA_LIMITS.maxImages,
    disabled
  });
  const handleRemoveMedia = reactExports.useCallback((id) => {
    setMediaFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        revokeMediaPreviewUrls([target]);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);
  const clearMedia = reactExports.useCallback(() => {
    setMediaFiles((prev) => {
      revokeMediaPreviewUrls(prev);
      return [];
    });
  }, []);
  const hasVideo = mediaFiles.some((item) => item.kind === "video");
  const imageCount = mediaFiles.filter((item) => item.kind === "image").length;
  const dropHint = hasVideo ? "已选视频，可拖入替换" : `拖入图片（最多 ${TRAVEL_MOMENT_MEDIA_LIMITS.maxImages} 张）或 1 个短视频`;
  return {
    mediaFiles,
    error,
    setError,
    getRootProps,
    getInputProps,
    isDragActive,
    handleRemoveMedia,
    clearMedia,
    hasVideo,
    imageCount,
    dropHint
  };
}
function buildTravelMomentRecord(input) {
  const trimmedDescription = input.description.trim();
  const trimmedDetail = input.detail.trim();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    id: `moment-${Date.now()}`,
    authorId: input.authorId,
    description: trimmedDescription,
    content: trimmedDetail || trimmedDescription,
    title: input.title.trim() || void 0,
    tags: input.tags,
    imageUrls: input.imageUrls.length > 0 ? input.imageUrls : void 0,
    videoUrl: input.videoUrl,
    location: input.locationPin.label.trim() || void 0,
    coordinates: input.locationPin.coordinates,
    countryCode: input.locationPin.countryCode,
    visibility: input.visibility,
    likeCount: 0,
    commentCount: 0,
    createdAt: now,
    updatedAt: now
  };
}
async function readMomentMediaDataUrls(mediaFiles) {
  const imageUrls = [];
  let videoUrl;
  for (const item of mediaFiles) {
    const dataUrl = await readFileAsDataUrl(item.file);
    if (item.kind === "video") {
      videoUrl = dataUrl;
    } else {
      imageUrls.push(dataUrl);
    }
  }
  return { imageUrls, videoUrl };
}
function validateTravelMomentPublishFields(values) {
  const trimmedDescription = values.description.trim();
  if (!trimmedDescription) {
    return "请填写瞬间描述";
  }
  if (trimmedDescription.length > TRAVEL_MOMENT_TAG_LIMITS.maxDescriptionLength) {
    return `描述不超过 ${TRAVEL_MOMENT_TAG_LIMITS.maxDescriptionLength} 字`;
  }
  if (values.detail.trim().length > TRAVEL_MOMENT_TAG_LIMITS.maxDetailLength) {
    return `详细内容不超过 ${TRAVEL_MOMENT_TAG_LIMITS.maxDetailLength} 字`;
  }
  return null;
}
function useTravelMomentPublishForm({
  authorId,
  defaultVisibility = "public",
  onPublished
}) {
  const addMoment = useTravelMomentsStore((state) => state.addMoment);
  const hydrateMoments = useTravelMomentsStore((state) => state.hydrate);
  const [title, setTitle] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [detail, setDetail] = reactExports.useState("");
  const [tags, setTags] = reactExports.useState([]);
  const [locationPin, setLocationPin] = reactExports.useState({ label: "" });
  const [visibility, setVisibility] = reactExports.useState(defaultVisibility);
  const [error, setError] = reactExports.useState(null);
  const [isPublishing, setIsPublishing] = reactExports.useState(false);
  reactExports.useEffect(() => {
    hydrateMoments();
  }, [hydrateMoments]);
  const resetFields = reactExports.useCallback(() => {
    setTitle("");
    setDescription("");
    setDetail("");
    setTags([]);
    setLocationPin({ label: "" });
    setVisibility(defaultVisibility);
    setError(null);
  }, [defaultVisibility]);
  const publish = reactExports.useCallback(
    async (mediaFiles, clearMedia) => {
      const validationError = validateTravelMomentPublishFields({ description, detail });
      if (validationError) {
        setError(validationError);
        return;
      }
      setIsPublishing(true);
      setError(null);
      try {
        const { imageUrls, videoUrl } = await readMomentMediaDataUrls(mediaFiles);
        const moment = buildTravelMomentRecord({
          authorId,
          title,
          description,
          detail,
          tags,
          locationPin,
          visibility,
          imageUrls,
          videoUrl
        });
        addMoment(authorId, moment);
        onPublished == null ? void 0 : onPublished(moment);
        resetFields();
        clearMedia();
      } catch {
        setError("发布失败，请检查媒体文件大小后重试");
      } finally {
        setIsPublishing(false);
      }
    },
    [
      addMoment,
      authorId,
      description,
      detail,
      locationPin,
      onPublished,
      resetFields,
      tags,
      title,
      visibility
    ]
  );
  return {
    title,
    setTitle,
    description,
    setDescription,
    detail,
    setDetail,
    tags,
    setTags,
    locationPin,
    setLocationPin,
    visibility,
    setVisibility,
    error,
    setError,
    isPublishing,
    publish,
    canPublish: Boolean(description.trim())
  };
}
function TravelMoment({
  authorId,
  defaultVisibility = "public",
  onPublished,
  className
}) {
  const form = useTravelMomentPublishForm({
    authorId,
    defaultVisibility,
    onPublished
  });
  const media = useTravelMomentMediaUpload(form.isPublishing);
  const displayError = reactExports.useMemo(
    () => form.error ?? media.error,
    [form.error, media.error]
  );
  const handlePublish = () => {
    void form.publish(media.mediaFiles, media.clearMedia);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn(
        "rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/80 via-white to-cyan-50/50 p-4 shadow-sm sm:p-5",
        className
      ),
      "aria-labelledby": "travel-moment-compose-title",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-violet-600", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "travel-moment-compose-title", className: "text-sm font-semibold text-slate-900", children: "分享旅行瞬间" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "填写描述与标签，支持图片、视频与地图选点" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TravelMomentComposeFields,
          {
            title: form.title,
            description: form.description,
            detail: form.detail,
            tags: form.tags,
            locationPin: form.locationPin,
            onTitleChange: form.setTitle,
            onDescriptionChange: form.setDescription,
            onDetailChange: form.setDetail,
            onTagsChange: form.setTags,
            onLocationPinChange: form.setLocationPin
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TravelMomentMediaSection,
          {
            mediaFiles: media.mediaFiles,
            dropHint: media.dropHint,
            isDragActive: media.isDragActive,
            isPublishing: form.isPublishing,
            getRootProps: media.getRootProps,
            getInputProps: media.getInputProps,
            onRemoveMedia: media.handleRemoveMedia
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TravelMomentVisibilityField, { visibility: form.visibility, onChange: form.setVisibility }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TravelMomentPublishBar,
          {
            hasVideo: media.hasVideo,
            imageCount: media.imageCount,
            error: displayError,
            isPublishing: form.isPublishing,
            canPublish: form.canPublish,
            onPublish: handlePublish
          }
        )
      ]
    }
  );
}
function getTravelMomentSharePath(moment, authorId, options) {
  const isOwnProfile = (options == null ? void 0 : options.isOwnProfile) ?? authorId === DEMO_CURRENT_USER_ID;
  return travelMomentSharePath(authorId, moment.id, { isOwnProfile });
}
function getTravelMomentShareSummary(moment, authorName) {
  var _a, _b;
  const description = getMomentDescription(moment);
  const title = (_a = moment.title) == null ? void 0 : _a.trim();
  const location = (_b = moment.location) == null ? void 0 : _b.trim();
  const tags = getMomentTags(moment).slice(0, 3).join(" · ");
  const head = title || description.slice(0, 48) || "旅行瞬间";
  const parts = [authorName, location, tags].filter(Boolean);
  return parts.length > 0 ? `${head} · ${parts.join(" · ")}` : head;
}
async function shareTravelMoment(params) {
  var _a;
  if (typeof window === "undefined") {
    return "failed";
  }
  const { moment, authorId, authorName, isOwnProfile } = params;
  const tracking = { contentKind: "travel_moment", contentId: moment.id };
  const url = buildShareUrl(getTravelMomentSharePath(moment, authorId, { isOwnProfile }), tracking);
  const text = getTravelMomentShareSummary(moment, authorName);
  const title = ((_a = moment.title) == null ? void 0 : _a.trim()) || `${authorName} 的旅行瞬间`;
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      trackShareOutcome(tracking, "shared", { channel: "native", shareUrl: url });
      return "shared";
    }
    await navigator.clipboard.writeText(`${text}
${url}`);
    trackShareOutcome(tracking, "copied", { channel: "link", shareUrl: url });
    return "copied";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }
    try {
      await navigator.clipboard.writeText(`${text}
${url}`);
      trackShareOutcome(tracking, "copied", { channel: "link", shareUrl: url });
      return "copied";
    } catch {
      return "failed";
    }
  }
}
function getTravelMomentPosterSubtitle(moment, authorName) {
  var _a;
  const location = (_a = moment.location) == null ? void 0 : _a.trim();
  if (location) {
    return `${authorName} · ${location}`;
  }
  return authorName;
}
function getMomentPosterCoverUrl(moment) {
  return resolveRemoteImageUrl(getMomentCoverUrl(moment), { width: 720 });
}
function isPlaceholderImageUrl(url) {
  try {
    return new URL(url).hostname.includes("picsum.photos");
  } catch {
    return false;
  }
}
function resolveMomentSlideUrls(moment) {
  const urls = (moment.imageUrls ?? []).filter((url) => url && !isPlaceholderImageUrl(url)).map((url) => resolveRemoteImageUrl(url, { width: 720 })).filter(Boolean);
  if (urls.length > 0) {
    return urls.slice(0, 8);
  }
  return [getMomentPosterCoverUrl(moment)];
}
function momentSharePosterInput(params) {
  var _a, _b;
  const { moment, authorId, authorName, isOwnProfile } = params;
  const title = ((_a = moment.title) == null ? void 0 : _a.trim()) || getMomentDescription(moment).slice(0, 40) || "旅行瞬间";
  const location = (_b = moment.location) == null ? void 0 : _b.trim();
  return {
    input: {
      badge: "旅行瞬间",
      title,
      subtitle: getTravelMomentPosterSubtitle(moment, authorName),
      summary: getTravelMomentShareSummary(moment, authorName),
      shareUrl: buildShareUrl(getTravelMomentSharePath(moment, authorId, { isOwnProfile }), {
        contentKind: "travel_moment",
        contentId: moment.id
      }),
      coverImageUrl: getMomentPosterCoverUrl(moment),
      qrCaption: "长按识别二维码查看瞬间",
      qrFooter: "微信扫码 · 穷游动态与 AI 行程"
    },
    title,
    authorName,
    location,
    tags: getMomentTags(moment),
    slideImageUrls: resolveMomentSlideUrls(moment)
  };
}
function getTravelMomentXhsPosterInput(params) {
  const { input, title, authorName, location, tags, slideImageUrls } = momentSharePosterInput(params);
  return {
    ...mapShareInputToXhs(input, {
      hashtags: hashtagsFromTags(tags, ["旅行瞬间", "穷游日记", location ?? ""].filter(Boolean)),
      authorLabel: `@${authorName}`,
      locationLabel: location,
      titlePrefix: "📸 "
    }),
    slideImageUrls,
    summarySlide: tags.length > 0 ? {
      title,
      lines: [
        getMomentDescription(params.moment).slice(0, 100),
        tags.slice(0, 5).map((tag) => `#${tag}`).join(" ")
      ]
    } : void 0
  };
}
function getTravelMomentXhsCopyText(params) {
  return xhsInputToCopyText(getTravelMomentXhsPosterInput(params));
}
async function buildTravelMomentPosterBlob(params) {
  return renderSharePoster(momentSharePosterInput(params).input);
}
async function buildTravelMomentXhsPosterBlob(params) {
  const slides = await buildTravelMomentXhsPosterSlides(params);
  return slides[0];
}
async function buildTravelMomentXhsPosterSlides(params) {
  return renderXhsPosterSlides(getTravelMomentXhsPosterInput(params));
}
const FEEDBACK_LABEL$1 = {
  shared: "已分享",
  copied: "已复制",
  failed: "失败"
};
function TravelMomentShareControls({
  moment,
  authorId,
  authorName,
  isOwnProfile,
  className,
  variant = "primary"
}) {
  const [feedback, setFeedback] = reactExports.useState("idle");
  const [posterOpen, setPosterOpen] = reactExports.useState(false);
  const chinaShare = isChinaPrimaryMarket();
  const isIcon = variant === "icon";
  const isPrimary = variant === "primary";
  reactExports.useEffect(() => {
    if (feedback === "idle" || feedback === "cancelled") {
      return void 0;
    }
    const timer = window.setTimeout(() => setFeedback("idle"), 2e3);
    return () => {
      window.clearTimeout(timer);
    };
  }, [feedback]);
  const shareParams = { moment, authorId, authorName, isOwnProfile };
  async function handleQuickShare(event) {
    event.stopPropagation();
    const result = await shareTravelMoment(shareParams);
    if (result !== "cancelled") {
      setFeedback(result);
    }
  }
  const quickLabel = feedback !== "idle" && feedback !== "cancelled" && !isIcon ? FEEDBACK_LABEL$1[feedback] : "分享";
  const buttonBase = cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold transition",
    isIcon && "rounded-lg p-0 text-slate-800 hover:text-slate-600",
    !isIcon && isPrimary && "rounded-xl px-3.5 py-2 text-sm shadow-sm",
    !isIcon && !isPrimary && "rounded-lg px-2.5 py-1.5 text-xs"
  );
  const iconSize = isIcon ? "h-6 w-6" : isPrimary ? "h-4 w-4" : "h-3.5 w-3.5";
  const safeName = (moment.title || authorName).replace(/[\\/:*?"<>|]/g, "_").slice(0, 40);
  const shareUrl = buildShareUrl(getTravelMomentSharePath(moment, authorId, { isOwnProfile }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-2", className), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: handleQuickShare,
          className: cn(
            buttonBase,
            !isIcon && (isPrimary ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "text-slate-600 hover:bg-slate-100")
          ),
          "aria-label": "分享瞬间",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: iconSize, strokeWidth: isIcon ? 1.5 : 2, "aria-hidden": true }),
            !isIcon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: quickLabel })
          ]
        }
      ),
      chinaShare && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: (event) => {
            event.stopPropagation();
            setPosterOpen(true);
          },
          className: cn(
            buttonBase,
            !isIcon && (isPrimary ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-emerald-700 hover:bg-emerald-50")
          ),
          "aria-label": "生成微信分享海报",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: iconSize, strokeWidth: isIcon ? 1.5 : 2, "aria-hidden": true }),
            !isIcon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isPrimary ? "分享图" : "海报" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SharePosterDialog,
      {
        open: posterOpen,
        onClose: () => setPosterOpen(false),
        title: "图文分享 · 瞬间",
        description: "生成微信海报或小红书风格笔记图",
        shareUrl,
        downloadFilename: `${safeName || "瞬间"}-分享海报.png`,
        posterAlt: `${authorName} 旅行瞬间分享图`,
        posterVariants: createChinaPosterVariants({
          baseFilename: safeName || "瞬间",
          buildWechat: () => buildTravelMomentPosterBlob(shareParams),
          buildXhs: () => buildTravelMomentXhsPosterBlob(shareParams),
          buildXhsSlides: () => buildTravelMomentXhsPosterSlides(shareParams),
          getXhsCopyText: () => getTravelMomentXhsCopyText(shareParams)
        }),
        shareTrackContext: { contentKind: "travel_moment", contentId: moment.id },
        onSystemShare: () => shareTravelMoment(shareParams)
      }
    )
  ] });
}
function useMomentLikeCount(moment, interactive) {
  const { data: likedIds = [] } = useMomentLikes(interactive);
  const toggleLikeMutation = useToggleMomentLike();
  const isLiked = likedIds.includes(moment.id);
  return {
    displayLikes: moment.likeCount + (isLiked ? 1 : 0),
    isLiked,
    toggleLike: () => {
      if (!interactive) {
        return;
      }
      toggleLikeMutation.mutate(moment.id);
    },
    isTogglingLike: toggleLikeMutation.isPending
  };
}
function TravelMomentCardActions({
  moment,
  interactive = false,
  canDelete = false,
  onDelete,
  onCommentClick,
  shareEnabled = false,
  shareAuthorId,
  shareAuthorName,
  shareIsOwnProfile,
  className
}) {
  const { displayLikes, isLiked, toggleLike, isTogglingLike } = useMomentLikeCount(
    moment,
    interactive
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center justify-between gap-2 px-3 py-2.5", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          disabled: !interactive || isTogglingLike,
          onClick: toggleLike,
          className: cn(
            "inline-flex items-center gap-1.5 text-sm font-semibold transition",
            isLiked ? "text-rose-600" : "text-slate-800 hover:text-slate-600",
            (!interactive || isTogglingLike) && "opacity-60"
          ),
          "aria-pressed": isLiked,
          "aria-label": isLiked ? SNAIL_GLOBAL_COPY.unlike : SNAIL_GLOBAL_COPY.like,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Heart,
              {
                className: cn("h-6 w-6", isLiked && "fill-current"),
                strokeWidth: isLiked ? 0 : 1.5,
                "aria-hidden": true
              }
            ),
            displayLikes > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums", children: displayLikes })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onCommentClick,
          className: "inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 transition hover:text-slate-600",
          "aria-label": "评论",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-6 w-6", strokeWidth: 1.5, "aria-hidden": true })
        }
      ),
      shareEnabled && shareAuthorId && shareAuthorName && /* @__PURE__ */ jsxRuntimeExports.jsx(
        TravelMomentShareControls,
        {
          moment,
          authorId: shareAuthorId,
          authorName: shareAuthorName,
          isOwnProfile: shareIsOwnProfile,
          variant: "icon"
        }
      )
    ] }),
    canDelete && onDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: onDelete,
        className: "rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600",
        "aria-label": "删除瞬间",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-5 w-5", "aria-hidden": true })
      }
    )
  ] });
}
function MediaPlaceholder({ label }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex aspect-square w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-violet-50 to-cyan-50 px-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-10 w-10 text-violet-400/90", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-medium leading-snug text-slate-700", children: label })
  ] });
}
function TravelMomentCardMedia({ moment, className }) {
  var _a;
  const images = moment.imageUrls ?? [];
  const hasVideo = Boolean(moment.videoUrl);
  const [index, setIndex] = reactExports.useState(0);
  const slideCount = hasVideo ? 1 : images.length;
  const canSlide = slideCount > 1;
  const goPrev = reactExports.useCallback(() => {
    setIndex((current) => (current - 1 + slideCount) % slideCount);
  }, [slideCount]);
  const goNext = reactExports.useCallback(() => {
    setIndex((current) => (current + 1) % slideCount);
  }, [slideCount]);
  if (!hasVideo && images.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("bg-black", className), children: /* @__PURE__ */ jsxRuntimeExports.jsx(MediaPlaceholder, { label: ((_a = moment.location) == null ? void 0 : _a.trim()) || "暂无图片" }) });
  }
  if (hasVideo && moment.videoUrl) {
    const poster = images[0];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("relative aspect-square w-full bg-black", className), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "video",
        {
          src: moment.videoUrl,
          className: "h-full w-full object-cover",
          controls: true,
          preload: "metadata",
          poster,
          "aria-label": getMomentVideoAlt(moment)
        }
      ),
      !moment.videoUrl.startsWith("data:") && poster && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "ml-1 h-6 w-6 text-slate-900", "aria-hidden": true }) }) })
    ] });
  }
  const safeIndex = Math.min(index, images.length - 1);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("group relative aspect-square w-full bg-black", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      OptimizedImage,
      {
        src: images[safeIndex],
        alt: getMomentImageAlt(moment, { index: safeIndex, total: images.length }),
        fill: true,
        sizes: "(max-width: 640px) 100vw, 480px"
      }
    ),
    canSlide && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: goPrev,
          className: "absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/55 focus:opacity-100 group-hover:opacity-100",
          "aria-label": "上一张",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5", "aria-hidden": true })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: goNext,
          className: "absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/55 focus:opacity-100 group-hover:opacity-100",
          "aria-label": "下一张",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5", "aria-hidden": true })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1.5",
          "aria-hidden": true,
          children: images.map((url, dotIndex) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "h-1.5 w-1.5 rounded-full transition",
                dotIndex === safeIndex ? "bg-white" : "bg-white/45"
              )
            },
            url
          ))
        }
      )
    ] })
  ] });
}
const DOUBLE_TAP_MS = 320;
const BURST_DURATION_MS = 900;
function getTapPoint(event, element) {
  const rect = element.getBoundingClientRect();
  if ("touches" in event && event.changedTouches.length > 0) {
    const touch = event.changedTouches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }
  const mouseEvent = event;
  return { x: mouseEvent.clientX - rect.left, y: mouseEvent.clientY - rect.top };
}
function TravelMomentDoubleTapLike({
  enabled = false,
  isLiked = false,
  onLike,
  children,
  className
}) {
  const reduceMotion = useReducedMotion();
  const containerRef = reactExports.useRef(null);
  const lastTapRef = reactExports.useRef(null);
  const touchHandledRef = reactExports.useRef(false);
  const [bursts, setBursts] = reactExports.useState([]);
  const spawnHeart = reactExports.useCallback(
    (x, y) => {
      if (reduceMotion) {
        return;
      }
      const id = Date.now() + Math.random();
      setBursts((prev) => [...prev, { id, x, y }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((burst) => burst.id !== id));
      }, BURST_DURATION_MS);
    },
    [reduceMotion]
  );
  const handleDoubleTapAt = reactExports.useCallback(
    (x, y) => {
      spawnHeart(x, y);
      if (!isLiked) {
        onLike == null ? void 0 : onLike();
      }
    },
    [isLiked, onLike, spawnHeart]
  );
  const registerTap = reactExports.useCallback(
    (event) => {
      if (!enabled || !containerRef.current) {
        return;
      }
      const { x, y } = getTapPoint(event, containerRef.current);
      const now = Date.now();
      if (lastTapRef.current && now - lastTapRef.current.time < DOUBLE_TAP_MS) {
        event.preventDefault();
        lastTapRef.current = null;
        handleDoubleTapAt(x, y);
        return;
      }
      lastTapRef.current = { time: now };
    },
    [enabled, handleDoubleTapAt]
  );
  const handleDoubleClick = reactExports.useCallback(
    (event) => {
      if (!enabled || !containerRef.current) {
        return;
      }
      const { x, y } = getTapPoint(event, containerRef.current);
      handleDoubleTapAt(x, y);
    },
    [enabled, handleDoubleTapAt]
  );
  const handleTouchEnd = reactExports.useCallback(
    (event) => {
      touchHandledRef.current = true;
      registerTap(event);
      window.setTimeout(() => {
        touchHandledRef.current = false;
      }, 400);
    },
    [registerTap]
  );
  const handleClick = reactExports.useCallback(
    (event) => {
      if (touchHandledRef.current) {
        return;
      }
      registerTap(event);
    },
    [registerTap]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: containerRef,
      className: cn("relative select-none", enabled && "cursor-pointer", className),
      onClick: handleClick,
      onTouchEnd: handleTouchEnd,
      onDoubleClick: handleDoubleClick,
      role: enabled ? "button" : void 0,
      "aria-label": enabled ? SNAIL_GLOBAL_COPY.doubleTapLike : void 0,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: bursts.map((burst) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.span,
          {
            className: "pointer-events-none absolute z-20",
            style: { left: burst.x, top: burst.y },
            initial: { scale: 0, opacity: 0, x: "-50%", y: "-50%" },
            animate: {
              scale: [0, 1.15, 1],
              opacity: [0, 1, 0]
            },
            exit: { scale: 1.35, opacity: 0 },
            transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
            "aria-hidden": true,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Heart,
              {
                className: "h-20 w-20 fill-white text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]",
                strokeWidth: 0
              }
            )
          },
          burst.id
        )) })
      ]
    }
  );
}
function TravelMomentTagList({ tags, className }) {
  if (tags.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: cn("flex flex-wrap gap-1.5", className), "aria-label": "瞬间标签", children: tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium",
        isPresetTag(tag) ? "bg-violet-100 text-violet-800" : "bg-cyan-100 text-cyan-800"
      ),
      children: [
        "#",
        tag
      ]
    }
  ) }, tag)) });
}
const VISIBILITY_BADGE_STYLES = {
  public: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Icon: Globe
  },
  followers: {
    className: "border-amber-200 bg-amber-50 text-amber-900",
    Icon: Users
  },
  private: {
    className: "border-slate-200 bg-slate-100 text-slate-700",
    Icon: Lock
  }
};
function MomentVisibilityBadge({ visibility }) {
  const { className: badgeClass, Icon } = VISIBILITY_BADGE_STYLES[visibility];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        badgeClass
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3", "aria-hidden": true }),
        getTravelMomentVisibilityLabel(visibility)
      ]
    }
  );
}
function buildLocationLabel(moment) {
  var _a;
  const parts = [];
  if ((_a = moment.location) == null ? void 0 : _a.trim()) {
    parts.push(moment.location.trim());
  }
  if (moment.countryCode) {
    parts.push(getCountryLabel(moment.countryCode));
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}
function buildMapsHref(moment) {
  var _a;
  if (moment.coordinates) {
    return `https://www.google.com/maps?q=${moment.coordinates.latitude},${moment.coordinates.longitude}`;
  }
  if ((_a = moment.location) == null ? void 0 : _a.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(moment.location.trim())}`;
  }
  return null;
}
function CardHeader({
  author,
  locationLabel,
  showVisibilityBadge,
  visibility
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center gap-3 border-b border-slate-100 px-3 py-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: userProfilePath(author.userId),
        className: "flex min-w-0 flex-1 items-center gap-2.5",
        children: [
          author.avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            AvatarImage,
            {
              src: author.avatar,
              displayName: author.username,
              size: 36,
              className: "h-9 w-9 shrink-0 border border-slate-200/80 bg-slate-100"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700",
              "aria-hidden": true,
              children: author.username.slice(0, 1)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block truncate text-sm font-semibold text-slate-900", children: author.username }),
            locationLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-0.5 flex items-center gap-0.5 truncate text-xs text-slate-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 shrink-0", "aria-hidden": true }),
              locationLabel
            ] })
          ] })
        ]
      }
    ),
    showVisibilityBadge && /* @__PURE__ */ jsxRuntimeExports.jsx(MomentVisibilityBadge, { visibility })
  ] });
}
function TravelMomentCard({
  moment,
  author: authorProp,
  showVisibilityBadge = false,
  interactive = false,
  canDelete = false,
  onDelete,
  shareEnabled: shareEnabledProp,
  className
}) {
  const resolvedAuthor = authorProp ?? (() => {
    const user = findUserById(moment.authorId);
    if (!user) {
      return { userId: moment.authorId, username: "旅人" };
    }
    return { userId: user.id, username: user.username, avatar: user.avatar };
  })();
  const description = getMomentDescription(moment);
  const detail = getMomentDetailText(moment);
  const tags = getMomentTags(moment);
  const locationLabel = buildLocationLabel(moment);
  const mapsHref = buildMapsHref(moment);
  const visibility = moment.visibility ?? "public";
  const { displayLikes, isLiked, toggleLike } = useMomentLikeCount(moment, interactive);
  const handleCommentClick = () => {
  };
  const isAuthorOwnProfile = resolvedAuthor.userId === DEMO_CURRENT_USER_ID;
  const canShareMoment = shareEnabledProp ?? canViewTravelMoment({
    moment,
    authorId: resolvedAuthor.userId,
    // TODO: 使用 auth 上下文中的 viewerId，支持访客仅看公开内容
    viewerId: DEMO_CURRENT_USER_ID,
    isOwnProfile: isAuthorOwnProfile
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "article",
    {
      className: cn(
        "overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CardHeader,
          {
            author: resolvedAuthor,
            locationLabel,
            showVisibilityBadge,
            visibility
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TravelMomentDoubleTapLike,
          {
            enabled: interactive,
            isLiked,
            onLike: toggleLike,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(TravelMomentCardMedia, { moment })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TravelMomentCardActions,
          {
            moment,
            interactive,
            canDelete,
            onDelete,
            onCommentClick: handleCommentClick,
            shareEnabled: canShareMoment,
            shareAuthorId: resolvedAuthor.userId,
            shareAuthorName: resolvedAuthor.username,
            shareIsOwnProfile: isAuthorOwnProfile
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 px-3 pb-3", children: [
          displayLikes > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-slate-900", children: [
            displayLikes,
            " 次赞"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm leading-relaxed text-slate-900", children: [
            moment.title && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 font-semibold text-slate-900", children: moment.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  to: userProfilePath(resolvedAuthor.userId),
                  className: "mr-1.5 font-semibold hover:underline",
                  children: resolvedAuthor.username
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-800", children: description })
            ] }),
            detail && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-slate-600", children: detail })
          ] }),
          tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TravelMomentTagList, { tags, className: "pt-0.5" }),
          locationLabel && mapsHref && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: mapsHref,
              target: "_blank",
              rel: "noreferrer",
              className: "inline-flex items-center gap-1 text-xs font-medium text-violet-700 hover:underline",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 shrink-0", "aria-hidden": true }),
                "在地图中查看"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "time",
            {
              className: "block pt-0.5 text-[10px] uppercase tracking-wide text-slate-400",
              dateTime: moment.createdAt,
              children: formatRelativeZh(moment.createdAt)
            }
          ),
          moment.commentCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleCommentClick,
              className: "text-xs text-slate-500 hover:text-slate-700",
              children: [
                "查看全部 ",
                moment.commentCount,
                " 条评论"
              ]
            }
          )
        ] })
      ]
    }
  );
}
function TravelMomentsFeedFooter({
  sentinelRef,
  isLoading,
  hasMore,
  isReady,
  itemCount,
  error,
  onRetry,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("py-4", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: sentinelRef, className: "h-px w-full", "aria-hidden": true }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-rose-600", children: error }),
      onRetry && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onRetry,
          className: "rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50",
          children: "重试"
        }
      )
    ] }),
    !error && isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center justify-center gap-2 text-sm text-slate-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-violet-600", "aria-hidden": true }),
      "加载中…"
    ] }),
    !error && !isLoading && isReady && !hasMore && itemCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-slate-400", children: "已加载全部瞬间" })
  ] });
}
function resolveContributionTitle(score) {
  const normalized = Math.max(0, Math.floor(score));
  const sorted = [...CONTRIBUTION_TITLE_TIERS].sort((a, b) => b.min - a.min);
  return sorted.find((tier) => normalized >= tier.min) ?? CONTRIBUTION_TITLE_TIERS[0];
}
function formatContributionTitleLabel(tier, options) {
  if ((options == null ? void 0 : options.withScore) && options.score !== void 0) {
    return `${tier.emoji} ${tier.title} · ${options.score}分`;
  }
  return `${tier.emoji} ${tier.title}`;
}
function SnailContributionTitleBadge({
  score,
  showScore = false,
  className
}) {
  const tier = resolveContributionTitle(score);
  const label = formatContributionTitleLabel(tier, { withScore: showScore, score });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "inline-flex max-w-[10rem] items-center justify-center rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold leading-tight text-emerald-800 shadow-sm ring-1 ring-emerald-200/90",
        className
      ),
      title: `贡献分 ${score} · ${tier.title}`,
      children: label
    }
  );
}
const usernameSchema = string().trim().min(2, "用户名至少 2 个字符").max(30, "用户名最多 30 个字符").regex(/^[\w\u4e00-\u9fa5-]+$/, "仅支持字母、数字、中文、下划线与连字符");
const emailSchema = email("请输入有效邮箱").max(254);
const bioSchema = string().trim().max(120, "个性签名最多 120 字");
const userBasicInfoSchema = object({
  id: userIdSchema,
  username: usernameSchema,
  email: emailSchema,
  avatar: httpUrlSchema.optional(),
  bio: bioSchema.optional()
});
const updateUserBasicInfoSchema = object({
  username: usernameSchema,
  email: emailSchema,
  avatar: httpUrlSchema.nullable().optional(),
  bio: bioSchema
}).partial().refine((data) => Object.keys(data).length > 0, {
  message: "至少更新一项基础信息"
});
const authProviderSchema = _enum(["phone", "wechat", "email", "guest", "dev_token"]);
const userAccountStatusSchema = _enum([
  "active",
  "pending_verification",
  "suspended",
  "deleted"
]);
const userRoleSchema = _enum(["guest", "member", "creator", "admin"]);
const userAuthBindingSchema = object({
  provider: authProviderSchema,
  userId: userIdSchema,
  phoneMasked: nonEmptyStringSchema.max(20).optional(),
  externalId: nonEmptyStringSchema.max(256).optional(),
  verified: boolean(),
  lastLoginAt: isoDateTimeSchema.optional()
});
object({
  accessToken: nonEmptyStringSchema.max(4096),
  refreshToken: nonEmptyStringSchema.max(4096).optional(),
  expiresAt: isoDateTimeSchema.optional(),
  userId: userIdSchema,
  provider: authProviderSchema,
  issuedAt: isoDateTimeSchema
});
const phoneLoginPayloadSchema = object({
  phone: string().trim().regex(/^1\d{10}$/, "请输入有效的中国大陆手机号"),
  verificationCode: string().trim().regex(/^\d{4,8}$/, "验证码格式不正确"),
  countryCode: string().trim().regex(/^\+\d{1,4}$/).optional()
});
const wechatLoginPayloadSchema = object({
  code: nonEmptyStringSchema.max(512),
  state: nonEmptyStringSchema.max(256).optional()
});
union([phoneLoginPayloadSchema, wechatLoginPayloadSchema]);
const companionSeekingStatusSchema = _enum(["open", "matched", "closed", "expired"]);
const userCompanionPreferencesSchema = object({
  maxBudgetDeltaPercent: number().min(0).max(100).optional(),
  maxDaysDelta: number().int().min(0).max(30).optional(),
  minSharedInterests: number().int().min(0).max(5).optional(),
  verifiedOnly: boolean().optional()
});
const userCompanionIntentSchema = object({
  id: nonEmptyStringSchema.max(128),
  userId: userIdSchema,
  planId: nonEmptyStringSchema.max(128).optional(),
  planTitle: nonEmptyStringSchema.max(120).optional(),
  destination: nonEmptyStringSchema.max(80),
  days: positiveIntSchema.max(90),
  budgetLabel: nonEmptyStringSchema.max(32),
  startDate: isoDateTimeSchema.optional(),
  message: nonEmptyStringSchema.max(500).optional(),
  status: companionSeekingStatusSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});
userCompanionIntentSchema.omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true
});
const profileVisibilitySchema = _enum(["public", "followers", "private"]);
const travelMomentVisibilitySchema = _enum(["public", "followers", "private"]);
const privacySettingsSchema = object({
  profileVisibility: profileVisibilitySchema,
  showVisitedCountries: boolean(),
  showEmail: boolean(),
  allowCompanionRequests: boolean(),
  defaultMomentVisibility: travelMomentVisibilitySchema
});
const notificationPreferencesSchema = object({
  companionMatch: boolean(),
  planReminder: boolean(),
  newFollower: boolean(),
  momentEngagement: boolean(),
  marketing: boolean(),
  emailDigest: boolean(),
  pushEnabled: boolean()
});
object({
  privacySettings: privacySettingsSchema,
  notificationPreferences: notificationPreferencesSchema
});
privacySettingsSchema.partial();
notificationPreferencesSchema.partial();
const travelMomentSchema = object({
  id: nonEmptyStringSchema.max(128),
  authorId: userIdSchema,
  description: nonEmptyStringSchema.max(500),
  content: nonEmptyStringSchema.max(2e3),
  title: nonEmptyStringSchema.max(120).optional(),
  tags: array(nonEmptyStringSchema.max(16)).max(8),
  imageUrls: array(httpUrlSchema).max(9).optional(),
  videoUrl: httpUrlSchema.optional(),
  location: nonEmptyStringSchema.max(120).optional(),
  coordinates: object({
    longitude: number().min(-180).max(180),
    latitude: number().min(-90).max(90)
  }).optional(),
  countryCode: countryCodeSchema.optional(),
  planId: nonEmptyStringSchema.max(128).optional(),
  visibility: travelMomentVisibilitySchema,
  likeCount: nonNegativeIntSchema,
  commentCount: nonNegativeIntSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});
travelMomentSchema.omit({
  id: true,
  authorId: true,
  likeCount: true,
  commentCount: true,
  createdAt: true,
  updatedAt: true
}).extend({
  visibility: travelMomentVisibilitySchema.optional(),
  tags: array(nonEmptyStringSchema.max(16)).max(8).optional()
});
const userSocialInfoSchema = object({
  followersCount: nonNegativeIntSchema,
  followingCount: nonNegativeIntSchema,
  travelMoments: array(travelMomentSchema).max(500)
});
const userStatsSchema = object({
  publishedPlanCount: number().int().min(0),
  receivedLikeCount: number().int().min(0),
  favoriteCount: number().int().min(0),
  companionPostCount: number().int().min(0)
});
const userBadgeSchema = object({
  id: string().min(1),
  label: string().min(1),
  kind: _enum(["verified", "creator", "companion", "explorer", "custom"]),
  description: string().optional(),
  earnedAt: string().datetime().optional()
});
const travelPersonalityKindSchema = _enum(TravelPersonalityKind);
const travelPersonalitySchema = object({
  kind: travelPersonalityKindSchema,
  title: nonEmptyStringSchema.max(32),
  summary: nonEmptyStringSchema.max(200),
  traits: array(nonEmptyStringSchema.max(24)).min(1).max(12)
});
const travelInterestSchema = _enum([
  "food",
  "culture",
  "adventure",
  "shopping",
  "nature"
]);
const userTravelInfoSchema = object({
  travelPersonality: travelPersonalitySchema,
  visitedCountries: array(countryCodeSchema).max(200),
  interests: array(travelInterestSchema).min(1).max(5)
});
userTravelInfoSchema.partial();
const userSchema = userBasicInfoSchema.merge(userTravelInfoSchema).merge(userSocialInfoSchema).extend({
  stats: userStatsSchema,
  badges: array(userBadgeSchema),
  privacySettings: privacySettingsSchema,
  notificationPreferences: notificationPreferencesSchema,
  role: userRoleSchema.optional(),
  accountStatus: userAccountStatusSchema.optional(),
  auth: userAuthBindingSchema.optional(),
  companionPreferences: userCompanionPreferencesSchema.optional(),
  contributionScore: number().int().min(0).optional(),
  createdAt: isoDateTimeSchema.optional(),
  updatedAt: isoDateTimeSchema.optional()
});
object({
  sessionId: guestSessionIdSchema,
  role: literal("guest"),
  username: userBasicInfoSchema.shape.username,
  avatar: userBasicInfoSchema.shape.avatar,
  travelPersonality: userTravelInfoSchema.shape.travelPersonality,
  visitedCountries: userTravelInfoSchema.shape.visitedCountries,
  interests: userTravelInfoSchema.shape.interests,
  privacySettings: privacySettingsSchema,
  notificationPreferences: notificationPreferencesSchema,
  createdAt: isoDateTimeSchema
});
userSchema.extend({
  role: _enum(["member", "creator", "admin"]),
  email: userBasicInfoSchema.shape.email,
  auth: userAuthBindingSchema
}).refine((data) => data.auth.userId === data.id, {
  message: "auth.userId 须与 user.id 一致",
  path: ["auth", "userId"]
});
function formatZodError(error) {
  return error.issues.reduce((acc, issue) => {
    const path = issue.path.join(".") || "_root";
    return acc[path] ? acc : { ...acc, [path]: issue.message };
  }, {});
}
function UserProfileEditDialog({
  open,
  user,
  onClose,
  onSave
}) {
  const [username, setUsername] = reactExports.useState(user.username);
  const [bio, setBio] = reactExports.useState(user.bio ?? "");
  const [avatar, setAvatar] = reactExports.useState(user.avatar ?? "");
  const [fieldErrors, setFieldErrors] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (!open) {
      return;
    }
    setUsername(user.username);
    setBio(user.bio ?? "");
    setAvatar(user.avatar ?? "");
    setFieldErrors({});
  }, [open, user.username, user.bio, user.avatar]);
  const handleSave = reactExports.useCallback(() => {
    const parsed = updateUserBasicInfoSchema.safeParse({
      username,
      bio,
      avatar: avatar.trim() || void 0
    });
    if (!parsed.success) {
      setFieldErrors(formatZodError(parsed.error));
      return;
    }
    onSave({
      username: parsed.data.username ?? username,
      bio: parsed.data.bio ?? bio,
      avatar: parsed.data.avatar ?? void 0
    });
    onClose();
  }, [avatar, bio, onClose, onSave, username]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onClose,
      title: "编辑资料",
      description: "更新头像、昵称与个性签名，保存后立即生效。",
      confirmLabel: "保存",
      cancelLabel: "取消",
      onConfirm: handleSave,
      className: "max-w-md",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "profile-edit-username", className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-slate-700", children: "昵称" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "profile-edit-username",
              type: "text",
              value: username,
              onChange: (event) => setUsername(event.target.value),
              className: cn(
                "mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500",
                fieldErrors.username && "border-red-400"
              ),
              autoComplete: "username"
            }
          ),
          fieldErrors.username && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-red-600", children: fieldErrors.username })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "profile-edit-bio", className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-slate-700", children: "个性签名" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "profile-edit-bio",
              value: bio,
              onChange: (event) => setBio(event.target.value),
              rows: 3,
              maxLength: 120,
              placeholder: "写一句介绍自己的话…",
              className: cn(
                "mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500",
                fieldErrors.bio && "border-red-400"
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-right text-xs text-slate-400", children: [
            bio.length,
            "/120"
          ] }),
          fieldErrors.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: fieldErrors.bio })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "profile-edit-avatar", className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-slate-700", children: "头像链接（可选）" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "profile-edit-avatar",
              type: "url",
              value: avatar,
              onChange: (event) => setAvatar(event.target.value),
              placeholder: "https://",
              className: cn(
                "mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500",
                fieldErrors.avatar && "border-red-400"
              )
            }
          ),
          fieldErrors.avatar && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-red-600", children: fieldErrors.avatar })
        ] })
      ] })
    }
  );
}
function getUserProfileSharePath(user, isOwnProfile) {
  return profilePathForUser(user.id, isOwnProfile);
}
function getUserProfileShareSummary(user, isOwnProfile) {
  const bio = getProfileBio(user, isOwnProfile).replace(/\s+/g, " ").trim();
  const stats = `${formatProfileStatCount(user.followersCount)} 粉丝 · ${formatProfileStatCount(user.followingCount)} 关注 · ${formatProfileStatCount(user.travelMoments.length)} 动态`;
  const snippet = bio.length > 60 ? `${bio.slice(0, 60)}…` : bio;
  return `${user.username} · ${stats}${snippet ? ` · ${snippet}` : ""}`;
}
async function shareUserProfile(user, isOwnProfile) {
  if (typeof window === "undefined") {
    return "failed";
  }
  const tracking = { contentKind: "user_profile", contentId: user.id };
  const url = buildShareUrl(getUserProfileSharePath(user, isOwnProfile), tracking);
  const text = getUserProfileShareSummary(user, isOwnProfile);
  try {
    if (navigator.share) {
      await navigator.share({ title: `${user.username} · Hello Roamly`, text, url });
      trackShareOutcome(tracking, "shared", { channel: "native", shareUrl: url });
      return "shared";
    }
    await navigator.clipboard.writeText(`${text}
${url}`);
    trackShareOutcome(tracking, "copied", { channel: "link", shareUrl: url });
    return "copied";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }
    try {
      await navigator.clipboard.writeText(`${text}
${url}`);
      trackShareOutcome(tracking, "copied", { channel: "link", shareUrl: url });
      return "copied";
    } catch {
      return "failed";
    }
  }
}
function getProfilePosterCoverUrl(user) {
  if (user.avatar) {
    return resolveRemoteImageUrl(user.avatar, { width: 720 });
  }
  const firstMoment = user.travelMoments[0];
  if (firstMoment) {
    const cover = getMomentCoverUrl(firstMoment);
    if (cover) {
      return resolveRemoteImageUrl(cover, { width: 720 });
    }
  }
  return `https://picsum.photos/seed/profile-${user.id}/720/960`;
}
function getProfileSlideImageUrls(user) {
  const slides = [];
  const avatar = user.avatar ? resolveRemoteImageUrl(user.avatar, { width: 720 }) : void 0;
  if (avatar) {
    slides.push(avatar);
  }
  for (const moment of user.travelMoments) {
    const cover = getMomentCoverUrl(moment);
    if (cover) {
      slides.push(resolveRemoteImageUrl(cover, { width: 720 }));
    }
    if (slides.length >= 8) {
      break;
    }
  }
  return [...new Set(slides)].slice(0, 8);
}
function profileSharePosterInput(user, isOwnProfile) {
  return {
    badge: "旅行主页",
    title: user.username,
    subtitle: `${formatProfileStatCount(user.followersCount)} 粉丝 · ${formatProfileStatCount(user.followingCount)} 关注 · ${formatProfileStatCount(user.travelMoments.length)} 动态`,
    summary: getUserProfileShareSummary(user, isOwnProfile),
    shareUrl: buildShareUrl(getUserProfileSharePath(user, isOwnProfile), {
      contentKind: "user_profile",
      contentId: user.id
    }),
    coverImageUrl: getProfilePosterCoverUrl(user),
    qrCaption: "长按识别二维码查看主页",
    qrFooter: "微信扫码 · 穷游动态与 AI 行程"
  };
}
function getUserProfileXhsPosterInput(user, isOwnProfile) {
  var _a;
  const input = profileSharePosterInput(user, isOwnProfile);
  const interestLabels = user.interests.slice(0, 3).map((item) => getInterestLabel(item));
  return {
    ...mapShareInputToXhs(input, {
      hashtags: hashtagsFromTags(interestLabels, ["旅行博主", "穷游", "个人主页"]),
      authorLabel: `@${user.username}`,
      titlePrefix: "✨ "
    }),
    slideImageUrls: getProfileSlideImageUrls(user),
    summarySlide: {
      title: `${user.username}的旅行主页`,
      lines: [
        `👥 ${formatProfileStatCount(user.followersCount)} 粉丝 · ${formatProfileStatCount(user.travelMoments.length)} 条动态`,
        ((_a = user.bio) == null ? void 0 : _a.trim()) || "一起来穷游世界",
        "扫码关注 TA 的最新行程与瞬间 →"
      ]
    }
  };
}
function getUserProfileXhsCopyText(user, isOwnProfile) {
  return xhsInputToCopyText(getUserProfileXhsPosterInput(user, isOwnProfile));
}
async function buildUserProfilePosterBlob(user, isOwnProfile) {
  return renderSharePoster(profileSharePosterInput(user, isOwnProfile));
}
async function buildUserProfileXhsPosterBlob(user, isOwnProfile) {
  const slides = await buildUserProfileXhsPosterSlides(user, isOwnProfile);
  return slides[0];
}
async function buildUserProfileXhsPosterSlides(user, isOwnProfile) {
  return renderXhsPosterSlides(getUserProfileXhsPosterInput(user, isOwnProfile));
}
const FEEDBACK_LABEL = {
  shared: "已分享",
  copied: "已复制",
  failed: "失败"
};
function UserProfileShareControls({
  user,
  isOwnProfile,
  className,
  variant = "primary"
}) {
  const [feedback, setFeedback] = reactExports.useState("idle");
  const [posterOpen, setPosterOpen] = reactExports.useState(false);
  const chinaShare = isChinaPrimaryMarket();
  const isPrimary = variant === "primary";
  reactExports.useEffect(() => {
    if (feedback === "idle" || feedback === "cancelled") {
      return void 0;
    }
    const timer = window.setTimeout(() => setFeedback("idle"), 2e3);
    return () => {
      window.clearTimeout(timer);
    };
  }, [feedback]);
  async function handleQuickShare(event) {
    event.stopPropagation();
    const result = await shareUserProfile(user, isOwnProfile);
    if (result !== "cancelled") {
      setFeedback(result);
    }
  }
  const quickLabel = feedback !== "idle" && feedback !== "cancelled" ? FEEDBACK_LABEL[feedback] : "分享主页";
  const buttonBase = cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold transition",
    isPrimary ? "rounded-xl px-3.5 py-2 text-sm shadow-sm" : "rounded-lg px-2.5 py-1.5 text-xs"
  );
  const safeName = user.username.replace(/[\\/:*?"<>|]/g, "_").slice(0, 40);
  const shareUrl = buildShareUrl(getUserProfileSharePath(user, isOwnProfile));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex flex-wrap items-center gap-2", className), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: handleQuickShare,
          className: cn(
            buttonBase,
            isPrimary ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "text-slate-600 hover:bg-slate-100"
          ),
          "aria-label": "分享用户主页",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: cn(isPrimary ? "h-4 w-4" : "h-3.5 w-3.5"), "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: quickLabel })
          ]
        }
      ),
      chinaShare && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: (event) => {
            event.stopPropagation();
            setPosterOpen(true);
          },
          className: cn(
            buttonBase,
            isPrimary ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-emerald-700 hover:bg-emerald-50"
          ),
          "aria-label": "生成微信分享海报",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: cn(isPrimary ? "h-4 w-4" : "h-3.5 w-3.5"), "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isPrimary ? "分享图" : "海报" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SharePosterDialog,
      {
        open: posterOpen,
        onClose: () => setPosterOpen(false),
        title: "图文分享 · 主页",
        description: "生成微信海报或小红书风格个人名片图",
        shareUrl,
        downloadFilename: `${safeName || "主页"}-分享海报.png`,
        posterAlt: `${user.username} 主页分享图`,
        posterVariants: createChinaPosterVariants({
          baseFilename: safeName || "主页",
          buildWechat: () => buildUserProfilePosterBlob(user, isOwnProfile),
          buildXhs: () => buildUserProfileXhsPosterBlob(user, isOwnProfile),
          buildXhsSlides: () => buildUserProfileXhsPosterSlides(user, isOwnProfile),
          getXhsCopyText: () => getUserProfileXhsCopyText(user, isOwnProfile)
        }),
        shareTrackContext: { contentKind: "user_profile", contentId: user.id },
        onSystemShare: () => shareUserProfile(user, isOwnProfile)
      }
    )
  ] });
}
function useContributionScore(userId, baseScore = 0) {
  const hydrate = useContributionScoreStore((state) => state.hydrate);
  const stored = useContributionScoreStore((state) => userId ? state.scores[userId] : void 0);
  reactExports.useEffect(() => {
    hydrate();
  }, [hydrate]);
  if (!userId) {
    return baseScore;
  }
  return stored ?? baseScore;
}
function StatItem({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold tabular-nums text-slate-900", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: label })
  ] });
}
function UserProfileHeader({
  user,
  isOwnProfile,
  className
}) {
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const updateProfile = useDemoUserProfileStore((state) => state.updateProfile);
  const bio = getProfileBio(user, isOwnProfile);
  const bioIsPlaceholder = isOwnProfile && !hasCustomBio(user);
  const contributionScore = useContributionScore(user.id, user.contributionScore ?? 0);
  const handleEditOpen = reactExports.useCallback(() => {
    setEditOpen(true);
  }, []);
  const handleEditClose = reactExports.useCallback(() => {
    setEditOpen(false);
  }, []);
  const handleSave = reactExports.useCallback(
    (patch) => {
      updateProfile(patch);
    },
    [updateProfile]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "header",
      {
        className: cn(
          "overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-violet-50 via-white to-cyan-50 shadow-sm",
          className
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-6 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
              user.avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                AvatarImage,
                {
                  src: user.avatar,
                  displayName: user.username,
                  size: 96,
                  priority: true,
                  className: "h-24 w-24 rounded-2xl border-2 border-white bg-white shadow-md ring-1 ring-slate-200/80"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-white bg-brand-100 text-3xl font-bold text-brand-700 shadow-md",
                  "aria-hidden": true,
                  children: user.username.slice(0, 1)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SnailContributionTitleBadge,
                {
                  score: contributionScore,
                  className: "absolute -bottom-2 left-1/2 z-10 max-w-[9rem] -translate-x-1/2 whitespace-nowrap"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 text-center sm:text-left", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 sm:items-start", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-tight text-slate-900 sm:text-2xl", children: user.username }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
                    "贡献分 ",
                    contributionScore
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-center gap-2 sm:justify-end", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(UserProfileShareControls, { user, isOwnProfile, variant: "compact" }),
                  isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: handleEditOpen,
                      className: "inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-sm font-semibold text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4", "aria-hidden": true }),
                        "编辑资料"
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: cn(
                    "mt-3 text-sm leading-relaxed",
                    bioIsPlaceholder ? "text-slate-400 italic" : "text-slate-600"
                  ),
                  children: bio
                }
              )
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 divide-x divide-slate-200/80 border-t border-slate-200/80 bg-white/70", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatItem, { label: "粉丝", value: formatProfileStatCount(user.followersCount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatItem, { label: "关注", value: formatProfileStatCount(user.followingCount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatItem, { label: "动态", value: formatProfileStatCount(user.travelMoments.length) })
          ] })
        ]
      }
    ),
    isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsx(
      UserProfileEditDialog,
      {
        open: editOpen,
        user,
        onClose: handleEditClose,
        onSave: handleSave
      }
    )
  ] });
}
const BADGE_ICONS = {
  award: Award,
  globe: Earth,
  utensils: Utensils,
  camera: Camera,
  users: Users,
  sparkles: Sparkles,
  "badge-check": BadgeCheck
};
function MetricCard({ icon: Icon, value, label, accent, hint }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "flex flex-col items-center rounded-xl border border-slate-200/80 bg-gradient-to-br p-4 text-center",
        accent
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 opacity-80", "aria-hidden": true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-bold tabular-nums text-slate-900", children: value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs font-medium text-slate-600", children: label }),
        hint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-slate-400", children: hint })
      ]
    }
  );
}
function UserProfileTravelDataPanel({
  user,
  isOwnProfile,
  className
}) {
  const data = getProfileTravelData(user, isOwnProfile);
  const contributionScore = useContributionScore(user.id, user.contributionScore ?? 0);
  const countryValue = data.visitedCountryCount != null ? formatProfileStatCount(data.visitedCountryCount) : "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn("rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6", className),
      "aria-labelledby": "profile-travel-data-title",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h2",
          {
            id: "profile-travel-data-title",
            className: "font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500",
            children: "旅行数据"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MetricCard,
            {
              icon: Trophy,
              value: formatProfileStatCount(contributionScore),
              label: "贡献分",
              accent: "from-emerald-500/15 to-teal-600/5 text-emerald-800"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MetricCard,
            {
              icon: Earth,
              value: countryValue,
              label: "去过国家",
              accent: "from-emerald-500/15 to-emerald-600/5 text-emerald-800",
              hint: data.countriesHidden ? "蜗友已隐藏" : void 0
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MetricCard,
            {
              icon: MapPinned,
              value: formatProfileStatCount(data.publishedPlanCount),
              label: "发布计划",
              accent: "from-brand-500/15 to-brand-600/5 text-brand-800"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MetricCard,
            {
              icon: Award,
              value: formatProfileStatCount(data.badgeCount),
              label: "获得徽章",
              accent: "from-amber-500/15 to-amber-600/5 text-amber-800"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-col items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 text-center sm:flex-row sm:justify-between sm:text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SnailContributionTitleBadge, { score: contributionScore, showScore: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] leading-relaxed text-slate-600", children: [
            "留轨迹 +",
            CONTRIBUTION_SCORE_RULES.publishGuide,
            " · 被撒盐 +",
            CONTRIBUTION_SCORE_RULES.receiveSalt,
            " · 被收进壳里 +",
            CONTRIBUTION_SCORE_RULES.receiveShellKeep
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-slate-900", children: isOwnProfile ? "我的徽章" : "徽章" }),
          data.badges.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500", children: "还没有蜗壳徽章，多留轨迹点、多探索目的地吧" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2", children: data.badges.map((badge) => {
            const meta = TRAVEL_BADGE_META[badge.id] ?? {
              icon: "award",
              accent: "from-slate-500/10 to-slate-600/5 text-slate-700"
            };
            const Icon = BADGE_ICONS[meta.icon];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "li",
              {
                className: cn(
                  "flex items-start gap-3 rounded-xl border border-slate-200/80 bg-gradient-to-br p-3",
                  meta.accent
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4", "aria-hidden": true }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: badge.label }),
                    badge.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs leading-relaxed text-slate-600", children: badge.description })
                  ] })
                ]
              },
              badge.id
            );
          }) })
        ] })
      ]
    }
  );
}
function UserProfileTravelSection({
  user,
  className
}) {
  const showCountries = user.privacySettings.showVisitedCountries || user.visitedCountries.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn(
        "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6",
        className
      ),
      "aria-labelledby": "profile-travel-title",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h2",
          {
            id: "profile-travel-title",
            className: "font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500",
            children: "旅行信息"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-slate-900", children: "旅行人格" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: user.travelPersonality.summary }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: user.travelPersonality.traits.map((trait) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "rounded-lg bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700",
                children: trait
              },
              trait
            )) })
          ] }),
          showCountries && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-1.5 text-sm font-semibold text-slate-900", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Earth, { className: "h-4 w-4 text-brand-600", "aria-hidden": true }),
              "去过的国家/地区"
            ] }),
            user.visitedCountries.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 flex flex-wrap gap-2", children: user.visitedCountries.map((code) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "li",
              {
                className: "rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700",
                children: [
                  getCountryLabel(code),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-slate-400", children: code })
                ]
              },
              code
            )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "暂未记录" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-1.5 text-sm font-semibold text-slate-900", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4 text-rose-500", "aria-hidden": true }),
              "旅行兴趣"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 flex flex-wrap gap-2", children: user.interests.map((interest) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "li",
              {
                className: "rounded-lg border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800",
                children: getInterestLabel(interest)
              },
              interest
            )) })
          ] })
        ] })
      ]
    }
  );
}
function statusLabel(status) {
  const map = {
    registered: "已注册",
    active: "已活跃",
    rewarded: "已发奖"
  };
  return map[status];
}
function InviteRewardsPanel({ userId, summary, className }) {
  const invalidate = useInvalidateInviteSummary();
  const [claimingId, setClaimingId] = reactExports.useState(null);
  const [feedback, setFeedback] = reactExports.useState(null);
  async function handleClaim(rewardId) {
    setClaimingId(rewardId);
    setFeedback(null);
    const result = await claimInviteReward({ userId, rewardId });
    setClaimingId(null);
    setFeedback(result.message);
    if (result.ok) {
      invalidate(userId);
    }
    window.setTimeout(() => setFeedback(null), 3e3);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-4", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: [
      { label: "已邀请", value: summary.invitedCount },
      { label: "有效好友", value: summary.activeCount },
      { label: "待领奖励", value: summary.pendingRewardCount }
    ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold tabular-nums text-slate-900", children: item.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-slate-500", children: item.label })
        ]
      },
      item.label
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-600", children: [
      "累计获得积分 ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-700", children: summary.totalPointsEarned })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold text-slate-800", children: "奖励进度" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 space-y-2", children: summary.rewards.map((reward) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-900", children: reward.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-500", children: reward.condition })
            ] }),
            reward.status === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                disabled: claimingId === reward.id,
                onClick: () => void handleClaim(reward.id),
                className: "inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50",
                children: [
                  claimingId === reward.id && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin", "aria-hidden": true }),
                  "领取"
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-emerald-700", children: [
              "已领",
              reward.amount ? ` +${reward.amount}` : ""
            ] })
          ]
        },
        reward.id
      )) })
    ] }),
    summary.referrals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold text-slate-800", children: "邀请记录" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 max-h-40 space-y-1.5 overflow-y-auto text-xs", children: summary.referrals.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "flex justify-between gap-2 border-b border-slate-100 pb-1.5 last:border-0",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-800", children: row.inviteeLabel }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-500", children: [
              statusLabel(row.status),
              " · ",
              formatRelativeZh(row.joinedAt)
            ] })
          ]
        },
        row.id
      )) })
    ] }),
    feedback && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-emerald-700", role: "status", children: feedback })
  ] });
}
function UserProfileInviteSection({ userId, className }) {
  const { data: summary, isPending, isError, error, refetch } = useInviteSummary(userId);
  if (!isInviteEnabled()) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn(
        "rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white to-white p-5 shadow-sm",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-5 w-5", "aria-hidden": true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-slate-900", children: "邀请好友得奖励" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: "分享邀请码，好友注册后双方可获积分与徽章" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
          isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(InviteCodeCardSkeleton, {}),
          isError && /* @__PURE__ */ jsxRuntimeExports.jsx(
            UserFacingErrorAlert,
            {
              error,
              context: "invite",
              onRetry: () => {
                void refetch();
              }
            }
          ),
          summary && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InviteCodeCard, { summary }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InviteRewardsPanel, { className: "mt-4", userId, summary })
          ] })
        ] })
      ]
    }
  );
}
function CompanionRow({ companion }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: userProfilePath(companion.userId),
      className: "flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 p-3 transition hover:border-brand-200 hover:bg-brand-50/30",
      children: [
        companion.avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          AvatarImage,
          {
            src: companion.avatar,
            displayName: companion.username,
            size: 44,
            className: "h-11 w-11 shrink-0 ring-2 ring-white"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700",
            "aria-hidden": true,
            children: companion.username.slice(0, 1)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-semibold text-slate-900", children: companion.username }),
          companion.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-1 text-xs text-slate-600", children: companion.bio })
        ] })
      ]
    }
  );
}
function UserProfileCompanionsPanel({
  following,
  followers,
  isOwnProfile,
  className
}) {
  const [subTab, setSubTab] = reactExports.useState("following");
  const list = subTab === "following" ? following : followers;
  let emptyMessage = "暂无数据";
  if (subTab === "following") {
    emptyMessage = isOwnProfile ? "还没有关注旅伴" : "暂无关注";
  } else {
    emptyMessage = isOwnProfile ? "还没有粉丝" : "暂无粉丝";
  }
  const handleFollowing = reactExports.useCallback(() => {
    setSubTab("following");
  }, []);
  const handleFollowers = reactExports.useCallback(() => {
    setSubTab("followers");
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-3", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "inline-flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5",
        role: "tablist",
        "aria-label": "关注与粉丝",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-selected": subTab === "following",
              onClick: handleFollowing,
              className: cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                subTab === "following" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              ),
              children: [
                "关注 ",
                following.length
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-selected": subTab === "followers",
              onClick: handleFollowers,
              className: cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                subTab === "followers" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              ),
              children: [
                "粉丝 ",
                followers.length
              ]
            }
          )
        ]
      }
    ),
    list.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500", children: emptyMessage }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: list.map((companion) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CompanionRow, { companion }) }, companion.userId)) })
  ] });
}
function UserProfilePlanListItem({ plan, className }) {
  const [imageFailed, setImageFailed] = reactExports.useState(false);
  const coverUrl = getPlanCoverUrl(plan);
  const showCover = Boolean(coverUrl) && !imageFailed;
  const destination = getPlanDestination(plan);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: travelPlanDetailPath(plan.id),
      className: cn(
        "flex gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 p-3 transition",
        "hover:border-brand-200 hover:bg-brand-50/30",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-brand-100 to-violet-100", children: showCover ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          OptimizedImage,
          {
            src: coverUrl,
            alt: getPlanCoverAlt(plan),
            fill: true,
            sizes: "80px",
            widths: [80, 160],
            onError: () => setImageFailed(true)
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-full items-center justify-center text-[10px] font-semibold text-brand-700", children: destination.slice(0, 2) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-sm font-semibold leading-snug text-slate-900", children: plan.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-600", children: [
            destination,
            " · ",
            getPlanDaysLabel(plan),
            " · ",
            getPlanBudgetLabel(plan)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-1.5 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-3 w-3", "aria-hidden": true }),
            "AI 生成"
          ] })
        ] })
      ]
    }
  );
}
const UserProfilePlanListItem$1 = reactExports.memo(UserProfilePlanListItem, areEqualByPlanRef);
function UserProfileFavoritesPanel({
  favorites,
  isOwnProfile,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-3", className), children: [
    favorites.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500", children: SNAIL_GLOBAL_COPY.emptyState }),
    favorites.length > 0 && isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "h-3.5 w-3.5 text-amber-500", "aria-hidden": true }),
      "含本地壳里珍藏与演示数据；在计划详情页可继续",
      SNAIL_GLOBAL_COPY.favorite,
      "        "
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: favorites.map((plan) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserProfilePlanListItem$1, { plan }) }, plan.id)) })
  ] });
}
function TravelMomentTagFilter({
  tags,
  activeTag,
  onChange,
  className
}) {
  if (tags.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex flex-wrap gap-2", className), role: "group", "aria-label": "按标签筛选", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange(null),
        className: cn(
          "rounded-full border px-3 py-1 text-xs font-medium transition",
          activeTag === null ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
        ),
        "aria-pressed": activeTag === null,
        children: "全部"
      }
    ),
    tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange(activeTag === tag ? null : tag),
        className: cn(
          "rounded-full border px-3 py-1 text-xs font-medium transition",
          activeTag === tag ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
        ),
        "aria-pressed": activeTag === tag,
        children: tag
      },
      tag
    ))
  ] });
}
function UserProfileMomentsPanel({
  moments,
  isOwnProfile,
  authorId,
  defaultMomentVisibility,
  className
}) {
  const hydrateMoments = useTravelMomentsStore((state) => state.hydrate);
  const removeMoment = useTravelMomentsStore((state) => state.removeMoment);
  const hasMoment = useTravelMomentsStore((state) => state.hasMoment);
  const [activeTag, setActiveTag] = reactExports.useState(null);
  const cardAuthor = reactExports.useMemo(() => {
    const user = findUserById(authorId);
    if (!user) {
      return void 0;
    }
    return { userId: user.id, username: user.username, avatar: user.avatar };
  }, [authorId]);
  const {
    items: feedMoments,
    isLoading,
    isReady,
    hasMore,
    error,
    retry,
    sentinelRef
  } = useInfiniteTravelMoments({
    moments,
    authorId,
    activeTag,
    enabled: moments.length > 0
  });
  reactExports.useEffect(() => {
    hydrateMoments();
  }, [hydrateMoments]);
  reactExports.useEffect(() => {
    const momentId = parseTravelMomentIdFromHash(window.location.hash);
    if (!momentId || feedMoments.length === 0) {
      return void 0;
    }
    const timer = window.setTimeout(() => {
      var _a;
      (_a = document.getElementById(travelMomentDomId(momentId))) == null ? void 0 : _a.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 120);
    return () => {
      window.clearTimeout(timer);
    };
  }, [feedMoments]);
  const tagOptions = reactExports.useMemo(() => collectMomentTags(moments), [moments]);
  const handleDelete = reactExports.useCallback(
    (momentId) => {
      if (!window.confirm("确定删除这条旅行瞬间？删除后无法恢复。")) {
        return;
      }
      removeMoment(authorId, momentId);
    },
    [authorId, removeMoment]
  );
  const showEmptyTag = isReady && feedMoments.length === 0 && moments.length > 0;
  const showInitialLoading = moments.length > 0 && !isReady && isLoading;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-4", className), children: [
    isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsx(TravelMoment, { authorId, defaultVisibility: defaultMomentVisibility }),
    tagOptions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TravelMomentTagFilter, { tags: tagOptions, activeTag, onChange: setActiveTag }),
    showEmptyTag && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500", children: [
      "没有带「",
      activeTag,
      "」标签的瞬间"
    ] }),
    moments.length === 0 && !isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500", children: SNAIL_GLOBAL_COPY.emptyState }),
    moments.length === 0 && isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500", children: SNAIL_GLOBAL_COPY.emptyState }),
    showInitialLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center justify-center gap-2 py-12 text-sm text-slate-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-violet-600", "aria-hidden": true }),
      "加载旅行瞬间…"
    ] }),
    feedMoments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mx-auto max-w-lg space-y-6", children: feedMoments.map((moment) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { id: travelMomentDomId(moment.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      TravelMomentCard,
      {
        moment,
        author: cardAuthor,
        showVisibilityBadge: isOwnProfile,
        interactive: true,
        canDelete: isOwnProfile && hasMoment(authorId, moment.id),
        onDelete: () => handleDelete(moment.id)
      }
    ) }, moment.id)) }),
    moments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      TravelMomentsFeedFooter,
      {
        sentinelRef,
        isLoading,
        hasMore,
        isReady,
        itemCount: feedMoments.length,
        error,
        onRetry: retry,
        className: "mx-auto max-w-lg"
      }
    )
  ] });
}
function UserProfileSavedPlansSection({
  className,
  previewLimit = 3
}) {
  const { data, isLoading, error } = useUserPlans();
  const items = (data == null ? void 0 : data.items) ?? [];
  const preview = items.slice(0, previewLimit);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: cn("space-y-3", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-slate-900", children: "我的方案" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: "地图 AI 生成并保存的完整对话方案" })
      ] }),
      items.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: profileSavedPlansPath(),
          className: "inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700",
          children: [
            "全部",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5", "aria-hidden": true })
          ]
        }
      ) : null
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin", "aria-hidden": true }),
      "加载方案中…"
    ] }) : null,
    error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-700", children: "方案加载失败，请稍后再试" }) : null,
    !isLoading && !error && items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500", children: "还没有保存的方案。在地图生成穷游方案后，点击「保存方案」即可收录。" }) : null,
    preview.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: preview.map((plan) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SavedUserPlanListItem, { plan }) }, plan.id)) }) : null
  ] });
}
function UserProfilePublicSavedPlansSection({
  userId,
  showEmptyState = false,
  className
}) {
  const { data, isLoading, error } = useUserPublicPlans(userId);
  const items = (data == null ? void 0 : data.items) ?? [];
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500",
          className
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin", "aria-hidden": true }),
          "加载公开方案…"
        ]
      }
    );
  }
  if (error) {
    return showEmptyState ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: cn(
          "rounded-xl border border-rose-100 bg-rose-50 px-4 py-8 text-center text-sm text-rose-700",
          className
        ),
        children: "公开方案加载失败"
      }
    ) : null;
  }
  if (items.length === 0) {
    if (!showEmptyState) {
      return null;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center",
          className
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mx-auto h-8 w-8 text-slate-300", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-medium text-slate-700", children: "暂无公开穷游方案" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "TA 还没有公开分享的地图 AI 方案" })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: cn("space-y-3", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-slate-900", children: "公开穷游方案" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: "TA 在地图 AI 生成并公开分享的方案" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: items.map((plan) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SavedUserPlanListItem, { plan }) }, plan.id)) })
  ] });
}
function UserProfilePlansPanel({
  plans,
  isOwnProfile,
  userId,
  className
}) {
  const { data: savedPlansData, isLoading: savedPlansLoading } = useUserPlans();
  const hasSavedPlans = ((savedPlansData == null ? void 0 : savedPlansData.items.length) ?? 0) > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-3", className), children: [
    isOwnProfile ? /* @__PURE__ */ jsxRuntimeExports.jsx(UserProfileSavedPlansSection, {}) : null,
    !isOwnProfile ? /* @__PURE__ */ jsxRuntimeExports.jsx(UserProfilePublicSavedPlansSection, { userId, showEmptyState: plans.length === 0 }) : null,
    isOwnProfile && plans.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "以下为 AI 生成的穷游计划，含你本地新生成的方案" }),
    plans.length === 0 && isOwnProfile && !savedPlansLoading && !hasSavedPlans && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500", children: SNAIL_GLOBAL_COPY.emptyState }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: plans.map((plan) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserProfilePlanListItem$1, { plan }) }, plan.id)) }),
    isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: paths.home,
        className: "inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5", "aria-hidden": true }),
          "去首页生成新计划"
        ]
      }
    )
  ] });
}
const UserProfilePlansPanel$1 = reactExports.memo(
  UserProfilePlansPanel,
  (prev, next) => prev.plans === next.plans && prev.isOwnProfile === next.isOwnProfile && prev.userId === next.userId && prev.className === next.className
);
const TAB_ORDER = ["plans", "moments", "favorites", "companions"];
function getTabLabel(tab, isOwnProfile) {
  if (isOwnProfile) {
    const labels = {
      plans: "旅行计划",
      moments: "旅行瞬间",
      favorites: SNAIL_GLOBAL_COPY.favoritesTab,
      companions: "旅伴"
    };
    return labels[tab];
  }
  const publicLabels = {
    plans: "旅行计划",
    moments: "旅行瞬间",
    favorites: SNAIL_GLOBAL_COPY.favoritesTab,
    companions: "旅伴"
  };
  return publicLabels[tab];
}
const TAB_ICONS = {
  plans: MapPinned,
  moments: Sparkles,
  favorites: Bookmark,
  companions: Users
};
function UserProfileContentTabs({
  user,
  isOwnProfile,
  className
}) {
  const [activeTab, setActiveTab] = reactExports.useState("plans");
  const tabsId = reactExports.useId();
  const content = useUserProfileContent(user, isOwnProfile);
  const handleTab = reactExports.useCallback((tab) => {
    setActiveTab(tab);
  }, []);
  reactExports.useEffect(() => {
    if (isTravelMomentShareHash(window.location.hash)) {
      setActiveTab("moments");
    }
  }, []);
  if (!content) {
    return null;
  }
  const counts = {
    plans: content.plans.length,
    moments: content.moments.length,
    favorites: content.favorites.length,
    companions: content.following.length + content.followers.length
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn("rounded-2xl border border-slate-200/90 bg-white shadow-sm", className),
      "aria-labelledby": `${tabsId}-title`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-slate-100 px-4 py-4 sm:px-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: `${tabsId}-title`, className: "text-sm font-semibold text-slate-900", children: isOwnProfile ? SNAIL_GLOBAL_COPY.myDen : `${user.username} 的蜗居` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-xs text-slate-500", children: [
            "AI 计划、图文瞬间、",
            SNAIL_GLOBAL_COPY.favorite,
            "与旅伴关系"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex gap-1 overflow-x-auto border-b border-slate-100 px-2 py-2 sm:px-3",
            role: "tablist",
            "aria-label": "内容分类",
            children: TAB_ORDER.map((tab) => {
              const Icon = TAB_ICONS[tab];
              const selected = activeTab === tab;
              const tabBtnId = `${tabsId}-tab-${tab}`;
              const panelId = `${tabsId}-panel-${tab}`;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  id: tabBtnId,
                  role: "tab",
                  "aria-selected": selected,
                  "aria-controls": panelId,
                  onClick: () => handleTab(tab),
                  className: cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition",
                    selected ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                    getTabLabel(tab, isOwnProfile),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                          selected ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"
                        ),
                        children: counts[tab]
                      }
                    )
                  ]
                },
                tab
              );
            })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 sm:p-5", children: TAB_ORDER.map((tab) => {
          const panelId = `${tabsId}-panel-${tab}`;
          const tabBtnId = `${tabsId}-tab-${tab}`;
          const hidden = activeTab !== tab;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              id: panelId,
              role: "tabpanel",
              "aria-labelledby": tabBtnId,
              hidden,
              className: hidden ? "hidden" : void 0,
              children: [
                tab === "plans" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  UserProfilePlansPanel$1,
                  {
                    plans: content.plans,
                    isOwnProfile,
                    userId: user.id
                  }
                ),
                tab === "moments" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  UserProfileMomentsPanel,
                  {
                    moments: content.moments,
                    isOwnProfile,
                    authorId: user.id,
                    defaultMomentVisibility: user.privacySettings.defaultMomentVisibility
                  }
                ),
                tab === "favorites" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  UserProfileFavoritesPanel,
                  {
                    favorites: content.favorites,
                    isOwnProfile
                  }
                ),
                tab === "companions" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  UserProfileCompanionsPanel,
                  {
                    following: content.following,
                    followers: content.followers,
                    isOwnProfile
                  }
                )
              ]
            },
            tab
          );
        }) })
      ]
    }
  );
}
function SettingRow({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm text-slate-600", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-sm font-medium text-slate-900", children: value })
  ] });
}
function boolLabel(on) {
  return on ? "已开启" : "已关闭";
}
function UserProfileSettingsSection({
  user,
  isOwnProfile,
  className
}) {
  if (!isOwnProfile) {
    return null;
  }
  const { privacySettings: privacy, notificationPreferences: notify } = user;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn("rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6", className),
      "aria-labelledby": "profile-settings-title",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "profile-settings-title", className: "text-sm font-semibold text-slate-900", children: "设置" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: "仅自己可见" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: paths.messages,
            className: "mt-4 flex items-center justify-between gap-3 rounded-xl border border-violet-200/80 bg-violet-50/50 px-4 py-3 text-sm font-semibold text-violet-800 hover:bg-violet-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4", "aria-hidden": true }),
                "站内消息"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-violet-600", children: "查看会话 →" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-200/80 bg-slate-50/80 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-1.5 text-sm font-semibold text-slate-900", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-brand-600", "aria-hidden": true }),
              "隐私"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "mt-2 divide-y divide-slate-200/80", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SettingRow,
                {
                  label: "主页可见性",
                  value: getProfileVisibilityLabel(privacy.profileVisibility)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SettingRow, { label: "展示去过的国家", value: boolLabel(privacy.showVisitedCountries) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SettingRow, { label: "展示邮箱", value: boolLabel(privacy.showEmail) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SettingRow, { label: "允许旅伴请求", value: boolLabel(privacy.allowCompanionRequests) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SettingRow,
                {
                  label: "瞬间默认可见性",
                  value: getTravelMomentVisibilityLabel(privacy.defaultMomentVisibility)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-200/80 bg-slate-50/80 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-1.5 text-sm font-semibold text-slate-900", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 text-violet-600", "aria-hidden": true }),
              "通知"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "mt-2 divide-y divide-slate-200/80", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SettingRow, { label: "旅伴匹配", value: boolLabel(notify.companionMatch) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SettingRow, { label: "行程提醒", value: boolLabel(notify.planReminder) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SettingRow, { label: "新粉丝", value: boolLabel(notify.newFollower) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SettingRow, { label: "动态互动", value: boolLabel(notify.momentEngagement) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SettingRow, { label: "营销推送", value: boolLabel(notify.marketing) })
            ] })
          ] })
        ] })
      ]
    }
  );
}
function UserProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isOwnProfile } = useUserProfile();
  const pageSeo = reactExports.useMemo(() => {
    if (!user) {
      return { title: `${SNAIL_GLOBAL_COPY.memberTerm}蜗居 — ${APP_NAME}`, path: paths.profile };
    }
    return userProfilePageSeo(user.username, user.id, {
      isOwnProfile,
      bio: user.bio,
      ogImage: user.avatar
    });
  }, [user, isOwnProfile]);
  usePageSeo(pageSeo);
  useShareLandingTracking({ contentKind: "user_profile", contentId: user == null ? void 0 : user.id });
  reactExports.useEffect(() => {
    if (!user) {
      return;
    }
    const attribution = parseShareAttribution(location.search);
    if (!attribution || attribution.contentKind !== "travel_moment") {
      return;
    }
    trackShareLandingView({
      contentKind: "travel_moment",
      contentId: attribution.contentId,
      channel: attribution.channel,
      shareUrl: typeof window !== "undefined" ? window.location.href : void 0
    });
  }, [user, location.search]);
  const handleFindCompanion = reactExports.useCallback(() => {
    if (!user) {
      return;
    }
    const destination = user.visitedCountries[0] ? getCountryLabel(user.visitedCountries[0]) : user.username;
    const state = {
      travelBuddy: {
        planId: `profile-${user.id}`,
        planTitle: `与 ${user.username} 同游`,
        destination,
        days: 3,
        budgetLabel: "面议"
      }
    };
    navigate(getTravelPlanCompanionPath(), { state });
  }, [navigate, user]);
  const handleMessage = reactExports.useCallback(() => {
    if (!user) {
      return;
    }
    ensureBuddyConversation({
      peerUserId: user.id,
      peerUsername: user.username,
      peerAvatar: user.avatar
    });
    navigate(messagesThreadPath(user.id));
  }, [navigate, user]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionPage, { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => navigate(-1),
        className: "inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4", "aria-hidden": true }),
          "返回"
        ]
      }
    ) }),
    !user && /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "mx-auto h-10 w-10 text-slate-300", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-base font-semibold text-slate-900", children: "未找到该用户" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "用户可能不存在或链接不正确。" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: paths.home,
          className: "mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700",
          children: "返回首页"
        }
      )
    ] }) }),
    user && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserProfileHeader, { user, isOwnProfile }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserProfileTravelDataPanel, { user, isOwnProfile }) }),
      isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserProfileInviteSection, { userId: user.id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserProfileTravelSection, { user }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserProfileContentTabs, { user, isOwnProfile }) }),
      isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserProfileSettingsSection, { user, isOwnProfile: true }) }),
      !isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-violet-200/80 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-slate-900", children: "寻找旅伴" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-slate-600", children: [
          "与 ",
          user.username,
          " 兴趣相近？前往攻略页看看同目的地灵感。"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleMessage,
              className: "inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4", "aria-hidden": true }),
                "发消息"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleFindCompanion,
              className: "inline-flex rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50",
              children: "寻找旅伴"
            }
          )
        ] })
      ] }) }),
      isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-slate-400", children: [
        "演示主页 ·",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: userProfilePath("user-maple"),
            className: "ml-1 text-brand-600 hover:underline",
            children: "查看其他用户示例"
          }
        )
      ] }) })
    ] })
  ] });
}
export {
  UserProfilePage as default
};
