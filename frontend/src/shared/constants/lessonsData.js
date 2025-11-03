// Mô hình mới: Mỗi ĐỊA DANH = 1 bài học, tập trung lịch sử hình thành & phát triển.
// Chuẩn hóa TAGS: ['Lịch sử','Địa danh', '<Tên địa danh chuẩn hóa>'] để dễ migrate sang PostgreSQL.
export const lessonsData = [
  {
    id: 1,
    title: 'Lang Biang: Nền văn hóa bản địa và khởi nguồn không gian cư trú',
    slug: 'lang-biang-lich-su-hinh-thanh',
    summary: 'Lang Biang như lớp trầm tích văn hóa bản địa K\'Ho – Lạch – Chil và nền tảng sinh thái tiền đề cho các giai đoạn phát triển sau.',
    description: 'Trình bày bối cảnh tự nhiên – cộng đồng bản địa – ý nghĩa biểu tượng và vai trò nền tảng của Lang Biang trong lịch sử Lâm Đồng.',
    instructor: 'Nhóm biên soạn địa phương',
    duration: '25 phút',
    difficulty: 'Cơ bản',
    rating: 4.9,
  studyCount: 0,
    progress: 0,
    category: 'Lịch sử địa phương',
    tags: ['Lịch sử','Địa danh','Lang Biang'],
    status: 'Chưa học',
    images: [
      { url: 'https://picsum.photos/seed/langbiang-mountain/1200/800', caption: 'Đỉnh Lang Biang', description: 'Không gian cư trú cổ của các nhóm K\'Ho – Lạch – Chil.' }
    ],
    contentHtml: `
      <div class="lesson-content">
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
          <p>Nhóm K\'Ho – Lạch – Chil định cư lâu đời, cấu trúc xã hội mang sắc thái mẫu hệ biến đổi theo tiếp xúc ngoại lai.</p>
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
            <li>Định vị “tầng gốc” trong chuỗi phát triển: Bản sắc → Khai phá → Đô thị hóa.</li>
          </ul>
        </section>
        <section class="summary">
          <h2>Tóm tắt ý nghĩa</h2>
          <p>Lang Biang là lớp gốc văn hóa – sinh thái, giúp nhận diện tính kế thừa trong phát triển Lâm Đồng.</p>
        </section>
      </div>
    `,
    isPublished: true,
    createdAt: '2025-09-25',
    updatedAt: '2025-09-25'
  },
  {
    id: 2,
    title: 'Djiring (Di Linh): Cửa ngõ khai phá thuộc địa',
    slug: 'djiring-di-linh-cua-ngo-khai-pha',
    summary: 'Djiring trở thành trạm trung chuyển chiến lược cuối thế kỷ XIX – đầu XX trên tuyến khảo sát cao nguyên.',
    description: 'Phân tích chức năng hậu cần – kiểm soát địa bàn – mở đường của Djiring trong giai đoạn khai phá thuộc địa.',
    instructor: 'Nhóm biên soạn địa phương',
    duration: '20 phút',
    difficulty: 'Cơ bản',
    rating: 4.8,
  studyCount: 0,
    progress: 0,
    category: 'Lịch sử địa phương',
    tags: ['Lịch sử','Địa danh','Djiring'],
    status: 'Chưa học',
    images: [
      { url: 'https://images.unsplash.com/photo-1533055640609-24b498cdfd00?w=800', caption: 'Djiring (Di Linh) xưa', description: 'Vùng trung chuyển lên cao nguyên thời Pháp.' }
    ],
    contentHtml: `
      <div class="lesson-content">
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
      </div>
    `,
    isPublished: true,
    createdAt: '2025-09-25',
    updatedAt: '2025-09-25'
  },
  {
    id: 3,
    title: 'Đà Lạt: Trung tâm khí hậu – hành chính – giáo dục',
    slug: 'da-lat-trung-tam-khi-hau-hanh-chinh',
    summary: 'Quá trình quy hoạch, xây dựng và chuyển đổi chức năng của Đà Lạt qua các giai đoạn.',
    description: 'Từ thành phố nghỉ dưỡng thuộc địa tới trung tâm đa chức năng nông nghiệp công nghệ cao & giáo dục.',
    instructor: 'Nhóm biên soạn địa phương',
    duration: '35 phút',
    difficulty: 'Trung bình',
    rating: 4.9,
  studyCount: 0,
    progress: 0,
    category: 'Lịch sử địa phương',
    tags: ['Lịch sử','Địa danh','Đà Lạt'],
    status: 'Chưa học',
    images: [
      { url: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800', caption: 'Kiến trúc Pháp tại Đà Lạt', description: 'Dinh thự và trường học thời kỳ 1920–1945.' }
    ],
    contentHtml: `
      <div class="lesson-content">
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
      </div>
    `,
    isPublished: true,
    createdAt: '2025-09-25',
    updatedAt: '2025-09-25'
  },
  {
    id: 4,
    title: 'Liên Khương: Hạ tầng kết nối chiến lược',
    slug: 'lien-khuong-ha-tang-ket-noi',
    summary: 'Vai trò của sân bay & nút giao Liên Khương trong mở rộng kết nối và chuỗi giá trị nông sản – du lịch.',
    description: 'Phân tích hình thành – nâng cấp – tác động kinh tế xã hội của hạ tầng Liên Khương.',
    instructor: 'Nhóm biên soạn địa phương',
    duration: '18 phút',
    difficulty: 'Cơ bản',
    rating: 4.7,
  studyCount: 0,
    progress: 0,
    category: 'Lịch sử địa phương',
    tags: ['Lịch sử','Địa danh','Liên Khương'],
    status: 'Chưa học',
    images: [
      { url: 'https://images.unsplash.com/photo-1612488402539-0d6a52b58a51?w=800', caption: 'Liên Khương – kết nối vùng', description: 'Cửa ngõ hàng không của cao nguyên.' }
    ],
    contentHtml: `
      <div class="lesson-content">
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
      </div>
    `,
    isPublished: true,
    createdAt: '2025-09-25',
    updatedAt: '2025-09-25'
  },
  {
    id: 5,
    title: 'Bảo Lộc (Blao): Trục nông – công nghiệp chế biến',
    slug: 'bao-loc-blao-nong-cong-nghiep',
    summary: 'Bảo Lộc hình thành chuỗi giá trị chè – cà phê – tơ tằm và vai trò cân bằng cơ cấu đô thị tỉnh.',
    description: 'Nhìn lại quá trình từ đồn điền sau 1950 tới chuỗi chế biến sâu sau 1990 và định hướng hiện đại hóa.',
    instructor: 'Nhóm biên soạn địa phương',
    duration: '22 phút',
    difficulty: 'Trung bình',
    rating: 4.85,
  studyCount: 0,
    progress: 0,
    category: 'Lịch sử địa phương',
    tags: ['Lịch sử','Địa danh','Bảo Lộc'],
    status: 'Chưa học',
    images: [
      { url: 'https://picsum.photos/seed/baoloc-tea/1200/800', caption: 'Bảo Lộc vùng chè & cà phê', description: 'Chuỗi giá trị nông sản chế biến.' }
    ],
    contentHtml: `
      <div class="lesson-content">
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
      </div>
    `,
    isPublished: true,
    createdAt: '2025-09-25',
    updatedAt: '2025-09-25'
  }
];

export default lessonsData;
