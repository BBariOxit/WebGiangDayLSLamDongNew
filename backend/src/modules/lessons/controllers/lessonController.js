import Joi from 'joi';
import { createLessonSvc, listLessonsSvc, getLessonSvc, updateLessonSvc, deleteLessonSvc } from '../services/lessonService.js';

const createSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  summary: Joi.string().allow('', null),
  contentHtml: Joi.string().allow('', null),
  isPublished: Joi.boolean().default(false)
});

export async function createLesson(req, res) {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const lesson = await createLessonSvc(value, req.user);
    res.status(201).json(lesson);
  } catch (e) {
    res.status(e.message === 'Forbidden' ? 403 : 400).json({ error: e.message });
  }
}

export async function listLessons(req, res) {
  try {
    const lessons = await listLessonsSvc({ q: req.query.q, publishedOnly: req.query.published === '1', limit: 50 });
    res.json(lessons);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function getLesson(req, res) {
  try {
    const lesson = await getLessonSvc(parseInt(req.params.id, 10));
    res.json(lesson);
  } catch (e) { res.status(404).json({ error: e.message }); }
}

export async function updateLesson(req, res) {
  try {
    const lesson = await updateLessonSvc(parseInt(req.params.id, 10), req.body, req.user);
    res.json(lesson);
  } catch (e) { res.status(e.message === 'Forbidden' ? 403 : (e.message === 'Not found' ? 404 : 400)).json({ error: e.message }); }
}

export async function deleteLesson(req, res) {
  try {
    const out = await deleteLessonSvc(parseInt(req.params.id, 10), req.user);
    res.json(out);
  } catch (e) { res.status(e.message === 'Forbidden' ? 403 : (e.message === 'Not found' ? 404 : 400)).json({ error: e.message }); }
}