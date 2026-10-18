-- 商业扩展字段预留（可空；空值 = 前端不渲染商业元素）
-- 总开关：前端 VITE_OPEN_BUSINESS / isOpenBusiness；关闭时与纯免费站一致
-- 禁止在地图 / AI 核心流程硬编码消费这些字段

ALTER TABLE user_plans
  ADD COLUMN IF NOT EXISTS distribute_link TEXT NULL,
  ADD COLUMN IF NOT EXISTS paid_guide_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS activity_tag TEXT NULL,
  ADD COLUMN IF NOT EXISTS member_only BOOLEAN NULL DEFAULT FALSE;

COMMENT ON COLUMN user_plans.distribute_link IS '分销跳转链接（商业扩展预留）';
COMMENT ON COLUMN user_plans.paid_guide_id IS '付费路书 ID（商业扩展预留）';
COMMENT ON COLUMN user_plans.activity_tag IS '合作活动标签（商业扩展预留）';
COMMENT ON COLUMN user_plans.member_only IS '是否会员专属增量（不影响免费基座）';

-- 未来城市 / 景点 / 美食表可复用同名字段；此处仅文档化约定
-- city.distribute_link / spot.paid_guide_id / food.activity_tag / *.member_only
