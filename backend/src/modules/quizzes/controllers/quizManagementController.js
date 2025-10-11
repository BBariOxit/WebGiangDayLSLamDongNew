import Joi from 'joi';
import { 
  createQuizSvc,
  updateQuizSvc,
  deleteQuizSvc,
  listQuizzesSvc,
  getQuizDetailSvc
} from '../services/quizManagementService.js';
import { ok, created, fail, notFound, forbidden } from '../../../utils/response.js';

const createQuizSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().allow('', null),
  lessonId: Joi.number().integer().allow(null),
  difficulty: Joi.string().allow('', null),
  timeLimit: Joi.number().integer().min(1).allow(null),
  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string().required(),
      options: Joi.array().items(Joi.string().min(1)).min(2),
      correctIndex: Joi.number().integer().min(0),
      // Back-compat: allow answers[]
      answers: Joi.array().items(
        Joi.object({ answerText: Joi.string().required(), isCorrect: Joi.boolean().required() })
      )
    })
  ).min(1).required()
});

export async function createQuiz(req, res) {
  try {
    const { error, value } = createQuizSchema.validate(req.body);
    if (error) return fail(res, 400, error.message);
    const quiz = await createQuizSvc(value, req.user);
    created(res, quiz);
  } catch (e) {
    if (e.message === 'Forbidden') return forbidden(res);
    fail(res, 400, e.message);
  }
}

export async function updateQuiz(req, res) {
  try {
    const { error, value } = createQuizSchema.validate(req.body);
    if (error) return fail(res, 400, error.message);
    const quizId = parseInt(req.params.id, 10);
    const quiz = await updateQuizSvc(quizId, value, req.user);
    ok(res, quiz);
  } catch (e) {
    if (e.message === 'Forbidden') return forbidden(res);
    if (e.message === 'Not found') return notFound(res);
    fail(res, 400, e.message);
  }
}

export async function deleteQuiz(req, res) {
  try {
    const quizId = parseInt(req.params.id, 10);
    const result = await deleteQuizSvc(quizId, req.user);
    ok(res, result);
  } catch (e) {
    if (e.message === 'Forbidden') return forbidden(res);
    if (e.message === 'Not found') return notFound(res);
    fail(res, 400, e.message);
  }
}

export async function listQuizzes(req, res) {
  try {
    const params = {
      createdBy: req.query.createdBy ? parseInt(req.query.createdBy, 10) : null,
      lessonId: req.query.lessonId ? parseInt(req.query.lessonId, 10) : null,
      standalone: req.query.standalone === '1'
    };
    const quizzes = await listQuizzesSvc(params, req.user);
    ok(res, quizzes);
  } catch (e) {
    fail(res, 400, e.message);
  }
}

export async function getQuizDetail(req, res) {
  try {
    const quizId = parseInt(req.params.id, 10);
    const quiz = await getQuizDetailSvc(quizId, req.user);
    ok(res, quiz);
  } catch (e) {
    if (e.message === 'Not found') return notFound(res);
    fail(res, 400, e.message);
  }
}
