CREATE TABLE IF NOT EXISTS notification_dismissals (
  notification_id INTEGER NOT NULL REFERENCES notifications(notification_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  hidden_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (notification_id, user_id)
);
