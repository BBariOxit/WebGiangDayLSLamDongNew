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
  const lesson = r.rows[0] || null;
  if (!lesson) return null;
  // load sections ordered
  try {
    const rs = await query('SELECT * FROM lesson_sections WHERE lesson_id=$1 ORDER BY order_index ASC, section_id ASC', [id]);
    lesson.sections = rs.rows || [];
    // If we have legacy rich HTML content but only a few/placeholder sections, expose the full HTML as a first text section
    if (lesson.content_html && lesson.sections && lesson.sections.length > 0) {
      const html = String(lesson.content_html || '').trim();
      if (html.length > 50) {
        const hasLegacy = lesson.sections.some(s => (s.content_html || s.contentHtml || '').includes('<div class="lesson-content"'));
        if (!hasLegacy) {
          lesson.sections = [
            { type: 'text', title: null, content_html: lesson.content_html, data: {}, order_index: 0 },
            ...lesson.sections
          ];
        }
      }
    }
  } catch (e) {
    // sections table might not exist yet; ignore
  }
  return lesson;
}

export async function getLessonBySlug(slug) {
  const r = await query('SELECT * FROM lessons WHERE slug=$1', [slug]);
  const lesson = r.rows[0] || null;
  if (!lesson) return null;
  try {
    const rs = await query('SELECT * FROM lesson_sections WHERE lesson_id=$1 ORDER BY order_index ASC, section_id ASC', [lesson.lesson_id]);
    lesson.sections = rs.rows || [];
    if (lesson.content_html && lesson.sections && lesson.sections.length > 0) {
      const html = String(lesson.content_html || '').trim();
      if (html.length > 50) {
        const hasLegacy = lesson.sections.some(s => (s.content_html || s.contentHtml || '').includes('<div class="lesson-content"'));
        if (!hasLegacy) {
          lesson.sections = [
            { type: 'text', title: null, content_html: lesson.content_html, data: {}, order_index: 0 },
            ...lesson.sections
          ];
        }
      }
    }
  } catch (e) {}
  return lesson;
}

export async function listLessons({ q, publishedOnly, limit = 20, offset = 0 }) {
  const clauses = [];
  const params = [];
  let idx = 1;
  if (q) { clauses.push(`(title ILIKE $${idx} OR summary ILIKE $${idx})`); params.push(`%${q}%`); idx++; }
  if (publishedOnly) { clauses.push(`is_published = true`); }
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  // Include rating summary (avg_rating, rating_count) via materialized view when available
  const ratingSubquery = `
    SELECT lesson_id,
           ROUND(AVG(rating)::numeric, 1) AS avg_rating,
           COUNT(rating) AS rating_count
    FROM lesson_comments
    WHERE rating IS NOT NULL
    GROUP BY lesson_id
  `;
  const sql = `
    SELECT 
      l.*,
      CASE 
        WHEN COALESCE(rs.rating_count, 0) = 0 THEN 5::numeric(4,2)
        ELSE COALESCE(rs.avg_rating, 5)::numeric(4,2)
      END AS avg_rating,
      COALESCE(rs.rating_count, 0) AS rating_count
    FROM lessons l
    LEFT JOIN (${ratingSubquery}) rs ON rs.lesson_id = l.lesson_id
    ${where ? where.replace(/^WHERE /, 'WHERE ') : ''}
    ORDER BY l.lesson_id DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  params.push(limit, offset);
  const r = await query(sql, params);
  return r.rows;
}

export async function updateLesson(id, data) {
  const { title, contentHtml, summary, isPublished, instructor, duration, difficulty, category, tags, images, sections } = data;
  
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
  const updated = r.rows[0] || null;
  if (!updated) return null;
  // If sections provided, replace atomically using a transaction
  if (Array.isArray(sections)) {
    await upsertLessonSections(id, sections);
  }
  // attach sections for convenience
  try {
    const rs = await query('SELECT * FROM lesson_sections WHERE lesson_id=$1 ORDER BY order_index ASC, section_id ASC', [id]);
    updated.sections = rs.rows || [];
  } catch (e) {}
  return updated;
}

export async function deleteLesson(id) {
  await query('DELETE FROM lessons WHERE lesson_id=$1', [id]);
  return true;
}

export async function incrementStudySessions(lessonId) {
  const r = await query(`
    UPDATE lessons
    SET study_sessions_count = COALESCE(study_sessions_count, 0) + 1,
        updated_at = NOW()
    WHERE lesson_id = $1
    RETURNING lesson_id, study_sessions_count
  `, [lessonId]);
  return r.rows[0] || null;
}

// Sections helpers
export async function replaceLessonSections(lessonId, sections) {
  // simple replace inside a transaction
  const clientRes = await query('BEGIN');
  try {
    await query('DELETE FROM lesson_sections WHERE lesson_id=$1', [lessonId]);
    for (let i = 0; i < sections.length; i++) {
      const raw = sections[i] || {};
      const s = {
        type: raw.type || 'text',
        title: raw.title || null,
        contentHtml: raw.contentHtml !== undefined ? raw.contentHtml : raw.content_html,
        data: raw.data || {},
        orderIndex: Number(raw.orderIndex ?? i)
      };
      await query(
        `INSERT INTO lesson_sections(lesson_id, type, title, content_html, data, order_index)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [lessonId, s.type || 'text', s.title || null, s.contentHtml || null, JSON.stringify(s.data || {}), Number(s.orderIndex ?? i)]
      );
    }
    await query('COMMIT');
  } catch (e) {
    await query('ROLLBACK');
    throw e;
  }
}

async function upsertLessonSections(lessonId, sections) {
  // if no sections length -> clear all
  if (!Array.isArray(sections) || sections.length === 0) {
    await query('DELETE FROM lesson_sections WHERE lesson_id=$1', [lessonId]);
    return;
  }
  await replaceLessonSections(lessonId, sections);
}
