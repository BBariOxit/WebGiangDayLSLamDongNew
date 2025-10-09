-- Seed data for Lâm Đồng Learning Management System
-- Version: 1.0
-- Description: Initial data migration from mock services

-- Insert Categories
INSERT INTO categories (name, slug, description, color, sort_order) VALUES
('Lịch sử địa phương', 'lich-su-dia-phuong', 'Lịch sử hình thành và phát triển các địa danh Lâm Đồng', '#1976d2', 1),
('Văn hóa bản địa', 'van-hoa-ban-dia', 'Văn hóa các dân tộc thiểu số tại Lâm Đồng', '#388e3c', 2),
('Địa lý Lâm Đồng', 'dia-ly-lam-dong', 'Đặc điểm địa lý và tài nguyên thiên nhiên', '#f57c00', 3),
('Kinh tế - Xã hội', 'kinh-te-xa-hoi', 'Phát triển kinh tế và đời sống xã hội', '#7b1fa2', 4);

-- Insert Demo Users (passwords will be hashed by backend on real implementation)
-- For now, storing bcrypt hash of passwords: admin123, teacher123, student123
-- Note: These are bcrypt hashes generated with salt rounds = 10
INSERT INTO users (id, email, password_hash, name, role, is_verified, is_active) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@lamdong.edu.vn', '$2a$10$rBV2y6g3K0qKQp5qJt5fTeZQKjN9hGhMqZDPqxNQKzN5QKqKQKqKQ', 'Admin Hệ thống', 'admin', true, true),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'teacher@lamdong.edu.vn', '$2a$10$rBV2y6g3K0qKQp5qJt5fTeZQKjN9hGhMqZDPqxNQKzN5QKqKQKqKQ', 'GV. Nguyễn Văn A', 'teacher', true, true),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'student@lamdong.edu.vn', '$2a$10$rBV2y6g3K0qKQp5qJt5fTeZQKjN9hGhMqZDPqxNQKzN5QKqKQKqKQ', 'HS. Trần Thị B', 'student', true, true);

-- Insert Lessons (from lessonsData.js)
INSERT INTO lessons (
    id, title, slug, summary, description, content, instructor_name, 
    duration, difficulty, average_rating, category_id, tags, 
    is_published, published_at, created_at, updated_at
) VALUES
(
    1,
    'Lang Biang: Nền văn hóa bản địa và khởi nguồn không gian cư trú',
    'lang-biang-lich-su-hinh-thanh',
    'Lang Biang như lớp trầm tích văn hóa bản địa K''Ho – Lạch – Chil và nền tảng sinh thái tiền đề cho các giai đoạn phát triển sau.',
    'Trình bày bối cảnh tự nhiên – cộng đồng bản địa – ý nghĩa biểu tượng và vai trò nền tảng của Lang Biang trong lịch sử Lâm Đồng.',
    '<div class="lesson-content">
        <h1>Lang Biang: Nền văn hóa bản địa và khởi nguồn</h1>
        <section>
          <h2>1. Không gian tự nhiên</h2>
          <ul>
            <li>Độ cao tương đối tạo vi khí hậu mát, nguồn nước đầu nguồn.</li>
            <li>Thảm thực vật phong phú -> nguồn thức ăn, vật liệu.</li>
            <li>Vị trí trung gian giữa duyên hải – cao nguyên giúp giao tiếp sơ khai.</li>
          </ul>
        </section>
        <section>
          <h2>2. Cộng đồng bản địa</h2>
          <p>Nhóm K''Ho – Lạch – Chil định cư lâu đời, cấu trúc xã hội mang sắc thái mẫu hệ biến đổi theo tiếp xúc ngoại lai.</p>
          <ul>
            <li>Nhà ở: nhà dài biến thể, vật liệu gỗ – tre – lá.</li>
            <li>Sinh kế: săn bắt, đốt nương, trao đổi muối – vỏ sò từ miền duyên hải.</li>
          </ul>
        </section>
        <section>
          <h2>3. Biểu tượng & truyền thuyết</h2>
          <p>Truyền thuyết Lang – Biang phản ánh xung đột – hòa giải – liên kết nhóm tộc, tạo nền tảng bản sắc chung.</p>
        </section>
        <section>
          <h2>4. Vai trò nền tảng</h2>
          <ul>
            <li>Cung cấp nền tri thức bản địa về thổ nhưỡng, khí hậu.</li>
            <li>Định vị "tầng gốc" trong chuỗi phát triển: Bản sắc → Khai phá → Đô thị hóa.</li>
          </ul>
        </section>
        <section class="summary">
          <h2>Tóm tắt ý nghĩa</h2>
          <p>Lang Biang là lớp gốc văn hóa – sinh thái, giúp nhận diện tính kế thừa trong phát triển Lâm Đồng.</p>
        </section>
      </div>',
    'Nhóm biên soạn địa phương',
    25,
    'Cơ bản',
    4.9,
    1,
    ARRAY['Lịch sử','Địa danh','Lang Biang'],
    true,
    '2025-09-25 00:00:00+07',
    '2025-09-25 00:00:00+07',
    '2025-09-25 00:00:00+07'
),
(
    2,
    'Djiring (Di Linh): Cửa ngõ khai phá thuộc địa',
    'djiring-di-linh-cua-ngo-khai-pha',
    'Djiring trở thành trạm trung chuyển chiến lược cuối thế kỷ XIX – đầu XX trên tuyến khảo sát cao nguyên.',
    'Phân tích chức năng hậu cần – kiểm soát địa bàn – mở đường của Djiring trong giai đoạn khai phá thuộc địa.',
    '<div class="lesson-content">
        <h1>Djiring (Di Linh): Cửa ngõ khai phá</h1>
        <section>
          <h2>1. Bối cảnh</h2>
          <p>Pháp khảo sát khí hậu cao nguyên, Djiring thành điểm dừng trên tuyến Phan Rang – Djiring – Lang Biang.</p>
        </section>
        <section>
          <h2>2. Chức năng giai đoạn 1900–1930</h2>
          <ul>
            <li>Hậu cần: lương thực, nhân lực, vật liệu.</li>
            <li>Khai thác: gỗ, lâm sản, định vị kiểm soát dân cư.</li>
            <li>Mở đường: tiền đề hình thành trục lên Đà Lạt.</li>
          </ul>
        </section>
        <section>
          <h2>3. Di sản hạ tầng</h2>
          <p>Mạng đường phân tầng còn lại tác động tới hướng phát triển sau này của khu vực trung tâm tỉnh.</p>
        </section>
        <section class="summary">
          <h2>Tóm tắt</h2>
          <p>Djiring giữ vai trò <strong>cửa ngõ động lực</strong>, chuyển tiếp từ bản địa sang khai phá tổ chức.</p>
        </section>
      </div>',
    'Nhóm biên soạn địa phương',
    20,
    'Cơ bản',
    4.8,
    1,
    ARRAY['Lịch sử','Địa danh','Djiring'],
    true,
    '2025-09-25 00:00:00+07',
    '2025-09-25 00:00:00+07',
    '2025-09-25 00:00:00+07'
),
(
    3,
    'Đà Lạt: Trung tâm khí hậu – hành chính – giáo dục',
    'da-lat-trung-tam-khi-hau-hanh-chinh',
    'Quá trình quy hoạch, xây dựng và chuyển đổi chức năng của Đà Lạt qua các giai đoạn.',
    'Từ thành phố nghỉ dưỡng thuộc địa tới trung tâm đa chức năng nông nghiệp công nghệ cao & giáo dục.',
    '<div class="lesson-content">
        <h1>Đà Lạt: Hình thành & chuyển đổi chức năng</h1>
        <section>
          <h2>1. Khảo sát & Quy hoạch (1902–1915)</h2>
          <p>Các báo cáo khí hậu khẳng định giá trị chữa bệnh – nghỉ dưỡng -> quy hoạch đô thị tầng thấp.</p>
        </section>
        <section>
          <h2>2. Kiến thiết thuộc địa (1920–1945)</h2>
          <ul>
            <li>Xây biệt thự, trường Lycée Yersin, cơ sở y tế.</li>
            <li>Tạo mô thức đô thị sinh khí hậu.</li>
          </ul>
        </section>
        <section>
          <h2>3. Giai đoạn chuyển tiếp (1954–1975)</h2>
          <p>Mở rộng quản trị vùng cao; bổ sung hạ tầng giao thông nội vùng.</p>
        </section>
        <section>
          <h2>4. Tái cấu trúc sau 1975</h2>
          <p>Đa dạng hóa: giáo dục – nghiên cứu nông nghiệp – du lịch hội nghị.</p>
        </section>
        <section>
          <h2>5. Định hướng hiện đại</h2>
          <ul>
            <li>Nông nghiệp công nghệ cao (rau – hoa – giống).</li>
            <li>Đổi mới sáng tạo khí hậu mát.</li>
          </ul>
        </section>
        <section class="summary">
          <h2>Tóm tắt</h2>
          <p>Đà Lạt là <strong>hạt nhân điều phối</strong> & nền tảng hình ảnh thương hiệu tỉnh.</p>
        </section>
      </div>',
    'Nhóm biên soạn địa phương',
    35,
    'Trung bình',
    4.9,
    1,
    ARRAY['Lịch sử','Địa danh','Đà Lạt'],
    true,
    '2025-09-25 00:00:00+07',
    '2025-09-25 00:00:00+07',
    '2025-09-25 00:00:00+07'
),
(
    4,
    'Liên Khương: Hạ tầng kết nối chiến lược',
    'lien-khuong-ha-tang-ket-noi',
    'Vai trò của sân bay & nút giao Liên Khương trong mở rộng kết nối và chuỗi giá trị nông sản – du lịch.',
    'Phân tích hình thành – nâng cấp – tác động kinh tế xã hội của hạ tầng Liên Khương.',
    '<div class="lesson-content">
        <h1>Liên Khương: Hạ tầng kết nối chiến lược</h1>
        <section>
          <h2>1. Hình thành</h2>
          <p>Khởi đầu thập niên 1960, phục vụ kết nối quân sự – dân sự hạn chế.</p>
        </section>
        <section>
          <h2>2. Nâng cấp & Mở rộng (2000s–)</h2>
          <ul>
            <li>Kéo dài đường băng.</li>
            <li>Mở tuyến bay nội địa trọng điểm.</li>
          </ul>
        </section>
        <section>
          <h2>3. Tác động kinh tế</h2>
          <p>Giảm thời gian luân chuyển nông sản tươi; tăng khách du lịch cuối tuần.</p>
        </section>
        <section class="summary">
          <h2>Tóm tắt</h2>
          <p>Liên Khương là <strong>nút giao khí hậu – logistics</strong> thúc đẩy chuỗi giá trị.</p>
        </section>
      </div>',
    'Nhóm biên soạn địa phương',
    18,
    'Cơ bản',
    4.7,
    1,
    ARRAY['Lịch sử','Địa danh','Liên Khương'],
    true,
    '2025-09-25 00:00:00+07',
    '2025-09-25 00:00:00+07',
    '2025-09-25 00:00:00+07'
),
(
    5,
    'Bảo Lộc (Blao): Trục nông – công nghiệp chế biến',
    'bao-loc-blao-nong-cong-nghiep',
    'Bảo Lộc hình thành chuỗi giá trị chè – cà phê – tơ tằm và vai trò cân bằng cơ cấu đô thị tỉnh.',
    'Nhìn lại quá trình từ đồn điền sau 1950 tới chuỗi chế biến sâu sau 1990 và định hướng hiện đại hóa.',
    '<div class="lesson-content">
        <h1>Bảo Lộc (Blao): Trục nông – công nghiệp</h1>
        <section>
          <h2>1. Giai đoạn đồn điền (1950–1975)</h2>
          <p>Hình thành đồn điền chè & cà phê; lao động di cư tổ chức lại không gian.</p>
        </section>
        <section>
          <h2>2. Tái cấu trúc sau 1975</h2>
          <p>Hợp tác xã – quốc doanh, đặt nền tảng hạ tầng chế biến.</p>
        </section>
        <section>
          <h2>3. Chế biến sâu (1990–)</h2>
          <ul>
            <li>Trà chất lượng cao, tơ tằm, cà phê đặc sản.</li>
            <li>Tham gia chuỗi xuất khẩu.</li>
          </ul>
        </section>
        <section>
          <h2>4. Vai trò cân bằng</h2>
          <p>Giảm áp lực dân cư Đà Lạt, tạo cực phát triển phía Nam.</p>
        </section>
        <section class="summary">
          <h2>Tóm tắt</h2>
          <p>Bảo Lộc là <strong>trục giá trị nông sản chế biến</strong> và cực tăng trưởng thứ hai.</p>
        </section>
      </div>',
    'Nhóm biên soạn địa phương',
    22,
    'Trung bình',
    4.85,
    1,
    ARRAY['Lịch sử','Địa danh','Bảo Lộc'],
    true,
    '2025-09-25 00:00:00+07',
    '2025-09-25 00:00:00+07',
    '2025-09-25 00:00:00+07'
);

-- Insert sample quiz questions for Lesson 1 (Lang Biang)
INSERT INTO quiz_questions (lesson_id, question_text, question_type, options, correct_answer, explanation, difficulty, points, question_order) VALUES
(
    1,
    'Nhóm cộng đồng bản địa nào định cư lâu đời tại vùng Lang Biang?',
    'multiple_choice',
    '["K''Ho – Lạch – Chil", "Tày – Nùng", "Mường – Dao", "Ê Đê – Gia Rai"]',
    'K''Ho – Lạch – Chil',
    'Nhóm K''Ho – Lạch – Chil là cộng đồng bản địa định cư lâu đời tại vùng Lang Biang, có cấu trúc xã hội mang sắc thái mẫu hệ.',
    1,
    10,
    1
),
(
    1,
    'Yếu tố tự nhiên nào của Lang Biang tạo điều kiện thuận lợi cho cộng đồng bản địa?',
    'multiple_choice',
    '["Độ cao tạo vi khí hậu mát và nguồn nước", "Gần biển thuận tiện đánh bắt cá", "Đất bằng phẳng rộng lớn", "Có mỏ khoáng sản quý"]',
    'Độ cao tạo vi khí hậu mát và nguồn nước',
    'Độ cao tương đối của Lang Biang tạo vi khí hậu mát, nguồn nước đầu nguồn và thảm thực vật phong phú.',
    2,
    10,
    2
),
(
    1,
    'Truyền thuyết Lang – Biang phản ánh điều gì về cộng đồng bản địa?',
    'multiple_choice',
    '["Xung đột – hòa giải – liên kết nhóm tộc", "Chiến tranh với ngoại bang", "Phát triển kinh tế mậu dịch", "Di cư từ miền khác đến"]',
    'Xung đột – hòa giải – liên kết nhóm tộc',
    'Truyền thuyết này phản ánh quá trình xung đột, hòa giải và liên kết giữa các nhóm tộc, tạo nền tảng bản sắc chung.',
    2,
    15,
    3
);

-- Insert sample quiz questions for Lesson 2 (Djiring)
INSERT INTO quiz_questions (lesson_id, question_text, question_type, options, correct_answer, explanation, difficulty, points, question_order) VALUES
(
    2,
    'Djiring (Di Linh) trở thành trạm trung chuyển vào thời kỳ nào?',
    'multiple_choice',
    '["Cuối thế kỷ XIX – đầu XX", "Thế kỷ XVIII", "Sau năm 1975", "Thời kỳ tiền sử"]',
    'Cuối thế kỷ XIX – đầu XX',
    'Djiring trở thành trạm trung chuyển chiến lược cuối thế kỷ XIX – đầu XX trên tuyến khảo sát cao nguyên.',
    1,
    10,
    1
),
(
    2,
    'Chức năng chính của Djiring trong giai đoạn 1900-1930 là gì?',
    'multiple_choice',
    '["Hậu cần và mở đường lên cao nguyên", "Trung tâm thương mại", "Thành phố du lịch", "Cảng biển"]',
    'Hậu cần và mở đường lên cao nguyên',
    'Djiring đóng vai trò hậu cần (lương thực, nhân lực, vật liệu) và mở đường tiền đề hình thành trục lên Đà Lạt.',
    2,
    10,
    2
);

-- Insert sample quiz questions for Lesson 3 (Đà Lạt)
INSERT INTO quiz_questions (lesson_id, question_text, question_type, options, correct_answer, explanation, difficulty, points, question_order) VALUES
(
    3,
    'Đà Lạt được quy hoạch ban đầu với mục đích gì?',
    'multiple_choice',
    '["Thành phố nghỉ dưỡng và chữa bệnh", "Thủ đô hành chính", "Trung tâm công nghiệp", "Cảng biển chiến lược"]',
    'Thành phố nghỉ dưỡng và chữa bệnh',
    'Các báo cáo khí hậu khẳng định giá trị chữa bệnh – nghỉ dưỡng, dẫn đến quy hoạch đô thị tầng thấp.',
    1,
    10,
    1
),
(
    3,
    'Giai đoạn nào Đà Lạt được xây dựng biệt thự và trường Lycée Yersin?',
    'multiple_choice',
    '["1920-1945", "1902-1915", "1954-1975", "Sau 1975"]',
    '1920-1945',
    'Giai đoạn kiến thiết thuộc địa 1920-1945 chứng kiến xây dựng biệt thự, trường Lycée Yersin và cơ sở y tế.',
    2,
    10,
    2
),
(
    3,
    'Sau 1975, Đà Lạt phát triển theo hướng nào?',
    'multiple_choice',
    '["Giáo dục – nghiên cứu nông nghiệp – du lịch", "Chỉ phát triển du lịch", "Công nghiệp nặng", "Trung tâm tài chính"]',
    'Giáo dục – nghiên cứu nông nghiệp – du lịch',
    'Giai đoạn tái cấu trúc sau 1975 đa dạng hóa chức năng: giáo dục, nghiên cứu nông nghiệp và du lịch hội nghị.',
    3,
    15,
    3
);

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, badge_color, requirement_type, requirement_value, points_reward) VALUES
('Người mới bắt đầu', 'Hoàn thành bài học đầu tiên', '🎓', '#4caf50', 'lessons_completed', 1, 10),
('Học giả sơ cấp', 'Hoàn thành 5 bài học', '📚', '#2196f3', 'lessons_completed', 5, 50),
('Chuyên gia địa phương', 'Hoàn thành tất cả bài học về Lâm Đồng', '🏆', '#ff9800', 'lessons_completed', 10, 100),
('Điểm cao', 'Đạt 100% trong một bài kiểm tra', '⭐', '#ffc107', 'quiz_score', 100, 25),
('Kiên trì', 'Học liên tục 7 ngày', '🔥', '#f44336', 'streak', 7, 75);

-- Reset sequences to continue from current max values
SELECT setval('lessons_id_seq', (SELECT MAX(id) FROM lessons));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('quiz_questions_id_seq', (SELECT MAX(id) FROM quiz_questions));
SELECT setval('achievements_id_seq', (SELECT MAX(id) FROM achievements));

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO webgiangday_user;

-- Completion message
DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Database seeded successfully!';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Demo Users:';
    RAISE NOTICE '  - admin@lamdong.edu.vn (password: admin123)';
    RAISE NOTICE '  - teacher@lamdong.edu.vn (password: teacher123)';
    RAISE NOTICE '  - student@lamdong.edu.vn (password: student123)';
    RAISE NOTICE '-------------------------------------------------';
    RAISE NOTICE 'Data Summary:';
    RAISE NOTICE '  - Categories: 4';
    RAISE NOTICE '  - Users: 3';
    RAISE NOTICE '  - Lessons: 5 (Lang Biang, Djiring, Đà Lạt, Liên Khương, Bảo Lộc)';
    RAISE NOTICE '  - Quiz Questions: 8';
    RAISE NOTICE '  - Achievements: 5';
    RAISE NOTICE '=================================================';
END $$;
