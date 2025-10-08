import { lessonsData } from '../constants/lessonsData';
import apiClient from './apiClient';

// Lesson service - handles lesson data operations
class LessonService {
  constructor() {
    this.storageKey = 'webgdlsld_lessons_progress';
  }

  // Get all lessons
  async getAllLessons() {
    // TODO: Replace with API call when backend is ready
    // const response = await apiClient.get('/lessons');
    // return response.data;
    return lessonsData;
  }

  // Get lesson by ID
  async getLessonById(id) {
    // TODO: Replace with API call
    // const response = await apiClient.get(`/lessons/${id}`);
    // return response.data;
    return lessonsData.find(lesson => lesson.id === parseInt(id));
  }

  // Get lesson by slug
  async getLessonBySlug(slug) {
    // TODO: Replace with API call
    // const response = await apiClient.get(`/lessons/slug/${slug}`);
    // return response.data;
    return lessonsData.find(lesson => lesson.slug === slug);
  }

  // Search lessons
  async searchLessons(query) {
    // TODO: Replace with API call
    // const response = await apiClient.get('/lessons/search', { params: { q: query } });
    // return response.data;
    const lowerQuery = query.toLowerCase();
    return lessonsData.filter(lesson =>
      lesson.title.toLowerCase().includes(lowerQuery) ||
      lesson.summary.toLowerCase().includes(lowerQuery) ||
      lesson.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Filter lessons by category
  async getLessonsByCategory(category) {
    // TODO: Replace with API call
    return lessonsData.filter(lesson => lesson.category === category);
  }

  // Filter lessons by tag
  async getLessonsByTag(tag) {
    // TODO: Replace with API call
    return lessonsData.filter(lesson => lesson.tags.includes(tag));
  }

  // Get lesson progress for user
  getLessonProgress(userId, lessonId) {
    const progress = this.loadProgress();
    return progress[userId]?.[lessonId] || 0;
  }

  // Save lesson progress
  saveLessonProgress(userId, lessonId, progressPercent) {
    const progress = this.loadProgress();
    if (!progress[userId]) {
      progress[userId] = {};
    }
    progress[userId][lessonId] = Math.min(100, Math.max(0, progressPercent));
    localStorage.setItem(this.storageKey, JSON.stringify(progress));
    return progress[userId][lessonId];
  }

  // Mark lesson as completed
  markLessonCompleted(userId, lessonId) {
    return this.saveLessonProgress(userId, lessonId, 100);
  }

  // Get user statistics
  getUserStats(userId) {
    const progress = this.loadProgress();
    const userProgress = progress[userId] || {};
    
    const completedLessons = Object.values(userProgress).filter(p => p === 100).length;
    const inProgressLessons = Object.values(userProgress).filter(p => p > 0 && p < 100).length;
    const totalProgress = Object.values(userProgress).reduce((sum, p) => sum + p, 0);
    const averageProgress = Object.keys(userProgress).length > 0
      ? Math.round(totalProgress / Object.keys(userProgress).length)
      : 0;

    return {
      totalLessons: lessonsData.length,
      completedLessons,
      inProgressLessons,
      notStartedLessons: lessonsData.length - completedLessons - inProgressLessons,
      averageProgress
    };
  }

  // Get popular lessons (by student count or rating)
  getPopularLessons(limit = 5) {
    return [...lessonsData]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // Get recent lessons
  getRecentLessons(limit = 5) {
    return [...lessonsData]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit);
  }

  // Helper methods
  loadProgress() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  // Get categories
  getCategories() {
    const categories = new Set(lessonsData.map(lesson => lesson.category));
    return Array.from(categories);
  }

  // Get all tags
  getAllTags() {
    const tags = new Set();
    lessonsData.forEach(lesson => {
      lesson.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }

  // Get difficulty levels
  getDifficultyLevels() {
    const levels = new Set(lessonsData.map(lesson => lesson.difficulty));
    return Array.from(levels);
  }
}

export default new LessonService();
