import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
  fetchLessons,
  fetchLessonById,
  fetchLessonBySlug,
  searchLessons,
  updateLessonProgress,
  setCurrentLesson,
  clearCurrentLesson,
  setFilters,
  clearFilters,
  clearSearchResults,
} from '../lessonsSlice';
import lessonService from '@shared/services/lessonService';

/**
 * Custom hook for lessons management
 * Provides all lesson-related functions and state
 */
export const useLessons = () => {
  const dispatch = useDispatch();
  const {
    items,
    currentLesson,
    searchResults,
    userProgress,
    loading,
    error,
    filters,
  } = useSelector((state) => state.lessons);

  const { user } = useSelector((state) => state.auth);

  // Auto-fetch lessons if not loaded
  useEffect(() => {
    if (items.length === 0 && !loading && !error) {
      dispatch(fetchLessons());
    }
  }, [dispatch, items.length, loading, error]);

  // Get lesson by ID
  const getLessonById = async (id) => {
    try {
      await dispatch(fetchLessonById(id)).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // Get lesson by slug
  const getLessonBySlug = async (slug) => {
    try {
      await dispatch(fetchLessonBySlug(slug)).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // Search lessons
  const search = async (query) => {
    if (!query || query.trim() === '') {
      dispatch(clearSearchResults());
      return { success: true, results: [] };
    }
    
    try {
      const results = await dispatch(searchLessons(query)).unwrap();
      return { success: true, results };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // Update lesson progress
  const saveProgress = async (lessonId, progress) => {
    if (!user) {
      console.warn('User not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      await dispatch(updateLessonProgress({
        userId: user.id,
        lessonId,
        progress,
      })).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // Mark lesson as completed
  const markCompleted = async (lessonId) => {
    return await saveProgress(lessonId, 100);
  };

  // Get user statistics
  const getUserStats = () => {
    if (!user) return null;
    return lessonService.getUserStats(user.id);
  };

  // Filter lessons
  const filterLessons = (filterOptions) => {
    dispatch(setFilters(filterOptions));
  };

  // Get filtered lessons
  const getFilteredLessons = () => {
    let filtered = [...items];

    if (filters.category) {
      filtered = filtered.filter(lesson => lesson.category === filters.category);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(lesson => lesson.difficulty === filters.difficulty);
    }

    if (filters.tag) {
      filtered = filtered.filter(lesson => lesson.tags.includes(filters.tag));
    }

    return filtered;
  };

  // Get popular lessons
  const getPopularLessons = (limit = 5) => {
    return lessonService.getPopularLessons(limit);
  };

  // Get recent lessons
  const getRecentLessons = (limit = 5) => {
    return lessonService.getRecentLessons(limit);
  };

  // Get categories
  const getCategories = () => {
    return lessonService.getCategories();
  };

  // Get all tags
  const getAllTags = () => {
    return lessonService.getAllTags();
  };

  // Refresh lessons
  const refresh = () => {
    dispatch(fetchLessons());
  };

  return {
    // State
    lessons: items,
    currentLesson,
    searchResults,
    userProgress,
    loading,
    error,
    filters,

    // Computed values
    filteredLessons: getFilteredLessons(),
    hasLessons: items.length > 0,

    // Actions
    getLessonById,
    getLessonBySlug,
    search,
    saveProgress,
    markCompleted,
    setCurrentLesson: (lesson) => dispatch(setCurrentLesson(lesson)),
    clearCurrentLesson: () => dispatch(clearCurrentLesson()),
    filterLessons,
    clearFilters: () => dispatch(clearFilters()),
    clearSearchResults: () => dispatch(clearSearchResults()),
    refresh,

    // Helper methods
    getUserStats,
    getPopularLessons,
    getRecentLessons,
    getCategories,
    getAllTags,
  };
};

export default useLessons;
