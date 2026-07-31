-- 伸出触角 · 结伴站内信

CREATE TABLE IF NOT EXISTS buddy_messages (
  id             VARCHAR(128) PRIMARY KEY,
  buddy_post_id  VARCHAR(128) NOT NULL REFERENCES travel_buddies(id) ON DELETE CASCADE,
  from_user_id   VARCHAR(128) NOT NULL,
  to_user_id     VARCHAR(128) NOT NULL,
  content        TEXT NOT NULL,
  is_read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buddy_messages_thread
  ON buddy_messages (buddy_post_id, from_user_id, to_user_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_buddy_messages_recipient_unread
  ON buddy_messages (to_user_id, is_read, created_at DESC);

COMMENT ON TABLE buddy_messages IS '结伴需求相关的初步沟通消息';
