import Joi from 'joi';
import { 
  getQuizByLessonSvc, 
  submitAttemptSvc, 
  getUserAttemptsSvc 
} from '../services/quizService.js';
import { ok, fail, notFound } from '../../../utils/response.js';

export async function getQuiz(req, res) {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const quiz = await getQuizByLessonSvc(lessonId);
    ok(res, quiz);
  } catch (e) {
    notFound(res, e.message);
  }
}

const submitSchema = Joi.object({
  answers: Joi.array().items(
    Joi.object({
      questionId: Joi.number().integer().required(),
      selectedAnswers: Joi.array().items(Joi.number().integer()).min(1).required()
    })
  ).min(1).required()
});

export async function submitQuizAttempt(req, res) {
  try {
    const { error, value } = submitSchema.validate(req.body);
    if (error) return fail(res, 400, error.message);
    const lessonId = parseInt(req.params.lessonId, 10);
    const result = await submitAttemptSvc(lessonId, req.user.id, value.answers);
    ok(res, result);
  } catch (e) {
    fail(res, 400, e.message);
  }
}

export async function getUserAttempts(req, res) {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    const attempts = await getUserAttemptsSvc(lessonId, req.user.id);
    ok(res, attempts);
  } catch (e) {
    fail(res, 400, e.message);
  }
}
