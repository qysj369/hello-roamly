/** 与 PageContainer / BottomNav 一致的内容列宽（Tailwind class 片段） */
export const PAGE_CONTAINER_MAX_WIDTH =
  'w-full max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl';

/** 水平内边距，与负边距拉通组件（顶栏、发现筛选等）配对使用 */
export const PAGE_CONTAINER_PADDING_X = 'px-4 md:px-6 lg:px-8';

export const PAGE_CONTAINER_NEG_MARGIN_X = '-mx-4 md:-mx-6 lg:-mx-8';

export const PAGE_CONTAINER_PADDING_MATCHED = `${PAGE_CONTAINER_PADDING_X} ${PAGE_CONTAINER_NEG_MARGIN_X}`;

/** 与首页地图 hero 卡片一致的圆角描边 */
export const HOME_MAP_CARD_SHELL = 'rounded-2xl border border-slate-800';
