import slugify from 'slugify';
import { createLesson, getLessonBySlug, getLessonById, listLessons, updateLesson, deleteLesson, replaceLessonSections } from '../repositories/lessonRepo.js';
import { publishNewLessonNotification } from '../../notifications/services/notificationsService.js';

function ensureCanEdit(user) {
  if (!user) throw new Error('Unauthorized');
  const role = (user.roleName || user.role || '').toLowerCase();
  if (!['admin','teacher'].includes(role)) throw new Error('Forbidden');
}

export async function createLessonSvc(data, user) {
  ensureCanEdit(user);
  const { title, summary, contentHtml, isPublished, instructor, duration, difficulty, category, tags, images, sections } = data;
  
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
  // Insert sections if provided
  try {
    if (Array.isArray(sections) && sections.length) {
      await replaceLessonSections(lesson.lesson_id, sections);
      const refreshed = await getLessonById(lesson.lesson_id);
      // If published on create, publish notification
      if (isPublished) { try { await publishNewLessonNotification(refreshed || lesson); } catch {} }
      return refreshed || lesson;
    }
  } catch (e) {
    // If sections fail to persist, still return the created lesson
  }
  if (isPublished) { try { await publishNewLessonNotification(lesson); } catch {} }
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
  // Ensure section objects do not carry DB-only keys when passed through
  if (Array.isArray(data.sections)) {
    data.sections = data.sections.map((s, i) => ({
      type: s.type,
      title: s.title ?? null,
      contentHtml: s.contentHtml ?? s.content_html ?? null,
      data: s.data ?? {},
      orderIndex: Number(s.orderIndex ?? i)
    }));
  }
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