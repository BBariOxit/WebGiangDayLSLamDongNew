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

const QUIZ_BANK = [
  {
    slug: 'lang-biang-lich-su-hinh-thanh',
    meta: {
      title: 'Quiz: Lang Biang – nền bản địa',
      description: 'Củng cố kiến thức về vai trò nền tảng văn hóa – sinh thái của Lang Biang',
      difficulty: 'Cơ bản',
      time_limit: 10
    },
    questions: [
      {
        q: 'Nhóm cộng đồng bản địa nào định cư lâu đời tại vùng Lang Biang?',
        options: ['K\'Ho – Lạch – Chil', 'Mường – Thái', 'Chăm – Khmer', 'Tày – Nùng'],
        correct: 0,
        exp: 'Cư dân K\'Ho – Lạch – Chil gắn bó lâu đời với không gian Lang Biang.'
      },
      {
        q: 'Yếu tố tự nhiên giúp Lang Biang thích hợp cho cư trú sớm?',
        options: ['Núi lửa hoạt động', 'Nguồn nước đầu nguồn & vi khí hậu mát', 'Sa mạc khô', 'Đồng bằng ven biển'],
        correct: 1
      },
      {
        q: 'Truyền thuyết Lang – Biang phản ánh chủ yếu nội dung gì?',
        options: ['Chiến tranh biển đảo', 'Xung đột – hoà giải – liên kết nhóm tộc', 'Thương mại đường biển', 'Nông nghiệp lúa nước'],
        correct: 1
      },
      {
        q: 'Một giá trị “nền gốc” Lang Biang để lại cho giai đoạn sau?',
        options: ['Mạng lưới cảng biển', 'Tri thức bản địa về thổ nhưỡng, khí hậu', 'Tuyến đường sắt cao tốc', 'Công nghiệp nặng'],
        correct: 1
      },
      {
        q: 'Vì sao Lang Biang được xem là lớp gốc văn hóa – sinh thái?',
        options: ['Vì có nhiều sa mạc', 'Do vị trí trung gian, tài nguyên nước và thảm thực vật', 'Vì có mỏ dầu khí', 'Vì là trung tâm công nghiệp nặng'],
        correct: 1
      }
    ]
  },
  {
    slug: 'djiring-di-linh-cua-ngo-khai-pha',
    meta: { title: 'Quiz: Djiring (Di Linh)', description: 'Cửa ngõ khai phá thuộc địa – vai trò trung chuyển', difficulty: 'Cơ bản', time_limit: 8 },
    questions: [
      { q: 'Tuyến khảo sát có Djiring làm trạm trung chuyển?', options: ['Huế – Đà Nẵng – Đà Lạt', 'Phan Rang – Djiring – Lang Biang', 'Sài Gòn – Cần Thơ – Đà Lạt', 'Nha Trang – Buôn Ma Thuột'], correct: 1 },
      { q: 'Chức năng nào KHÔNG thuộc Djiring giai đoạn 1900–1930?', options: ['Hậu cần', 'Kiểm soát địa bàn', 'Đóng cửa giao thông', 'Mở đường lên Đà Lạt'], correct: 2 },
      { q: 'Di sản hạ tầng của thời kỳ khai phá còn lại ảnh hưởng gì?', options: ['Không ảnh hưởng', 'Định hướng phát triển vùng trung tâm tỉnh', 'Chỉ ảnh hưởng đến đánh bắt cá', 'Thay đổi đường biển'], correct: 1 }
    ]
  },
  {
    slug: 'da-lat-trung-tam-khi-hau-hanh-chinh',
    meta: { title: 'Quiz: Đà Lạt', description: 'Trung tâm khí hậu – hành chính – giáo dục', difficulty: 'Trung bình', time_limit: 12 },
    questions: [
      { q: 'Giai đoạn nào Đà Lạt định hình là đô thị nghỉ dưỡng thuộc địa?', options: ['1920–1945', '1975–1990', '1990–2005', '2005–2020'], correct: 0 },
      { q: 'Một công trình giáo dục tiêu biểu thời Pháp tại Đà Lạt?', options: ['Lycée Yersin', 'Đại học Bách khoa HN', 'Lycée Huỳnh Thúc Kháng', 'Trường Quốc học Huế'], correct: 0 },
      { q: 'Định hướng hiện đại của Đà Lạt hiện nay?', options: ['Công nghiệp nặng', 'Nông nghiệp công nghệ cao & giáo dục', 'Đánh bắt xa bờ', 'Khai thác than'], correct: 1 }
    ]
  },
  {
    slug: 'lien-khuong-ha-tang-ket-noi',
    meta: { title: 'Quiz: Liên Khương', description: 'Hạ tầng kết nối chiến lược', difficulty: 'Cơ bản', time_limit: 8 },
    questions: [
      { q: 'Liên Khương là cửa ngõ gì của cao nguyên?', options: ['Hàng không', 'Hàng hải', 'Đường sắt', 'Đường thuỷ nội địa'], correct: 0 },
      { q: 'Nâng cấp nào diễn ra từ những năm 2000s?', options: ['Đào kênh', 'Kéo dài đường băng', 'Đắp đập thuỷ điện', 'Mở mỏ than'], correct: 1 }
    ]
  },
  {
    slug: 'bao-loc-truc-nong-cong-nghiep',
    meta: { title: 'Quiz: Bảo Lộc', description: 'Trục nông – công nghiệp chế biến', difficulty: 'Trung bình', time_limit: 10 },
    questions: [
      { q: 'Ngành nào KHÔNG thuộc chuỗi chế biến đặc trưng Bảo Lộc?', options: ['Chè', 'Cà phê', 'Tơ tằm', 'Luyện thép'], correct: 3 },
      { q: 'Một vai trò chiến lược của Bảo Lộc trong cơ cấu tỉnh?', options: ['Giảm áp lực dân cư Đà Lạt', 'Xóa bỏ giao thông', 'Thay thế Đà Lạt', 'Đóng cửa sân bay'], correct: 0 },
      { q: 'Giai đoạn nào hình thành mạnh mẽ đồn điền chè?', options: ['1950–1975', '1975–1985', '1990–2000', '2005–2015'], correct: 0 }
    ]
  }
];

async function findAdminUser(client) {
  const r = await client.query(`SELECT user_id FROM users WHERE email='admin@lamdong.edu.vn' OR role_id=1 ORDER BY user_id LIMIT 1`);
  return r.rows[0]?.user_id || null;
}

async function getLessonIdBySlug(client, slug) {
  const r = await client.query(`SELECT lesson_id FROM lessons WHERE slug=$1 LIMIT 1`, [slug]);
  return r.rows[0]?.lesson_id || null;
}

async function upsertQuizForLesson(client, lessonId, createdBy, meta, questions) {
  // Remove existing quizzes for this lesson
  await client.query(`DELETE FROM quiz_questions WHERE quiz_id IN (SELECT quiz_id FROM quizzes WHERE lesson_id=$1)`, [lessonId]);
  await client.query(`DELETE FROM quizzes WHERE lesson_id=$1`, [lessonId]);

  const qz = await client.query(`
    INSERT INTO quizzes (lesson_id, title, description, difficulty, time_limit, created_by)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING quiz_id
  `, [lessonId, meta.title, meta.description || null, meta.difficulty || null, meta.time_limit || null, createdBy || null]);
  const quizId = qz.rows[0].quiz_id;

  let pos = 1;
  for (const q of questions) {
    await client.query(`
      INSERT INTO quiz_questions (quiz_id, question_text, options, correct_index, explanation, position, points)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `, [quizId, q.q, q.options, q.correct, q.exp || null, pos++, 1]);
  }
}

async function main() {
  const client = await pool.connect();
  try {
    console.log('📚 Seeding realistic quizzes...');
    await client.query('BEGIN');
    const adminId = await findAdminUser(client);

    for (const item of QUIZ_BANK) {
      const lessonId = await getLessonIdBySlug(client, item.slug);
      if (!lessonId) {
        console.warn('⚠️  Lesson not found for slug:', item.slug);
        continue;
      }
      await upsertQuizForLesson(client, lessonId, adminId, item.meta, item.questions);
      console.log('✅ Seeded quiz for lesson', item.slug);
    }

    await client.query('COMMIT');
    console.log('🎉 Quiz seed completed.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Quiz seed failed:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
