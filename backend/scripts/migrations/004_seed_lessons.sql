-- Seed a few sample lessons if not already present (004)
INSERT INTO lessons (title, slug, summary, content_html, created_by, is_published)
SELECT 'Giới thiệu Lang Biang', 'gioi-thieu-lang-biang', 'Tổng quan về Lang Biang và ý nghĩa lịch sử', '<p>Nội dung bài học Lang Biang...</p>', NULL, true
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='gioi-thieu-lang-biang');

INSERT INTO lessons (title, slug, summary, content_html, created_by, is_published)
SELECT 'Khai phá Djiring', 'khai-pha-djiring', 'Vai trò Djiring trong giai đoạn khai phá', '<p>Nội dung bài học Djiring...</p>', NULL, true
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='khai-pha-djiring');

INSERT INTO lessons (title, slug, summary, content_html, created_by, is_published)
SELECT 'Phát triển Đà Lạt', 'phat-trien-da-lat', 'Các giai đoạn phát triển của Đà Lạt', '<p>Nội dung bài học Đà Lạt...</p>', NULL, true
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE slug='phat-trien-da-lat');

-- Sample quiz questions for lesson 1 (Lang Biang)
INSERT INTO quiz_questions (lesson_id, question_text, question_type, points)
SELECT l.lesson_id, 'Lang Biang gắn với nhóm tộc người nào?', 'multiple_choice', 1
FROM lessons l WHERE l.slug='gioi-thieu-lang-biang'
AND NOT EXISTS (
  SELECT 1 FROM quiz_questions qq JOIN lessons lx ON qq.lesson_id=lx.lesson_id
  WHERE lx.slug='gioi-thieu-lang-biang'
);

-- Insert answers for that question
WITH q AS (
  SELECT qq.question_id FROM quiz_questions qq JOIN lessons l ON qq.lesson_id=l.lesson_id
  WHERE l.slug='gioi-thieu-lang-biang' LIMIT 1
)
INSERT INTO quiz_answers (question_id, answer_text, is_correct)
SELECT q.question_id, v.answer_text, v.is_correct FROM q
JOIN (VALUES
  ('K''Ho – Lạch – Chil', true),
  ('Chăm – Khmer', false),
  ('Tày – Nùng', false),
  ('Mường – Thái', false)
) AS v(answer_text, is_correct)
WHERE NOT EXISTS (
  SELECT 1 FROM quiz_answers qa WHERE qa.question_id = q.question_id
);
