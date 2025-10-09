import { query } from '../../../config/pool.js';

export async function createLesson({ 
  title, slug, contentHtml, summary, createdBy, isPublished,
  instructor, duration, difficulty, category, tags, images 
}) {
  const sql = `
    INSERT INTO lessons (
      title, slug, summary, content_html, created_by, is_published,
      instructor, duration, difficulty, category, tags, images
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;
  const params = [
    title, 
    slug, 
    summary || null, 
    contentHtml || null, 
    createdBy, 
    !!isPublished,
    instructor || null,
    duration || null,
    difficulty || 'Cơ bản',
    category || null,
    tags || [],
    JSON.stringify(images || [])
  ];
  const r = await query(sql, params);
  return r.rows[0];
}

export async function getLessonById(id) {
  const r = await query('SELECT * FROM lessons WHERE lesson_id=$1', [id]);
  return r.rows[0] || null;
}

export async function getLessonBySlug(slug) {
  const r = await query('SELECT * FROM lessons WHERE slug=$1', [slug]);
  return r.rows[0] || null;
}

export async function listLessons({ q, publishedOnly, limit = 20, offset = 0 }) {
  const clauses = [];
  const params = [];
  let idx = 1;
  if (q) { clauses.push(`(title ILIKE $${idx} OR summary ILIKE $${idx})`); params.push(`%${q}%`); idx++; }
  if (publishedOnly) { clauses.push(`is_published = true`); }
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  const sql = `SELECT * FROM lessons ${where} ORDER BY lesson_id DESC LIMIT $${idx} OFFSET $${idx + 1}`;
  params.push(limit, offset);
  const r = await query(sql, params);
  return r.rows;
}

export async function updateLesson(id, data) {
  const { title, contentHtml, summary, isPublished, instructor, duration, difficulty, category, tags, images } = data;
  
  // Build dynamic update
  const sets = [];
  const params = [];
  let idx = 1;
  
  if (title !== undefined) { sets.push(`title = $${idx++}`); params.push(title); }
  if (summary !== undefined) { sets.push(`summary = $${idx++}`); params.push(summary); }
  if (contentHtml !== undefined) { sets.push(`content_html = $${idx++}`); params.push(contentHtml); }
  if (typeof isPublished === 'boolean') { sets.push(`is_published = $${idx++}`); params.push(!!isPublished); }
  if (instructor !== undefined) { sets.push(`instructor = $${idx++}`); params.push(instructor); }
  if (duration !== undefined) { sets.push(`duration = $${idx++}`); params.push(duration); }
  if (difficulty !== undefined) { sets.push(`difficulty = $${idx++}`); params.push(difficulty); }
  if (category !== undefined) { sets.push(`category = $${idx++}`); params.push(category); }
  if (tags !== undefined) { sets.push(`tags = $${idx++}`); params.push(tags); }
  if (images !== undefined) { sets.push(`images = $${idx++}`); params.push(JSON.stringify(images)); }
  
  sets.push(`updated_at = NOW()`);
  
  const sql = `UPDATE lessons SET ${sets.join(', ')} WHERE lesson_id = $${idx} RETURNING *`;
  params.push(id);
  const r = await query(sql, params);
  return r.rows[0] || null;
}

export async function deleteLesson(id) {
  await query('DELETE FROM lessons WHERE lesson_id=$1', [id]);
  return true;
}