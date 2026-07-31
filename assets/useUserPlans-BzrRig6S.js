var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { bw as createLucideIcon, aC as USER_API, be as buildUserApiHeaders, e$ as useQuery, d_ as queryKeys } from "./index-DwV1qlqh.js";
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
  ["path", { d: "M2 12h20", key: "9i4pu4" }]
];
const Globe = createLucideIcon("globe", __iconNode$1);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
];
const Lock = createLucideIcon("lock", __iconNode);
class FetchUserPlanDetailApiError extends Error {
  constructor(message, options) {
    super(message);
    __publicField(this, "status");
    this.name = "FetchUserPlanDetailApiError";
    this.status = options == null ? void 0 : options.status;
  }
}
async function fetchUserPlanById(planId) {
  const response = await fetch(`${USER_API.plans}/${encodeURIComponent(planId)}`, {
    method: "GET",
    headers: buildUserApiHeaders()
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && "error" in payload && payload.error ? payload.error : `读取失败（HTTP ${response.status}）`;
    throw new FetchUserPlanDetailApiError(message, { status: response.status });
  }
  if (!payload || !("item" in payload) || !payload.item) {
    throw new FetchUserPlanDetailApiError("API 返回格式无效", { status: response.status });
  }
  return payload;
}
class FetchUserPlansApiError extends Error {
  constructor(message, options) {
    super(message);
    __publicField(this, "status");
    this.name = "FetchUserPlansApiError";
    this.status = options == null ? void 0 : options.status;
  }
}
function buildListUrl(params = {}) {
  const search = new URLSearchParams();
  if (params.public) {
    search.set("public", "1");
  }
  if (params.userId) {
    search.set("userId", params.userId);
  }
  const query = search.toString();
  return query ? `${USER_API.plans}?${query}` : USER_API.plans;
}
async function fetchUserPlans(params = {}) {
  const response = await fetch(buildListUrl(params), {
    method: "GET",
    headers: buildUserApiHeaders()
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && "error" in payload && payload.error ? payload.error : `读取失败（HTTP ${response.status}）`;
    throw new FetchUserPlansApiError(message, { status: response.status });
  }
  if (!payload || !("items" in payload) || !Array.isArray(payload.items)) {
    throw new FetchUserPlansApiError("API 返回格式无效", { status: response.status });
  }
  return payload;
}
const userPlansListQueryKey = (params = {}) => queryKeys.userPlans.list(params);
function useUserPlans(params = {}) {
  return useQuery({
    queryKey: userPlansListQueryKey(params),
    queryFn: () => fetchUserPlans(params)
  });
}
function useUserPublicPlans(userId) {
  return useUserPlans({ userId, public: true });
}
const userPlanDetailQueryKey = (id) => queryKeys.userPlans.detail(id);
function useUserPlanDetail(planId) {
  return useQuery({
    queryKey: userPlanDetailQueryKey(planId ?? ""),
    queryFn: () => fetchUserPlanById(planId),
    enabled: Boolean(planId)
  });
}
export {
  Globe as G,
  Lock as L,
  useUserPlans as a,
  useUserPublicPlans as b,
  useUserPlanDetail as u
};
