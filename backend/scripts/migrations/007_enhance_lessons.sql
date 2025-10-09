-- Migration 007: Enhance lessons table with more fields
-- Add fields for instructor, duration, difficulty, rating, students, category, tags, images

-- Add new columns to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS instructor VARCHAR(150),
ADD COLUMN IF NOT EXISTS duration VARCHAR(50),
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'Cơ bản',
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS students_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS tags TEXT[], -- Array of tags
ADD COLUMN IF NOT EXISTS images JSONB, -- Array of image objects
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Chưa học';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON lessons(difficulty);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_created_by ON lessons(created_by);

-- Update existing lessons to have default values
UPDATE lessons 
SET 
  instructor = 'Nhóm biên soạn địa phương',
  duration = '25 phút',
  difficulty = 'Cơ bản',
  rating = 4.5,
  students_count = 0,
  category = 'Lịch sử địa phương',
  tags = ARRAY['Lịch sử', 'Địa danh'],
  status = 'Chưa học',
  images = '[]'::jsonb
WHERE instructor IS NULL;

COMMENT ON COLUMN lessons.instructor IS 'Tên giảng viên hoặc người biên soạn';
COMMENT ON COLUMN lessons.duration IS 'Thời lượng học (ví dụ: 25 phút)';
COMMENT ON COLUMN lessons.difficulty IS 'Độ khó: Cơ bản, Trung bình, Nâng cao';
COMMENT ON COLUMN lessons.rating IS 'Đánh giá từ 0-5 sao';
COMMENT ON COLUMN lessons.students_count IS 'Số học sinh đã học';
COMMENT ON COLUMN lessons.category IS 'Danh mục bài học';
COMMENT ON COLUMN lessons.tags IS 'Mảng các tag (Lịch sử, Địa danh, v.v.)';
COMMENT ON COLUMN lessons.images IS 'Mảng các đối tượng hình ảnh {url, caption, description}';
COMMENT ON COLUMN lessons.status IS 'Trạng thái: Chưa học, Đang học, Đã hoàn thành';
