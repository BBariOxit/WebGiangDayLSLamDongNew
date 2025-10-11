import Joi from 'joi';
import { ok, fail } from '../../../utils/response.js';
import { addCommentSvc, listCommentsSvc, deleteCommentSvc, saveProgressSvc, getProgressSvc, getRatingSummarySvc, getQuizBundleSvc, submitQuizAttemptSvc, listAttemptsSvc, addBookmarkSvc, removeBookmarkSvc, listBookmarksSvc } from '../services/lessonEngagementService.js';

const commentSchema = Joi.object({ content: Joi.string().min(1).required(), rating: Joi.number().integer().min(1).max(5).optional() });
const progressSchema = Joi.object({ progress: Joi.number().integer().min(0).max(100).required() });
const quizAttemptSchema = Joi.object({ score: Joi.number().integer().min(0).max(100).required(), durationSeconds: Joi.number().integer().min(0).optional(), answers: Joi.array().items(Joi.object({ questionId: Joi.number().required(), selectedIndexes: Joi.array().items(Joi.number()).default([]) })).default([]) });

export async function listCommentsCtrl(req, res){ try { ok(res, await listCommentsSvc(parseInt(req.params.lessonId,10))); } catch(e){ fail(res,400,e.message);} }
export async function createCommentCtrl(req,res){ try { const {error,value}=commentSchema.validate(req.body); if(error) return fail(res,400,error.message); ok(res, await addCommentSvc(parseInt(req.params.lessonId,10), req.user, value)); } catch(e){ fail(res,400,e.message);} }
export async function deleteCommentCtrl(req,res){ try { ok(res, await deleteCommentSvc(parseInt(req.params.commentId,10), req.user)); } catch(e){ fail(res,400,e.message);} }
export async function saveProgressCtrl(req,res){ try { const {error,value}=progressSchema.validate(req.body); if(error) return fail(res,400,error.message); ok(res, await saveProgressSvc(parseInt(req.params.lessonId,10), req.user, value)); } catch(e){ fail(res,400,e.message);} }
export async function getProgressCtrl(req,res){ try { ok(res, await getProgressSvc(parseInt(req.params.lessonId,10), req.user)); } catch(e){ fail(res,400,e.message);} }
export async function ratingSummaryCtrl(req,res){ try { ok(res, await getRatingSummarySvc(parseInt(req.params.lessonId,10))); } catch(e){ fail(res,400,e.message);} }
export async function quizBundleCtrl(req,res){ try { ok(res, await getQuizBundleSvc(parseInt(req.params.lessonId,10))); } catch(e){ fail(res,400,e.message);} }
export async function submitQuizAttemptCtrl(req,res){ try { const {error,value}=quizAttemptSchema.validate(req.body); if(error) return fail(res,400,error.message); ok(res, await submitQuizAttemptSvc(parseInt(req.params.quizId,10), req.user, value)); } catch(e){ fail(res,400,e.message);} }
export async function listAttemptsCtrl(req,res){ try { ok(res, await listAttemptsSvc(parseInt(req.params.quizId,10), req.user)); } catch(e){ fail(res,400,e.message);} }

// BOOKMARKS
export async function addBookmarkCtrl(req,res){ try { ok(res, await addBookmarkSvc(parseInt(req.params.lessonId,10), req.user)); } catch(e){ fail(res,400,e.message);} }
export async function removeBookmarkCtrl(req,res){ try { ok(res, await removeBookmarkSvc(parseInt(req.params.lessonId,10), req.user)); } catch(e){ fail(res,400,e.message);} }
export async function listBookmarksCtrl(req,res){ try { ok(res, await listBookmarksSvc(req.user)); } catch(e){ fail(res,401,e.message);} }
