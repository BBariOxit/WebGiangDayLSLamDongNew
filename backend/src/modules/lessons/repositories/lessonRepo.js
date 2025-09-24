import { getPool, sql } from '../../../config/pool.js';

export async function createLesson({ title, slug, contentHtml, summary, createdBy, isPublished }) {
  const pool = await getPool();
  const r = await pool.request()
    .input('Title', sql.NVarChar(255), title)
    .input('Slug', sql.VarChar(255), slug)
    .input('Summary', sql.NVarChar(500), summary || null)
    .input('ContentHtml', sql.NVarChar(sql.MAX), contentHtml || null)
    .input('CreatedBy', sql.Int, createdBy)
    .input('IsPublished', sql.Bit, isPublished ? 1 : 0)
    .query(`INSERT INTO Lessons(Title, Slug, Summary, ContentHtml, CreatedBy, IsPublished)
            OUTPUT INSERTED.*
            VALUES(@Title,@Slug,@Summary,@ContentHtml,@CreatedBy,@IsPublished)`);
  return r.recordset[0];
}

export async function getLessonById(id) {
  const pool = await getPool();
  const r = await pool.request().input('Id', sql.Int, id)
    .query('SELECT * FROM Lessons WHERE LessonId=@Id');
  return r.recordset[0] || null;
}

export async function getLessonBySlug(slug) {
  const pool = await getPool();
  const r = await pool.request().input('Slug', sql.VarChar(255), slug)
    .query('SELECT * FROM Lessons WHERE Slug=@Slug');
  return r.recordset[0] || null;
}

export async function listLessons({ q, publishedOnly, limit = 20, offset = 0 }) {
  const pool = await getPool();
  let where = '1=1';
  const req = pool.request()
    .input('Limit', sql.Int, limit)
    .input('Offset', sql.Int, offset);
  if (q) {
    where += ' AND (Title LIKE @Q OR Summary LIKE @Q)';
    req.input('Q', sql.NVarChar(260), `%${q}%`);
  }
  if (publishedOnly) where += ' AND IsPublished=1';
  const r = await req.query(`SELECT * FROM Lessons WHERE ${where} ORDER BY LessonId DESC OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY`);
  return r.recordset;
}

export async function updateLesson(id, { title, contentHtml, summary, isPublished }) {
  const pool = await getPool();
  const r = await pool.request()
    .input('Id', sql.Int, id)
    .input('Title', sql.NVarChar(255), title)
    .input('Summary', sql.NVarChar(500), summary || null)
    .input('ContentHtml', sql.NVarChar(sql.MAX), contentHtml || null)
    .input('IsPublished', sql.Bit, typeof isPublished === 'boolean' ? (isPublished ? 1 : 0) : null)
    .query(`UPDATE Lessons SET
              Title=@Title,
              Summary=@Summary,
              ContentHtml=@ContentHtml,
              IsPublished=COALESCE(@IsPublished, IsPublished),
              UpdatedAt=SYSUTCDATETIME()
            OUTPUT INSERTED.*
            WHERE LessonId=@Id`);
  return r.recordset[0] || null;
}

export async function deleteLesson(id) {
  const pool = await getPool();
  await pool.request().input('Id', sql.Int, id)
    .query('DELETE FROM Lessons WHERE LessonId=@Id');
  return true;
}