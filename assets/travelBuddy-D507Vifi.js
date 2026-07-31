const TRAVEL_BUDDY_BRAND = {
  name: "伸出触角",
  tagline: "找到同路蜗友，一起慢爬看世界",
  publishTitle: "发布结伴需求",
  feedTitle: "伸出触角",
  feedSubtitle: "出发时间越近的需求优先展示",
  safetyNotice: "为保障安全，建议熟悉后交换更多联系方式。如遇不适，请立即举报。"
};
const TRAVEL_BUDDY_BUDGET_OPTIONS = [
  { value: "under_500", label: "500元以下" },
  { value: "500_1000", label: "500-1000元" },
  { value: "1000_2000", label: "1000-2000元" },
  { value: "over_2000", label: "2000元以上" }
];
const TRAVEL_BUDDY_TAG_OPTIONS = [
  { value: "meal", label: "饭搭子" },
  { value: "photo", label: "拍照搭子" },
  { value: "carpool_room", label: "拼车/房" },
  { value: "hiking", label: "徒步队友" },
  { value: "language", label: "语言互助" },
  { value: "other", label: "其他" }
];
const TRAVEL_BUDDY_STATUS_LABELS = {
  seeking: "寻找中",
  matched: "已匹配",
  closed: "已关闭"
};
export {
  TRAVEL_BUDDY_BRAND as T,
  TRAVEL_BUDDY_BUDGET_OPTIONS as a,
  TRAVEL_BUDDY_STATUS_LABELS as b,
  TRAVEL_BUDDY_TAG_OPTIONS as c
};
