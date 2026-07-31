-- 伸出触角 · 结伴需求表
-- PostgreSQL / 兼容 Supabase

CREATE TABLE IF NOT EXISTS travel_buddies (
  id            VARCHAR(128) PRIMARY KEY,
  user_id       VARCHAR(128) NOT NULL,
  destination   VARCHAR(120) NOT NULL,
  start_date    DATE NOT NULL,
  budget_range  VARCHAR(32) NOT NULL CHECK (
    budget_range IN ('under_500', '500_1000', '1000_2000', 'over_2000')
  ),
  tags          JSONB NOT NULL DEFAULT '[]'::jsonb,
  description   TEXT,
  status        VARCHAR(16) NOT NULL DEFAULT 'seeking' CHECK (
    status IN ('seeking', 'matched', 'closed')
  ),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_travel_buddies_status_start
  ON travel_buddies (status, start_date ASC);

CREATE INDEX IF NOT EXISTS idx_travel_buddies_user
  ON travel_buddies (user_id, created_at DESC);

COMMENT ON TABLE travel_buddies IS '蜗牛旅行 · 伸出触角结伴需求';
COMMENT ON COLUMN travel_buddies.status IS 'seeking=寻找中, matched=已匹配, closed=已关闭';
