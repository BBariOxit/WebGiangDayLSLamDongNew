-- Sample data for Lâm Đồng Learning Management System
-- This file contains sample data to populate the database

-- Insert sample categories
INSERT INTO categories (name, slug, description, color, icon, sort_order) VALUES
('Lịch sử', 'lich-su', 'Tìm hiểu về lịch sử hình thành và phát triển của tỉnh Lâm Đồng', '#ff6b6b', 'history', 1),
('Địa lý', 'dia-ly', 'Khám phá địa hình, khí hậu và tài nguyên của Lâm Đồng', '#4ecdc4', 'map', 2),
('Văn hóa', 'van-hoa', 'Tìm hiểu văn hóa đa dạng của các dân tộc tại Lâm Đồng', '#45b7d1', 'culture', 3),
('Kinh tế', 'kinh-te', 'Phát triển kinh tế và các ngành sản xuất của tỉnh', '#96c93d', 'trending_up', 4);

-- Insert sample users (passwords are hashed for bcrypt of 'password123')
INSERT INTO users (email, password_hash, name, role, is_verified, is_active) VALUES
('admin@lamdongnew.edu.vn', '$2b$10$hash_here', 'Quản trị viên', 'admin', TRUE, TRUE),
('teacher1@lamdongnew.edu.vn', '$2b$10$hash_here', 'Thầy Nguyễn Văn A', 'teacher', TRUE, TRUE),
('teacher2@lamdongnew.edu.vn', '$2b$10$hash_here', 'Cô Trần Thị B', 'teacher', TRUE, TRUE),
('student1@gmail.com', '$2b$10$hash_here', 'Nguyễn Minh C', 'student', TRUE, TRUE),
('student2@gmail.com', '$2b$10$hash_here', 'Lê Thị D', 'student', TRUE, TRUE);

-- Insert sample lessons
INSERT INTO lessons (
    title, slug, description, content, summary, category_id, difficulty, duration,
    objectives, prerequisites, tags, instructor_name, is_published, is_featured,
    view_count, completion_count, average_rating, total_ratings
) VALUES
(
    'Lịch sử hình thành tỉnh Lâm Đồng mới', 
    'lich-su-hinh-thanh-lam-dong-moi',
    'Tìm hiểu về quá trình hình thành và phát triển của tỉnh Lâm Đồng từ thời kỳ đầu đến nay',
    '<div class="lesson-content">
        <h2>Giai đoạn tiền sử</h2>
        <p>Trước khi có sự hiện diện của người Việt, vùng đất Lâm Đồng đã có các dân tộc thiểu số sinh sống từ lâu đời...</p>
        
        <h2>Thời kỳ thuộc Pháp (1858-1945)</h2>
        <p>Người Pháp bắt đầu thám hiểm và khai thác vùng cao nguyên Lâm Đồng từ cuối thế kỷ 19...</p>
        
        <h2>Thời kỳ hiện đại</h2>
        <p>Sau năm 1975, tỉnh Lâm Đồng đã trải qua nhiều lần điều chỉnh địa giới hành chính...</p>
    </div>',
    'Bài học về lịch sử hình thành và phát triển của tỉnh Lâm Đồng qua các thời kỳ',
    1, 'Cơ bản', 30,
    ARRAY['Hiểu được quá trình hình thành tỉnh Lâm Đồng', 'Nắm được các mốc thời gian quan trọng', 'Phân tích được ảnh hưởng của các yếu tố lịch sử'],
    ARRAY['Kiến thức cơ bản về lịch sử Việt Nam'],
    ARRAY['lịch sử', 'Lâm Đồng', 'hình thành', 'phát triển'],
    'Thầy Nguyễn Văn A',
    TRUE, TRUE, 1250, 856, 4.7, 125
),
(
    'Địa lý tự nhiên Lâm Đồng',
    'dia-ly-tu-nhien-lam-dong',
    'Khám phá đặc điểm địa hình, khí hậu và tài nguyên thiên nhiên của tỉnh Lâm Đồng',
    '<div class="lesson-content">
        <h2>Vị trí địa lý</h2>
        <p>Lâm Đồng nằm ở phía Nam Tây Nguyên, giáp với nhiều tỉnh thành...</p>
        
        <h2>Địa hình</h2>
        <p>Địa hình Lâm Đồng đa dạng với cao nguyên, núi đồi và thung lũng...</p>
        
        <h2>Khí hậu</h2>
        <p>Khí hậu nhiệt đới gió mùa cao nguyên, mát mẻ quanh năm...</p>
    </div>',
    'Tìm hiểu về đặc điểm địa lý tự nhiên đa dạng của tỉnh Lâm Đồng',
    2, 'Cơ bản', 25,
    ARRAY['Mô tả được vị trí địa lý của Lâm Đồng', 'Phân tích đặc điểm địa hình', 'Giải thích ảnh hưởng của khí hậu'],
    ARRAY['Kiến thức địa lý cơ bản'],
    ARRAY['địa lý', 'tự nhiên', 'khí hậu', 'địa hình'],
    'Cô Trần Thị B',
    TRUE, FALSE, 890, 623, 4.5, 89
),
(
    'Văn hóa đa dạng các dân tộc Lâm Đồng',
    'van-hoa-da-dang-dan-toc-lam-dong',
    'Khám phá sự đa dạng văn hóa của các dân tộc sinh sống tại Lâm Đồng',
    '<div class="lesson-content">
        <h2>Dân tộc Kinh</h2>
        <p>Dân tộc Kinh chiếm đa số dân số, mang văn hóa truyền thống Việt Nam...</p>
        
        <h2>Dân tộc K''Ho</h2>
        <p>Dân tộc K''Ho là dân tộc bản địa lâu đời nhất tại Lâm Đồng...</p>
        
        <h2>Các dân tộc khác</h2>
        <p>Ngoài ra còn có nhiều dân tộc khác như Chăm, Hoa, Tày...</p>
    </div>',
    'Tìm hiểu về sự phong phú và đa dạng văn hóa của các dân tộc tại Lâm Đồng',
    3, 'Trung bình', 35,
    ARRAY['Nhận biết các dân tộc tại Lâm Đồng', 'So sánh đặc điểm văn hóa', 'Đánh giá sự đa dạng văn hóa'],
    ARRAY['Hiểu biết cơ bản về văn hóa Việt Nam'],
    ARRAY['văn hóa', 'dân tộc', 'đa dạng', 'truyền thống'],
    'Thầy Nguyễn Văn A',
    TRUE, TRUE, 756, 445, 4.8, 67
);

-- Insert sample quiz questions for each lesson
INSERT INTO quiz_questions (lesson_id, question_text, options, correct_answer, explanation, points, question_order) VALUES
-- Questions for Lesson 1 (Lịch sử hình thành)
(1, 'Tỉnh Lâm Đồng được thành lập vào năm nào?', 
 '["1975", "1976", "1977", "1978"]', 
 '1976', 
 'Tỉnh Lâm Đồng được thành lập chính thức vào năm 1976 sau khi hợp nhất các tỉnh Lâm Đồng cũ, Tuyên Đức và một phần Ninh Thuận.', 
 2, 1),

(1, 'Dân tộc nào được coi là dân tộc bản địa lâu đời nhất tại Lâm Đồng?', 
 '["Kinh", "K''Ho", "Chăm", "Tày"]', 
 'K''Ho', 
 'Dân tộc K''Ho là dân tộc bản địa có lịch sử sinh sống lâu đời nhất tại vùng đất Lâm Đồng.', 
 2, 2),

-- Questions for Lesson 2 (Địa lý tự nhiên)
(2, 'Lâm Đồng có đặc điểm khí hậu như thế nào?', 
 '["Nhiệt đới gió mùa", "Nhiệt đới gió mùa cao nguyên", "Cận nhiệt đới", "Ôn đới"]', 
 'Nhiệt đới gió mùa cao nguyên', 
 'Do nằm ở độ cao trung bình trên 800m so với mực nước biển, Lâm Đồng có khí hậu nhiệt đới gió mùa cao nguyên, mát mẻ quanh năm.', 
 2, 1),

(2, 'Đỉnh núi cao nhất của Lâm Đồng là?', 
 '["Núi Chư Yang Sin", "Núi Bidoup", "Núi Langbian", "Núi Elephant"]', 
 'Núi Bidoup', 
 'Núi Bidoup với độ cao 2.287m là đỉnh núi cao nhất của tỉnh Lâm Đồng.', 
 2, 2),

-- Questions for Lesson 3 (Văn hóa đa dạng)
(3, 'Có bao nhiêu dân tộc sinh sống tại Lâm Đồng?', 
 '["Hơn 20", "Hơn 30", "Hơn 40", "Hơn 50"]', 
 'Hơn 40', 
 'Lâm Đồng là tỉnh có sự đa dạng dân tộc với hơn 40 dân tộc sinh sống, tạo nên sự phong phú về văn hóa.', 
 2, 1),

(3, 'Lễ hội nào là đặc trưng của dân tộc K''Ho?', 
 '["Lễ hội Kate", "Lễ hội Rija Nagar", "Lễ hội Tết Nguyên Đán", "Lễ hội Trung Thu"]', 
 'Lễ hội Rija Nagar', 
 'Lễ hội Rija Nagar là lễ hội truyền thống quan trọng nhất của dân tộc K''Ho, diễn ra vào tháng 3 âm lịch.', 
 2, 2);

-- Insert sample user progress
INSERT INTO user_lesson_progress (user_id, lesson_id, progress_percentage, is_completed, time_spent, is_bookmarked) VALUES
((SELECT id FROM users WHERE email = 'student1@gmail.com'), 1, 100, TRUE, 1800, TRUE),
((SELECT id FROM users WHERE email = 'student1@gmail.com'), 2, 60, FALSE, 900, FALSE),
((SELECT id FROM users WHERE email = 'student2@gmail.com'), 1, 80, FALSE, 1200, TRUE),
((SELECT id FROM users WHERE email = 'student2@gmail.com'), 3, 100, TRUE, 2100, FALSE);

-- Insert sample quiz attempts
INSERT INTO quiz_attempts (
    user_id, lesson_id, attempt_number, status, total_questions, correct_answers, 
    score_percentage, passed, time_spent
) VALUES
((SELECT id FROM users WHERE email = 'student1@gmail.com'), 1, 1, 'completed', 2, 2, 100.00, TRUE, 180),
((SELECT id FROM users WHERE email = 'student2@gmail.com'), 1, 1, 'completed', 2, 1, 50.00, FALSE, 240),
((SELECT id FROM users WHERE email = 'student2@gmail.com'), 3, 1, 'completed', 2, 2, 100.00, TRUE, 200);

-- Insert sample ratings
INSERT INTO lesson_ratings (user_id, lesson_id, rating, review_title, review_text) VALUES
((SELECT id FROM users WHERE email = 'student1@gmail.com'), 1, 5, 'Bài học rất hay!', 'Nội dung phong phú, dễ hiểu và có nhiều thông tin hữu ích về lịch sử Lâm Đồng.'),
((SELECT id FROM users WHERE email = 'student2@gmail.com'), 1, 4, 'Tốt', 'Bài học khá hay, tuy nhiên cần thêm hình ảnh minh họa.'),
((SELECT id FROM users WHERE email = 'student1@gmail.com'), 3, 5, 'Tuyệt vời!', 'Rất thích tìm hiểu về văn hóa đa dạng của các dân tộc tại Lâm Đồng.');

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, badge_color, requirement_type, requirement_value, points_reward) VALUES
('Người mới bắt đầu', 'Hoàn thành bài học đầu tiên', 'star', '#ffd700', 'lessons_completed', 1, 10),
('Học sinh chăm chỉ', 'Hoàn thành 5 bài học', 'school', '#4caf50', 'lessons_completed', 5, 50),
('Chuyên gia lịch sử', 'Hoàn thành tất cả bài học về lịch sử', 'history', '#ff6b6b', 'category_completed', 1, 100),
('Thần đồng quiz', 'Đạt 100% trong 3 bài quiz liên tiếp', 'quiz', '#2196f3', 'perfect_quizzes', 3, 75);

-- Insert sample user achievements
INSERT INTO user_achievements (user_id, achievement_id) VALUES
((SELECT id FROM users WHERE email = 'student1@gmail.com'), 1),
((SELECT id FROM users WHERE email = 'student1@gmail.com'), 4),
((SELECT id FROM users WHERE email = 'student2@gmail.com'), 1);

-- Insert sample learning paths
INSERT INTO learning_paths (name, description, slug, estimated_duration, difficulty, learning_outcomes, is_published) VALUES
(
    'Khám phá Lâm Đồng toàn diện',
    'Hành trình tìm hiểu toàn diện về tỉnh Lâm Đồng từ lịch sử, địa lý đến văn hóa',
    'kham-pha-lam-dong-toan-dien',
    90,
    'Cơ bản',
    ARRAY['Hiểu biết toàn diện về Lâm Đồng', 'Nắm được đặc trưng của từng lĩnh vực', 'Có thể ứng dụng kiến thức vào thực tế'],
    TRUE
);

-- Insert path lessons
INSERT INTO path_lessons (path_id, lesson_id, lesson_order, is_required) VALUES
(1, 1, 1, TRUE),
(1, 2, 2, TRUE),
(1, 3, 3, TRUE);

-- Insert sample user path progress
INSERT INTO user_path_progress (user_id, path_id, current_lesson_id, completed_lessons, total_lessons, progress_percentage) VALUES
((SELECT id FROM users WHERE email = 'student1@gmail.com'), 1, 2, 1, 3, 33),
((SELECT id FROM users WHERE email = 'student2@gmail.com'), 1, 3, 2, 3, 67);

-- Update user statistics
UPDATE users SET 
    total_lessons_completed = (
        SELECT COUNT(*) 
        FROM user_lesson_progress 
        WHERE user_id = users.id AND is_completed = TRUE
    ),
    total_study_time = (
        SELECT COALESCE(SUM(time_spent), 0) / 60 
        FROM user_lesson_progress 
        WHERE user_id = users.id
    );

-- Update lesson statistics
UPDATE lessons SET
    completion_count = (
        SELECT COUNT(*) 
        FROM user_lesson_progress 
        WHERE lesson_id = lessons.id AND is_completed = TRUE
    ),
    average_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM lesson_ratings 
        WHERE lesson_id = lessons.id
    ),
    total_ratings = (
        SELECT COUNT(*) 
        FROM lesson_ratings 
        WHERE lesson_id = lessons.id
    );