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

const SECTION_BANK = [
  {
    slug: 'lang-biang-lich-su-hinh-thanh',
    sections: [
      { type: 'heading', title: 'Lang Biang – nền văn hóa bản địa' },
      { type: 'text', title: 'Bối cảnh tự nhiên', content_html: '<ul><li>Vi khí hậu mát, nguồn nước đầu nguồn dồi dào.</li><li>Thảm thực vật phong phú tạo điều kiện sinh kế.</li><li>Vị trí trung gian giữa duyên hải – cao nguyên.</li></ul>' },
      { type: 'text', title: 'Cộng đồng cư trú', content_html: '<p>K\'Ho – Lạch – Chil định cư lâu đời, hình thành tri thức bản địa về thổ nhưỡng – khí hậu – tài nguyên.</p>' },
      { type: 'image_gallery', title: 'Hình ảnh', data: { images: [ { url: 'https://picsum.photos/seed/langbiang-mountain/1200/800', caption: 'Phong cảnh Lang Biang' } ] } },
      { type: 'divider' }
    ]
  },
  {
    slug: 'bao-loc-truc-nong-cong-nghiep',
    sections: [
      { type: 'heading', title: 'Bảo Lộc – trục nông sản chế biến' },
      { type: 'text', title: 'Chuỗi giá trị', content_html: '<ul><li>Chè chất lượng cao.</li><li>Cà phê đặc sản.</li><li>Tơ tằm – lụa.</li></ul>' },
      { type: 'text', title: 'Vai trò vùng', content_html: '<p>Cân bằng cực phát triển phía Nam tỉnh, giảm áp lực đô thị Đà Lạt.</p>' },
      { type: 'image_gallery', title: 'Hình ảnh', data: { images: [ { url: 'https://picsum.photos/seed/baoloc-tea/1200/800', caption: 'Đồi chè Bảo Lộc' } ] } }
    ]
  }
];

async function getLessonIdBySlug(client, slug) {
  const r = await client.query(`SELECT lesson_id FROM lessons WHERE slug=$1 LIMIT 1`, [slug]);
  return r.rows[0]?.lesson_id || null;
}

async function seedSections(client, lessonId, sections) {
  await client.query('DELETE FROM lesson_sections WHERE lesson_id=$1', [lessonId]);
  let order = 1;
  for (const s of sections) {
    await client.query(`
      INSERT INTO lesson_sections (lesson_id, type, title, content_html, data, order_index)
      VALUES ($1,$2,$3,$4,$5,$6)
    `, [lessonId, s.type, s.title || null, s.content_html || null, s.data ? JSON.stringify(s.data) : '{}', order++]);
  }
}

async function main() {
  const client = await pool.connect();
  try {
    console.log('📚 Seeding lesson sections...');
    await client.query('BEGIN');
    for (const item of SECTION_BANK) {
      const lessonId = await getLessonIdBySlug(client, item.slug);
      if (!lessonId) { console.warn('⚠️  Lesson not found:', item.slug); continue; }
      await seedSections(client, lessonId, item.sections);
      console.log('✅ Seeded sections for', item.slug);
    }
    await client.query('COMMIT');
    console.log('🎉 Lesson sections seed completed.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Seed lesson sections failed:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
