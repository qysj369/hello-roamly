/** 单轮全量生成 token 上限（兜底用） */
export const MAP_PLAN_MAX_TOKENS = 4096;

/** 第一阶段：简介 + 门到门行程流水账 */
export const MAP_PLAN_PHASE1_MAX_TOKENS = 2200;

/**
 * 单城超过该天数才逐天生成（防超长截断）。
 * 常见 2–4 天一次写完，避免 Intro+每天各打一次 API 导致 25s+ 等待。
 */
export const MAP_PLAN_DAY_BY_DAY_MIN_DAYS = 5;

/** 多地联游：简介单独生成 */
export const MAP_PLAN_INTRO_MAX_TOKENS = 700;

/** 多地联游：单日行程 */
export const MAP_PLAN_DAY_MAX_TOKENS = 1100;

/** 第二阶段：蜗牛提示 + 避坑指南（长行程/多站用） */
export const MAP_PLAN_PHASE2_MAX_TOKENS = 800;

/** 短途单城：一次流式输出四段（简介+行程+蜗牛+避坑） */
export const MAP_PLAN_SINGLE_STREAM_MAX_TOKENS = 2800;

/** 续写单段上限 */
export const MAP_PLAN_INSIGHTS_CONTINUE_MAX_TOKENS = 1000;

/** 续写最多 1 次（截断时补全蜗牛/避坑） */
export const MAP_PLAN_MAX_CONTINUE_ATTEMPTS = 1;

/** 非流式兜底最多尝试次数 */
export const MAP_PLAN_FINALIZE_MAX_ATTEMPTS = 1;
