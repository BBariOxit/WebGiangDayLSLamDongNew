import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 55432,
  database: process.env.DB_NAME || 'webgiangday_db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function seedLessons() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting to seed lessons...');
    
    // Get admin user
    const adminResult = await client.query(`
      SELECT user_id FROM users 
      WHERE email = 'admin@lamdong.edu.vn' 
      OR role_id = 1 
      LIMIT 1
    `);
    
    const adminId = adminResult.rows[0]?.user_id;
    
    if (!adminId) {
      console.error('❌ No admin user found!');
      return;
    }
    
    console.log(`✅ Found admin user with ID: ${adminId}`);
    
    // Delete existing sample lessons
    await client.query(`DELETE FROM lessons WHERE slug LIKE '%lang-biang%' OR slug LIKE '%djiring%' OR slug LIKE '%da-lat%' OR slug LIKE '%lien-khuong%' OR slug LIKE '%bao-loc%'`);
    
    // Insert sample lessons
    const lessons = [
      {
        title: 'Lang Biang: Nền văn hóa bản địa và khởi nguồn không gian cư trú',
        slug: 'lang-biang-lich-su-hinh-thanh',
        summary: 'Lang Biang như lớp trầm tích văn hóa bản địa K\'Ho – Lạch – Chil và nền tảng sinh thái tiền đề cho các giai đoạn phát triển sau.',
        content_html: `<div class="lesson-content">
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
  <p>K'Ho, Lạch, Chil sống từ thời tiền sử, dựa vào rừng, săn bắt, canh tác luân canh.</p>
  <p>Tổ chức xã hội thị tộc, có hệ thống tín ngưỡng linh hồn tổ tiên gắn với thiên nhiên.</p>
</section>
</div>`,
        instructor: 'Nhóm biên soạn địa phương',
        duration: '25 phút',
        difficulty: 'Cơ bản',
        rating: 4.9,
        category: 'Lịch sử địa phương',
        tags: ['Lịch sử', 'Địa danh', 'Lang Biang'],
        images: [{"url": "https://images.unsplash.com/photo-1606036740355-56bcd30f6f5a?w=800", "caption": "Đỉnh Lang Biang"}]
      },
      {
        title: 'Djiring (Di Linh): Cửa ngõ khai phá thuộc địa',
        slug: 'djiring-di-linh-cua-ngo-khai-pha',
        summary: 'Djiring trở thành trạm trung chuyển lược cuối thế kỷ XIX – đầu XX trên tuyến khảo sát cao nguyên.',
        content_html: `<div class="lesson-content">
<h1>Djiring (Di Linh): Cửa ngõ khai phá thuộc địa</h1>
<section>
  <h2>1. Vị trí chiến lược</h2>
  <p>Nằm giữa duyên hải (Phan Rang, Phan Thiết) và cao nguyên (Đà Lạt).</p>
</section>
</div>`,
        instructor: 'Nhóm biên soạn địa phương',
        duration: '20 phút',
        difficulty: 'Cơ bản',
        rating: 4.8,
        category: 'Lịch sử địa phương',
        tags: ['Lịch sử', 'Địa danh', 'Djiring'],
        images: [{"url": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800", "caption": "Di Linh ngày nay"}]
      },
      {
        title: 'Đà Lạt: Trung tâm khí hậu – hành chính – giáo dục',
        slug: 'da-lat-trung-tam-khi-hau-hanh-chinh',
        summary: 'Quá trình quy hoạch, xây dựng và chuyển đổi chức năng của Đà Lạt qua các giai đoạn.',
        content_html: `<div class="lesson-content">
<h1>Đà Lạt: Trung tâm khí hậu – hành chính – giáo dục</h1>
<section>
  <h2>1. Giai đoạn 1897-1945</h2>
  <p>Thành phố nghỉ dưỡng Pháp với kiến trúc độc đáo.</p>
</section>
</div>`,
        instructor: 'Nhóm biên soạn địa phương',
        duration: '35 phút',
        difficulty: 'Trung bình',
        rating: 4.9,
        category: 'Lịch sử địa phương',
        tags: ['Lịch sử', 'Địa danh', 'Đà Lạt'],
        images: [{"url": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800", "caption": "Thành phố Đà Lạt"}]
      },
      {
        title: 'Liên Khương: Hạ tầng kết nối chiến lược',
        slug: 'lien-khuong-ha-tang-ket-noi',
        summary: 'Vai trò của Liên Khương trong hệ thống giao thông và hạ tầng kết nối Lâm Đồng.',
        content_html: `<div class="lesson-content">
<h1>Liên Khương: Hạ tầng kết nối chiến lược</h1>
<section>
  <h2>1. Sân bay Liên Khương</h2>
  <p>Cửa ngõ hàng không quan trọng nhất Tây Nguyên.</p>
</section>
</div>`,
        instructor: 'Nhóm biên soạn địa phương',
        duration: '20 phút',
        difficulty: 'Cơ bản',
        rating: 4.7,
        category: 'Lịch sử địa phương',
        tags: ['Lịch sử', 'Địa danh', 'Liên Khương'],
        images: [{"url": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800", "caption": "Sân bay Liên Khương"}]
      },
      {
        title: 'Bảo Lộc (Blao): Trục nông – công nghiệp chế biến',
        slug: 'bao-loc-truc-nong-cong-nghiep',
        summary: 'Sự phát triển của Bảo Lộc từ vùng đất hoang sơ thành trung tâm nông nghiệp.',
        content_html: `<div class="lesson-content">
<h1>Bảo Lộc (Blao): Trục nông – công nghiệp chế biến</h1>
<section>
  <h2>1. Đồn điền chè</h2>
  <p>Bảo Lộc từng là vùng chè lớn nhất Đông Dương.</p>
</section>
</div>`,
        instructor: 'Nhóm biên soạn địa phương',
        duration: '25 phút',
        difficulty: 'Trung bình',
        rating: 4.8,
        category: 'Lịch sử địa phương',
        tags: ['Lịch sử', 'Địa danh', 'Bảo Lộc'],
        images: [{"url": "https://images.unsplash.com/photo-1587045525133-b85362f4f43e?w=800", "caption": "Vườn chè Bảo Lộc"}]
      }
    ];
    
    for (const lesson of lessons) {
      await client.query(`
        INSERT INTO lessons (
          title, slug, summary, content_html, instructor, duration, 
          difficulty, rating, students_count, category, tags, images,
          status, created_by, is_published
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, $10, $11, 'Chưa học', $12, true)
      `, [
        lesson.title,
        lesson.slug,
        lesson.summary,
        lesson.content_html,
        lesson.instructor,
        lesson.duration,
        lesson.difficulty,
        lesson.rating,
        lesson.category,
        lesson.tags,
        JSON.stringify(lesson.images),
        adminId
      ]);
      
      console.log(`✅ Created lesson: ${lesson.title}`);
    }
    
    console.log('🎉 Seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding lessons:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedLessons();
