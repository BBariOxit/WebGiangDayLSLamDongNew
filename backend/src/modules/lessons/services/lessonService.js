import slugify from 'slugify';
import { createLesson, getLessonBySlug, getLessonById, listLessons, updateLesson, deleteLesson } from '../repositories/lessonRepo.js';

function ensureCanEdit(user) {
  if (!user) throw new Error('Unauthorized');
  if (!['Admin','Teacher'].includes(user.roleName || user.role)) throw new Error('Forbidden');
}

export async function createLessonSvc({ title, summary, contentHtml, isPublished }, user) {
  ensureCanEdit(user);
  let baseSlug = slugify(title, { lower: true, strict: true });
  if (!baseSlug) baseSlug = 'lesson';
  let slug = baseSlug;
  let i = 1;
  while (await getLessonBySlug(slug)) {
    slug = `${baseSlug}-${i++}`;
  }
  const lesson = await createLesson({ title, slug, contentHtml, summary, createdBy: user.id, isPublished });
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

export async function updateLessonSvc(id, data, user) {
  ensureCanEdit(user);
  const existing = await getLessonById(id);
  if (!existing) throw new Error('Not found');
  const createdBy = existing.CreatedBy ?? existing.created_by;
  if (user.role !== 'Admin' && createdBy !== user.id) throw new Error('Forbidden');
  return updateLesson(id, data);
}

export async function deleteLessonSvc(id, user) {
  ensureCanEdit(user);
  const existing = await getLessonById(id);
  if (!existing) throw new Error('Not found');
  const createdBy = existing.CreatedBy ?? existing.created_by;
  if (user.role !== 'Admin' && createdBy !== user.id) throw new Error('Forbidden');
  await deleteLesson(id);
  return { success: true };
}