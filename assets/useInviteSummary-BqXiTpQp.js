import { bw as createLucideIcon, G as Copy, aq as Share2, bl as cn, _ as LoaderCircle, dI as normalizeInviteCode, da as hasInviteBackend, ek as setPendingInviteCode, dh as http, c$ as getUserFacingErrorMessage, cu as getPendingInviteCode, cb as getDemoInviteCodeForUser, cl as getInviterUserIdByCode, aR as appendDemoReferral, bj as clearPendingInviteCode, aQ as appendDemoGrantedReward, H as DEFAULT_DEMO_REFERRALS, dz as listDemoReferrals, dy as listDemoGrantedRewards, J as DEFAULT_INVITE_REWARDS, b4 as buildInviteLink, e$ as useQuery, dq as isInviteEnabled, f0 as useQueryClient } from "./index-DwV1qlqh.js";
import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { C as Check } from "./check-fuogZiuU.js";
import { i as isProductionAppMode } from "./appMode-mvxqt0jz.js";
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
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ]
];
const Shield = createLucideIcon("shield", __iconNode);
function InviteCodeCard({ summary, className, compact = false }) {
  const [copyState, setCopyState] = reactExports.useState("idle");
  async function copyText(text, kind) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(kind);
      window.setTimeout(() => setCopyState("idle"), 2e3);
    } catch {
      setCopyState("idle");
    }
  }
  async function handleShare() {
    const payload = {
      title: "Hello Roamly 穷游邀请",
      text: `用我的邀请码 ${summary.inviteCode} 一起规划穷游行程`,
      url: summary.inviteLink
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      await copyText(summary.inviteLink, "link");
    } catch {
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-3", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3",
          compact && "px-3 py-2.5"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-amber-800", children: "我的邀请码" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xl font-bold tracking-widest text-amber-950", children: summary.inviteCode })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => void copyText(summary.inviteCode, "code"),
                className: "inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50",
                children: [
                  copyState === "code" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5", "aria-hidden": true }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                  "复制码"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => void copyText(summary.inviteLink, "link"),
                className: "inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50",
                children: [
                  copyState === "link" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5", "aria-hidden": true }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                  "复制链接"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => void handleShare(),
                className: "inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                  "分享"
                ]
              }
            )
          ] })
        ]
      }
    ),
    !compact && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "break-all text-[11px] text-slate-500", children: summary.inviteLink }),
    summary.message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-500", children: summary.message })
  ] });
}
function InviteCodeCardSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 py-8 text-sm text-slate-500", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-amber-600", "aria-hidden": true }),
    "加载邀请信息…"
  ] });
}
const INVITE_API = {
  me: "/invites/me",
  redeem: "/invites/redeem",
  claim: "/invites/claim"
};
function buildDemoInviteSummary(userId) {
  const inviteCode = getDemoInviteCodeForUser(userId);
  const referrals = [...listDemoReferrals(userId), ...DEFAULT_DEMO_REFERRALS];
  const grantedExtra = listDemoGrantedRewards(userId);
  const rewards = [...DEFAULT_INVITE_REWARDS, ...grantedExtra];
  const invitedCount = referrals.length;
  const activeCount = referrals.filter((row) => row.status !== "registered").length;
  const pendingRewardCount = rewards.filter((row) => row.status === "pending").length;
  const totalPointsEarned = rewards.filter((row) => row.kind === "points" && row.status === "granted").reduce((sum, row) => sum + (row.amount ?? 0), 0);
  return {
    inviteCode,
    inviteLink: buildInviteLink(inviteCode),
    invitedCount,
    activeCount,
    pendingRewardCount,
    totalPointsEarned,
    rewards,
    referrals: referrals.slice(0, 20),
    message: hasInviteBackend() || isProductionAppMode() ? void 0 : "邀请接口已预留：配置 VITE_API_BASE_URL 后由服务端发码与发奖"
  };
}
async function fetchInviteSummary(userId) {
  if (!hasInviteBackend()) {
    return buildDemoInviteSummary(userId);
  }
  const { data } = await http.get(INVITE_API.me);
  return data;
}
async function redeemInviteCode(input) {
  const code = normalizeInviteCode(input.code);
  if (!code) {
    return { ok: false, message: "邀请码无效" };
  }
  if (!hasInviteBackend()) {
    setPendingInviteCode(code);
    return {
      ok: true,
      message: `演示：已记录邀请码 ${code}，登录后将模拟发放奖励`,
      reward: {
        id: `demo-redeem-${Date.now()}`,
        kind: "points",
        label: "新用户礼包",
        amount: 30,
        status: "pending",
        condition: "完成注册后到账"
      }
    };
  }
  try {
    const body = {
      code,
      inviteeUserId: input.inviteeUserId
    };
    const { data } = await http.post(INVITE_API.redeem, body);
    return data;
  } catch (error) {
    return { ok: false, message: getUserFacingErrorMessage(error, "invite") };
  }
}
async function claimInviteReward(input) {
  const { userId, rewardId } = input;
  if (!hasInviteBackend()) {
    const summary = buildDemoInviteSummary(userId);
    const reward = summary.rewards.find((item) => item.id === rewardId);
    if (!reward) {
      return { ok: false, message: "奖励不存在" };
    }
    if (reward.status === "granted") {
      return { ok: false, message: "该奖励已领取" };
    }
    const granted = {
      ...reward,
      status: "granted",
      earnedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    appendDemoGrantedReward(userId, granted);
    if (rewardId === "reward-invite-3") {
      appendDemoReferral(userId, {
        id: `ref-${Date.now()}`,
        inviteeLabel: "新邀请好友",
        status: "rewarded",
        joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
        rewardLabel: "+200 积分"
      });
    }
    return {
      ok: true,
      message: `演示：已领取「${reward.label}」`,
      reward: granted
    };
  }
  try {
    const body = { rewardId };
    const { data } = await http.post(INVITE_API.claim, body);
    return data;
  } catch (error) {
    return { ok: false, message: getUserFacingErrorMessage(error, "invite") };
  }
}
async function simulateInviteRegistration(inviteeUserId) {
  const pending = getPendingInviteCode();
  if (!pending) {
    return { ok: false, message: "没有待绑定的邀请码，请先通过邀请链接访问" };
  }
  const ownCode = getDemoInviteCodeForUser(inviteeUserId);
  if (normalizeInviteCode(pending) === normalizeInviteCode(ownCode)) {
    return { ok: false, message: "不能使用自己的邀请码" };
  }
  const inviterId = getInviterUserIdByCode(pending);
  if (!inviterId) {
    return { ok: false, message: "演示环境未配置该邀请码对应的用户" };
  }
  appendDemoReferral(inviterId, {
    id: `ref-bound-${Date.now()}`,
    inviteeLabel: "新好友（演示）",
    status: "active",
    joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
    rewardLabel: "+50 积分待发放"
  });
  clearPendingInviteCode();
  return {
    ok: true,
    message: `演示：好友已通过 ${pending} 注册，邀请人已获得记录`,
    reward: {
      id: `demo-welcome-${Date.now()}`,
      kind: "points",
      label: "受邀新人礼包",
      amount: 30,
      status: "granted",
      condition: "注册成功",
      earnedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}
const inviteSummaryQueryKey = (userId) => ["invite", "summary", userId];
function useInviteSummary(userId, enabled = true) {
  return useQuery({
    queryKey: inviteSummaryQueryKey(userId ?? ""),
    queryFn: () => fetchInviteSummary(userId),
    enabled: Boolean(userId) && isInviteEnabled() && enabled,
    staleTime: 3e4
  });
}
function useInvalidateInviteSummary() {
  const client = useQueryClient();
  return (userId) => {
    void client.invalidateQueries({ queryKey: inviteSummaryQueryKey(userId) });
  };
}
export {
  InviteCodeCard as I,
  Shield as S,
  InviteCodeCardSkeleton as a,
  useInviteSummary as b,
  claimInviteReward as c,
  redeemInviteCode as r,
  simulateInviteRegistration as s,
  useInvalidateInviteSummary as u
};
