import Joi from 'joi';
import { createLessonSvc, listLessonsSvc, getLessonSvc, getLessonBySlugSvc, updateLessonSvc, deleteLessonSvc } from '../services/lessonService.js';
import { ok, created, fail, notFound, forbidden } from '../../../utils/response.js';

const createSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  summary: Joi.string().allow('', null),
  contentHtml: Joi.string().allow('', null),
  isPublished: Joi.boolean().default(false),
  instructor: Joi.string().max(150).allow('', null),
  duration: Joi.string().max(50).allow('', null),
  difficulty: Joi.string().valid('Cơ bản', 'Trung bình', 'Nâng cao').default('Cơ bản'),
  category: Joi.string().max(100).allow('', null),
  tags: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.object({
    url: Joi.string().required(),
    caption: Joi.string().allow('', null)
  })).default([]),
  sections: Joi.array().items(Joi.object({
    type: Joi.string().valid('heading','text','image_gallery','video','embed','divider').default('text'),
    title: Joi.string().allow('', null),
    contentHtml: Joi.string().allow('', null),
    data: Joi.object().default({}),
    orderIndex: Joi.number().integer().min(0)
  }).unknown(true)).default([])
});

export async function createLesson(req, res) {
  try {
    const { error, value } = createSchema.validate(req.body, { stripUnknown: true });
    if (error) return fail(res, 400, error.message);
    const lesson = await createLessonSvc(value, req.user);
    created(res, lesson);
  } catch (e) {
    if (e.message === 'Forbidden') return forbidden(res);
    fail(res, 400, e.message);
  }
}

export async function listLessons(req, res) {
  try {
    const lessons = await listLessonsSvc({ q: req.query.q, publishedOnly: req.query.published === '1', limit: 50 });
    ok(res, lessons);
  } catch (e) { fail(res, 400, e.message); }
}

export async function getLesson(req, res) {
  try {
    const lesson = await getLessonSvc(parseInt(req.params.id, 10));
    ok(res, lesson);
  } catch (e) { notFound(res, e.message); }
}

export async function getLessonBySlug(req, res) {
  try {
    const lesson = await getLessonBySlugSvc(req.params.slug);
    ok(res, lesson);
  } catch (e) { notFound(res, e.message); }
}

export async function updateLesson(req, res) {
  try {
    // allow optional validation of sections shape similar to create
    const updateSchema = createSchema.fork(Object.keys(createSchema.describe().keys), (s)=> s.optional());
    const { error, value } = updateSchema.validate(req.body, { stripUnknown: true });
    if (error) return fail(res, 400, error.message);
    const lesson = await updateLessonSvc(parseInt(req.params.id, 10), value, req.user);
    ok(res, lesson);
  } catch (e) {
    if (e.message === 'Forbidden') return forbidden(res);
    if (e.message === 'Not found') return notFound(res);
    fail(res, 400, e.message);
  }
}

export async function deleteLesson(req, res) {
  try {
    const out = await deleteLessonSvc(parseInt(req.params.id, 10), req.user);
    ok(res, out);
  } catch (e) {
    if (e.message === 'Forbidden') return forbidden(res);
    if (e.message === 'Not found') return notFound(res);
    fail(res, 400, e.message);
  }
}