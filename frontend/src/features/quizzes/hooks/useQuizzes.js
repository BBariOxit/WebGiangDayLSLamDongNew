import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
  fetchQuizzes,
  fetchQuizById,
  fetchQuizByLessonId,
  submitQuizAttempt,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  setCurrentQuiz,
  clearCurrentQuiz,
  setCurrentAttempt,
  clearCurrentAttempt,
  loadUserAttempts,
} from '../quizzesSlice';
import quizService from '@shared/services/quizService';

/**
 * Custom hook for quizzes management
 * Provides all quiz-related functions and state
 */
export const useQuizzes = () => {
  const dispatch = useDispatch();
  const {
    items,
    currentQuiz,
    attempts,
    currentAttempt,
    loading,
    error,
  } = useSelector((state) => state.quizzes);

  const { user } = useSelector((state) => state.auth);

  // Auto-fetch quizzes if not loaded
  useEffect(() => {
    if (items.length === 0 && !loading && !error) {
      dispatch(fetchQuizzes());
    }
  }, [dispatch, items.length, loading, error]);

  // Load user attempts when user changes
  useEffect(() => {
    if (user) {
      dispatch(loadUserAttempts(user.id));
    }
  }, [dispatch, user]);

  // Get quiz by ID
  const getQuizById = async (id) => {
    try {
      await dispatch(fetchQuizById(id)).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // Get quiz by lesson ID
  const getQuizByLessonId = async (lessonId) => {
    try {
      const quiz = await dispatch(fetchQuizByLessonId(lessonId)).unwrap();
      return { success: true, quiz };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // Submit quiz attempt
  const submitAttempt = async (quizId, answers, durationSeconds) => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Calculate score
      const quiz = items.find(q => q.id === quizId) || currentQuiz;
      if (!quiz) {
        return { success: false, error: 'Quiz not found' };
      }

      let correct = 0;
      quiz.questions.forEach((question, index) => {
        if (answers[question.id] === question.correctIndex) {
          correct++;
        }
      });

      const score = Math.round((correct / quiz.questions.length) * 100);

      const attempt = await dispatch(submitQuizAttempt({
        userId: user.id,
        quizId,
        score,
        durationSeconds,
        answers,
      })).unwrap();

      return { success: true, attempt, score };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // Create new quiz (admin/teacher only)
  const createNewQuiz = async (quizData) => {
    if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      const quiz = await dispatch(createQuiz(quizData)).unwrap();
      return { success: true, quiz };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // Update quiz (admin/teacher only)
  const updateExistingQuiz = async (id, data) => {
    if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      const quiz = await dispatch(updateQuiz({ id, data })).unwrap();
      return { success: true, quiz };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // Delete quiz (admin only)
  const deleteExistingQuiz = async (id) => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      await dispatch(deleteQuiz(id)).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // Get quiz statistics
  const getQuizStats = (quizId) => {
    return quizService.getQuizStats(quizId);
  };

  // Get global statistics
  const getGlobalStats = () => {
    return quizService.getGlobalStats();
  };

  // Get user's attempts for a specific quiz
  const getUserQuizAttempts = (quizId) => {
    return attempts.filter(a => a.quizId === quizId);
  };

  // Get user's best score for a quiz
  const getUserBestScore = (quizId) => {
    const quizAttempts = getUserQuizAttempts(quizId);
    if (quizAttempts.length === 0) return null;
    return Math.max(...quizAttempts.map(a => a.score));
  };

  // Check if user has completed a quiz
  const hasCompletedQuiz = (quizId) => {
    return attempts.some(a => a.quizId === quizId);
  };

  // Refresh quizzes
  const refresh = () => {
    dispatch(fetchQuizzes());
  };

  return {
    // State
    quizzes: items,
    currentQuiz,
    attempts,
    currentAttempt,
    loading,
    error,

    // Computed values
    hasQuizzes: items.length > 0,
    totalAttempts: attempts.length,

    // Actions
    getQuizById,
    getQuizByLessonId,
    submitAttempt,
    createNewQuiz,
    updateExistingQuiz,
    deleteExistingQuiz,
    setCurrentQuiz: (quiz) => dispatch(setCurrentQuiz(quiz)),
    clearCurrentQuiz: () => dispatch(clearCurrentQuiz()),
    setCurrentAttempt: (attempt) => dispatch(setCurrentAttempt(attempt)),
    clearCurrentAttempt: () => dispatch(clearCurrentAttempt()),
    refresh,

    // Helper methods
    getQuizStats,
    getGlobalStats,
    getUserQuizAttempts,
    getUserBestScore,
    hasCompletedQuiz,
  };
};

export default useQuizzes;
