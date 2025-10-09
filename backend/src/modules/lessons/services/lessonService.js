import slugify from 'slugify';
import { createLesson, getLessonBySlug, getLessonById, listLessons, updateLesson, deleteLesson } from '../repositories/lessonRepo.js';

function ensureCanEdit(user) {
  if (!user) throw new Error('Unauthorized');
  const role = (user.roleName || user.role || '').toLowerCase();
  if (!['admin','teacher'].includes(role)) throw new Error('Forbidden');
}

export async function createLessonSvc(data, user) {
  ensureCanEdit(user);
  const { title, summary, contentHtml, isPublished, instructor, duration, difficulty, category, tags, images } = data;
  
  let baseSlug = slugify(title, { lower: true, strict: true });
  if (!baseSlug) baseSlug = 'lesson';
  let slug = baseSlug;
  let i = 1;
  while (await getLessonBySlug(slug)) {
    slug = `${baseSlug}-${i++}`;
  }
  
  const lesson = await createLesson({ 
    title, 
    slug, 
    contentHtml, 
    summary, 
    createdBy: user.id, 
    isPublished,
    instructor,
    duration,
    difficulty,
    category,
    tags,
    images
  });
  return lesson;
}

export async function listLessonsSvc(params) {
  return listLessons(params);
}

export async function getLessonSvc(id) {
  const l = await getLessonById(id);
  if (!l) throw new Error('Not found');
  return l;
}

export async function getLessonBySlugSvc(slug) {
  const l = await getLessonBySlug(slug);
  if (!l) throw new Error('Not found');
  return l;
}

export async function updateLessonSvc(id, data, user) {
  ensureCanEdit(user);
  const existing = await getLessonById(id);
  if (!existing) throw new Error('Not found');
  const createdBy = existing.CreatedBy ?? existing.created_by;
  const role = (user.role || '').toLowerCase();
  if (role !== 'admin' && createdBy !== user.id) throw new Error('Forbidden');
  return updateLesson(id, data);
}

export async function deleteLessonSvc(id, user) {
  ensureCanEdit(user);
  const existing = await getLessonById(id);
  if (!existing) throw new Error('Not found');
  const createdBy = existing.CreatedBy ?? existing.created_by;
  const role = (user.role || '').toLowerCase();
  if (role !== 'admin' && createdBy !== user.id) throw new Error('Forbidden');
  await deleteLesson(id);
  return { success: true };
}