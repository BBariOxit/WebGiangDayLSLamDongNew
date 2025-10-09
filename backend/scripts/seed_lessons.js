-- Seed sample lessons data based on the screenshot
-- These lessons are about historical landmarks in Lam Dong

-- First, get admin user_id
DO $$
DECLARE
  admin_id INTEGER;
BEGIN
  SELECT user_id INTO admin_id FROM users WHERE email = 'admin@lamdong.edu.vn' LIMIT 1;
  
  IF admin_id IS NULL THEN
    SELECT user_id INTO admin_id FROM users WHERE role_id = 1 LIMIT 1;
  END IF;

  -- Insert sample lessons
  INSERT INTO lessons (
    title, 
    slug, 
    summary, 
    content_html,
    instructor,
    duration,
    difficulty,
    rating,
    students_count,
    category,
    tags,
    images,
    status,
    created_by,
    is_published
  ) VALUES
  (
    'Lang Biang: Nền văn hóa bản địa và khởi nguồn không gian cư trú',
    'lang-biang-lich-su-hinh-thanh',
    'Lang Biang như lớp trầm tích văn hóa bản địa K''Ho – Lạch – Chil và nền tảng sinh thái tiền đề cho các giai đoạn phát triển sau.',
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
        <p>K''Ho, Lạch, Chil sống từ thời tiền sử, dựa vào rừng, săn bắt, canh tác luân canh.</p>
        <p>Tổ chức xã hội thị tộc, có hệ thống tín ngưỡng linh hồn tổ tiên gắn với thiên nhiên.</p>
      </section>
      <section>
        <h2>3. Ý nghĩa biểu tượng</h2>
        <p>Tên gọi Lang Biang từ truyền thuyết tình yêu K''Lang – H''Biang (liên kết cộng đồng, thiên nhiên, tâm linh).</p>
      </section>
      <section>
        <h2>4. Vai trò nền tảng</h2>
        <p>Cung cấp khung không gian – văn hóa ban đầu. Là tiền đề cho các giai đoạn tiếp theo (Pháp thuộc, phát triển đô thị).</p>
      </section>
    </div>',
    'Nhóm biên soạn địa phương',
    '25 phút',
    'Cơ bản',
    4.9,
    0,
    'Lịch sử địa phương',
    ARRAY['Lịch sử', 'Địa danh', 'Lang Biang'],
    '[{"url": "https://images.unsplash.com/photo-1606036740355-56bcd30f6f5a?w=800", "caption": "Đỉnh Lang Biang", "description": "Không gian cư trú cổ của các nhóm K''Ho – Lạch – Chil."}]'::jsonb,
    'Chưa học',
    admin_id,
    true
  ),
  (
    'Djiring (Di Linh): Cửa ngõ khai phá thuộc địa',
    'djiring-di-linh-cua-ngo-khai-pha',
    'Djiring trở thành trạm trung chuyển lược cuối thế kỷ XIX – đầu XX trên tuyến khảo sát cao nguyên.',
    '<div class="lesson-content">
      <h1>Djiring (Di Linh): Cửa ngõ khai phá thuộc địa</h1>
      <section>
        <h2>1. Vị trí chiến lược</h2>
        <p>Nằm giữa duyên hải (Phan Rang, Phan Thiết) và cao nguyên (Đà Lạt).</p>
        <p>Là điểm đầu mối trong các tuyến khảo sát của Pháp (cuối thế kỷ XIX).</p>
      </section>
      <section>
        <h2>2. Vai trò đầu mối giao thông</h2>
        <p>Trạm dừng chân của đoàn thám hiểm Yersin (1893), Paul Doumer.</p>
        <p>Tuyến đường sắt răng cưa Phan Rang – Đà Lạt đi qua (1908-1932).</p>
      </section>
      <section>
        <h2>3. Mở đầu khai thác kinh tế</h2>
        <p>Đồn điền cà phê, chè sơ khai. Khai thác gỗ quý (1900-1920).</p>
      </section>
      <section>
        <h2>4. Tầm quan trọng lịch sử</h2>
        <p>Cửa ngõ đầu tiên đưa Lâm Đồng vào hệ thống thuộc địa Pháp. Nền tảng hạ tầng cho sự phát triển sau này của Đà Lạt.</p>
      </section>
    </div>',
    'Nhóm biên soạn địa phương',
    '20 phút',
    'Cơ bản',
    4.8,
    0,
    'Lịch sử địa phương',
    ARRAY['Lịch sử', 'Địa danh', 'Djiring'],
    '[{"url": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800", "caption": "Di Linh ngày nay", "description": "Cửa ngõ khai phá thời Pháp thuộc"}]'::jsonb,
    'Chưa học',
    admin_id,
    true
  ),
  (
    'Đà Lạt: Trung tâm khí hậu – hành chính – giáo dục',
    'da-lat-trung-tam-khi-hau-hanh-chinh',
    'Quá trình quy hoạch, xây dựng và chuyển đổi chức năng của Đà Lạt qua các giai đoạn.',
    '<div class="lesson-content">
      <h1>Đà Lạt: Trung tâm khí hậu – hành chính – giáo dục</h1>
      <section>
        <h2>1. Giai đoạn 1897-1945: Thành phố nghỉ dưỡng Pháp</h2>
        <ul>
          <li><strong>Quy hoạch:</strong> Yersin, Ernest Hébrard (1919-1923) – khu biệt thự, hồ nhân tạo, vườn hoa.</li>
          <li><strong>Chức năng:</strong> Nghỉ dưỡng cho quan chức, quý tộc Pháp.</li>
          <li><strong>Kiến trúc:</strong> Phong cách Normandy, Art Deco.</li>
        </ul>
      </section>
      <section>
        <h2>2. Giai đoạn 1945-1975: Trung tâm hành chính – quân sự</h2>
        <p>Đà Lạt trở thành trụ sở nhiều cơ quan chính quyền miền Nam.</p>
        <p>Trường sĩ quan, học viện quân sự (Thiếu sinh quân, v.v.).</p>
      </section>
      <section>
        <h2>3. Sau 1975: Thành phố giáo dục – du lịch – nông nghiệp công nghệ cao</h2>
        <ul>
          <li><strong>Giáo dục:</strong> Đại học Đà Lạt, các trường chuyên ngành.</li>
          <li><strong>Du lịch:</strong> Phát triển dựa trên cảnh quan, khí hậu, di sản kiến trúc.</li>
          <li><strong>Nông nghiệp:</strong> Hoa, rau, cà phê chất lượng cao.</li>
        </ul>
      </section>
      <section>
        <h2>4. Ý nghĩa hiện tại</h2>
        <p>Biểu tượng của Lâm Đồng. Động lực phát triển kinh tế – văn hóa – xã hội của tỉnh.</p>
      </section>
    </div>',
    'Nhóm biên soạn địa phương',
    '35 phút',
    'Trung bình',
    4.9,
    0,
    'Lịch sử địa phương',
    ARRAY['Lịch sử', 'Địa danh', 'Đà Lạt'],
    '[{"url": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800", "caption": "Thành phố Đà Lạt", "description": "Trung tâm khí hậu và giáo dục"}]'::jsonb,
    'Chưa học',
    admin_id,
    true
  ),
  (
    'Liên Khương: Hạ tầng kết nối chiến lược',
    'lien-khuong-ha-tang-ket-noi',
    'Vai trò của Liên Khương trong hệ thống giao thông và hạ tầng kết nối Lâm Đồng với cả nước.',
    '<div class="lesson-content">
      <h1>Liên Khương: Hạ tầng kết nối chiến lược</h1>
      <section>
        <h2>1. Vị trí địa lý</h2>
        <p>Nằm trên quốc lộ 20, cách Đà Lạt khoảng 30km về phía Nam.</p>
        <p>Là cửa ngõ kết nối Đà Lạt với TP. Hồ Chí Minh và các tỉnh miền Đông Nam Bộ.</p>
      </section>
      <section>
        <h2>2. Sân bay Liên Khương</h2>
        <p><strong>Lịch sử:</strong> Xây dựng thời Pháp (1933), mở rộng sau 1975.</p>
        <p><strong>Ý nghĩa:</strong> Sân bay quan trọng nhất của Tây Nguyên, kết nối du lịch và thương mại.</p>
      </section>
      <section>
        <h2>3. Trung tâm nông nghiệp</h2>
        <p>Vùng trồng rau, hoa, cà phê lớn.</p>
        <p>Các nhà máy chế biến nông sản.</p>
      </section>
      <section>
        <h2>4. Vai trò hiện tại</h2>
        <p>Trung tâm logistics và giao thông của Lâm Đồng.</p>
        <p>Động lực phát triển kinh tế – xã hội của vùng.</p>
      </section>
    </div>',
    'Nhóm biên soạn địa phương',
    '20 phút',
    'Cơ bản',
    4.7,
    0,
    'Lịch sử địa phương',
    ARRAY['Lịch sử', 'Địa danh', 'Liên Khương'],
    '[{"url": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800", "caption": "Sân bay Liên Khương", "description": "Hạ tầng kết nối chiến lược"}]'::jsonb,
    'Chưa học',
    admin_id,
    true
  ),
  (
    'Bảo Lộc (Blao): Trục nông – công nghiệp chế biến',
    'bao-loc-truc-nong-cong-nghiep',
    'Sự phát triển của Bảo Lộc từ vùng đất hoang sơ thành trung tâm nông nghiệp và công nghiệp chế biến.',
    '<div class="lesson-content">
      <h1>Bảo Lộc (Blao): Trục nông – công nghiệp chế biến</h1>
      <section>
        <h2>1. Giai đoạn sơ khai (trước 1945)</h2>
        <p>Đồn điền chè Pháp (Bảo Lộc trở thành vùng chè lớn nhất Đông Dương).</p>
        <p>Đồn điền cà phê, cao su.</p>
      </section>
      <section>
        <h2>2. Giai đoạn 1945-1975</h2>
        <p>Mở rộng diện tích đồn điền dưới chính quyền miền Nam.</p>
        <p>Xuất hiện các làng tái định cư (người từ Bắc vào).</p>
      </section>
      <section>
        <h2>3. Sau 1975</h2>
        <ul>
          <li><strong>Nông nghiệp:</strong> Chè, cà phê, dâu tằm, hồ tiêu.</li>
          <li><strong>Công nghiệp:</strong> Nhà máy chế biến chè, cà phê, tơ tằm.</li>
          <li><strong>Du lịch:</strong> Thác Dambri, vườn chè, làng tơ tằm.</li>
        </ul>
      </section>
      <section>
        <h2>4. Ý nghĩa</h2>
        <p>Trung tâm công nghiệp chế biến lớn nhất Lâm Đồng.</p>
        <p>Đóng góp quan trọng vào GDP của tỉnh.</p>
      </section>
    </div>',
    'Nhóm biên soạn địa phương',
    '25 phút',
    'Trung bình',
    4.8,
    0,
    'Lịch sử địa phương',
    ARRAY['Lịch sử', 'Địa danh', 'Bảo Lộc'],
    '[{"url": "https://images.unsplash.com/photo-1587045525133-b85362f4f43e?w=800", "caption": "Vườn chè Bảo Lộc", "description": "Trung tâm nông nghiệp và công nghiệp chế biến"}]'::jsonb,
    'Chưa học',
    admin_id,
    true
  );

END $$;
