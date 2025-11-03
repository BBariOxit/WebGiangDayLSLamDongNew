-- 015_notifications.sql
-- Purpose: Notifications for new lessons/quizzes and per-user messages

CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- e.g., new_lesson, new_quiz
  title VARCHAR(255) NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  is_global BOOLEAN DEFAULT TRUE,
  target_user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  lesson_id INT REFERENCES lessons(lesson_id) ON DELETE CASCADE,
  quiz_id INT REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target_user_id);

CREATE TABLE IF NOT EXISTS notification_reads (
  notification_id INT NOT NULL REFERENCES notifications(notification_id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON notification_reads(user_id);
