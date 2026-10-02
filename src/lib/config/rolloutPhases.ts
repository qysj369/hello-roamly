/**
 * 蜗牛旅行 · 分阶段落地策略 & 素材分级（文档 / 注释层）
 *
 * 完整路径亦写入仓库根目录 `README.md`「四阶段落地路径」章节，作为后续迭代标准。
 * 关于页静态展示文案见 `FOOTER_ROLLOUT_PLAN_STATIC` / `FOOTER_ROLLOUT_PLAN_LINES`（无跳转、无商业引导）。
 *
 * ---------------------------------------------------------------------------
 * 【分阶段落地】
 * 阶段一 · 当前内测：免费基座 + 架构预留 + 心智规范 + bug 修复，全站零商业化。
 * 阶段二 · 冷启动上线：季节漫行专题 + UGC 社区 + 品牌心智，仍 100% 免费。
 * 阶段三 · 增长拓展：附属分销可插拔插槽（住宿/景区参考），核心免费工具不受干扰。
 * 阶段四 · 品牌成熟：付费增量（深度路书 / AI 定制会员），收益反哺免费算力与素材。
 * ---------------------------------------------------------------------------
 * 【素材分级 · 控制前期成本】
 * 内测仅维护 8 座热门城完整实拍；阶段二、三分批补齐其余城实景，无需一次投入。
 * ---------------------------------------------------------------------------
 */

export type RolloutPhaseId = 'phase1_beta' | 'phase2_cold_start' | 'phase3_growth' | 'phase4_mature';

export type RolloutPhase = {
  id: RolloutPhaseId;
  title: string;
  summary: string;
  commercial: 'off' | 'distribute_optional' | 'paid_addon';
};

/** 当前产品所处阶段（内测 = 阶段一） */
export const CURRENT_ROLLOUT_PHASE: RolloutPhaseId = 'phase1_beta';

export const ROLLOUT_PHASES: readonly RolloutPhase[] = [
  {
    id: 'phase1_beta',
    title: '阶段一 · 当前内测期',
    summary:
      '已完成免费基座、架构预留、心智底层规范、bug 全量修复，全站零商业化。',
    commercial: 'off',
  },
  {
    id: 'phase2_cold_start',
    title: '阶段二 · 冷启动上线期',
    summary:
      '扩充季节漫行专题、完善 UGC 游记社区，持续强化品牌心智，依旧 100% 免费、无商业组件启用。',
    commercial: 'off',
  },
  {
    id: 'phase3_growth',
    title: '阶段三 · 增长拓展期',
    summary:
      '开启附属分销可插拔组件，仅在预留插槽展示第三方住宿/景区参考，核心免费工具完整保留。',
    commercial: 'distribute_optional',
  },
  {
    id: 'phase4_mature',
    title: '阶段四 · 品牌成熟期',
    summary:
      '开启付费增量增值服务（深度小众路书、精细化 AI 定制会员），商业收益定向反哺免费服务算力、素材与内容维护。',
    commercial: 'paid_addon',
  },
] as const;

export const ROLLOUT_STRATEGY_DOC = ROLLOUT_PHASES.map(
  (phase) => `${phase.title}：${phase.summary}`,
).join('\n');

/**
 * 内测优先完善实景图的 8 座热门城市（首页预览条前 8）
 * 其余城市：AI 配套图或国风渐变占位，不为前期成本强补 72 城实拍。
 */
export const MEDIA_PRIORITY_HOT_CITIES = [
  '北京',
  '上海',
  '杭州',
  '苏州',
  '济南',
  '南京',
  '广州',
  '成都',
] as const;

export const MEDIA_TIER_STRATEGY_DOC = [
  '内测阶段仅维护首页 8 座热门城市完整实拍图素材。',
  '其余城市使用 AI 配套图 / 渐变占位降级，保证图栏不空、不裂图。',
  '阶段二、三分批补齐剩余城市实景素材，无需一次性投入大量人工。',
  'photoPath / 白名单保留，补图后即可自动切回实拍，免改业务代码。',
].join('\n');

/** 免费服务可持续规则（文档 / 页脚静态说明同源摘要） */
export const FREE_SERVICE_SUSTAINABILITY_DOC = [
  '三大核心功能永久免费刚性底线：城市弹窗查询、基础 AI 漫行攻略、出行预算测算。',
  'AI 接口限流、内容标准化审核、用户反馈迭代机制完整留存。',
  '商业化组件由 isOpenBusiness（VITE_OPEN_BUSINESS）全局开关管控，支持一键切换纯免费产品形态。',
].join('\n');

/**
 * 页脚「迭代规划」静态文字（仅展示，无链接、无弹窗、无商业引导）
 * 与 README「四阶段落地路径」保持口径一致。
 */
export const FOOTER_ROLLOUT_PLAN_TITLE = '迭代规划';

/** 四阶段文案（列表排版用；字面与 README 一致） */
export const FOOTER_ROLLOUT_PLAN_LINES = [
  '阶段一（当前内测）：免费基座与心智规范已就绪，全站零商业化。',
  '阶段二（冷启动）：季节漫行专题与 UGC 社区，仍 100% 免费。',
  '阶段三（增长）：附属插槽可展示住宿/景区参考，核心工具保持免费。',
  '阶段四（成熟）：付费仅做增量增值，收益反哺免费算力与素材。',
] as const;

/** 兼容旧拼接展示 */
export const FOOTER_ROLLOUT_PLAN_STATIC = FOOTER_ROLLOUT_PLAN_LINES.join('\n');

export function isMediaPriorityHotCity(city: string): boolean {
  return (MEDIA_PRIORITY_HOT_CITIES as readonly string[]).includes(city);
}

export function getCurrentRolloutPhase(): RolloutPhase {
  return (
    ROLLOUT_PHASES.find((phase) => phase.id === CURRENT_ROLLOUT_PHASE) ?? ROLLOUT_PHASES[0]
  );
}
