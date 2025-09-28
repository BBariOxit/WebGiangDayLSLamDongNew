// Enhanced Quiz Service with Database Integration
// Supports both localStorage (fallback) and PostgreSQL database

import { apiClient } from './client.js';
import { STORAGE_KEYS, QUIZ_CONFIG } from '../constants/appConfig.js';
import { storage } from '../utils/helpers.js';

class QuizService {
  constructor() {
    this.useDatabase = false; // Start with localStorage, can switch to DB
    this.init();
  }

  async init() {
    // Try to connect to database API
    try {
      await apiClient.get('/health');
      this.useDatabase = true;
      console.log('✅ Connected to database API');
    } catch (error) {
      console.warn('⚠️ Database unavailable, using localStorage fallback');
      this.seedLocalStorage();
    }
  }

  // Seed localStorage with initial data if empty
  seedLocalStorage() {
    const existing = storage.get(STORAGE_KEYS.QUIZZES, []);
    if (existing.length > 0) return;

    const now = new Date().toISOString();
    const seedQuizzes = [
      {
        id: 'lesson-1',
        lessonId: 1,
        title: 'Quiz: Lang Biang nền bản địa',
        description: 'Củng cố kiến thức về vai trò nền tảng văn hóa – sinh thái của Lang Biang.',
        category: 'Lịch sử địa phương',
        difficulty: 'Cơ bản',
        timeLimit: 10,
        questions: [
          { 
            id: 1, 
            text: 'Nhóm tộc người gắn bó lâu đời với Lang Biang?', 
            options: ['K\'Ho – Lạch – Chil', 'Mường – Thái', 'Chăm – Khmer', 'Tày – Nùng'], 
            correctIndex: 0, 
            explanation: 'Lang Biang là không gian cư trú K\'Ho – Lạch – Chil.' 
          },
          { 
            id: 2, 
            text: 'Yếu tố tự nhiên nào giúp Lang Biang thành nền tảng cư trú?', 
            options: ['Núi lửa hoạt động', 'Nguồn nước đầu nguồn & vi khí hậu mát', 'Sa mạc khô', 'Đồng bằng phù sa'], 
            correctIndex: 1, 
            explanation: 'Nguồn nước + khí hậu mát ổn định hỗ trợ định cư sớm.' 
          }
        ],
        tags: ['Lịch sử', 'Địa danh', 'Lang Biang'],
        createdByRole: 'teacher',
        createdAt: now
      }
    ];

    storage.set(STORAGE_KEYS.QUIZZES, seedQuizzes);
  }

  // QUIZ CRUD OPERATIONS
  async getQuizzes() {
    if (this.useDatabase) {
      try {
        return await apiClient.get('/quizzes');
      } catch (error) {
        console.error('Database error, fallback to localStorage:', error);
        return storage.get(STORAGE_KEYS.QUIZZES, []);
      }
    }
    return storage.get(STORAGE_KEYS.QUIZZES, []);
  }

  async getQuizById(id) {
    if (this.useDatabase) {
      try {
        return await apiClient.get(`/quizzes/${id}`);
      } catch (error) {
        console.error('Database error, fallback to localStorage:', error);
      }
    }
    
    const quizzes = storage.get(STORAGE_KEYS.QUIZZES, []);
    return quizzes.find(q => String(q.id) === String(id)) || null;
  }

  async getQuizByLessonId(lessonId) {
    if (this.useDatabase) {
      try {
        const response = await apiClient.get(`/quizzes?lessonId=${lessonId}`);
        return response[0] || null;
      } catch (error) {
        console.error('Database error, fallback to localStorage:', error);
      }
    }

    const quizzes = storage.get(STORAGE_KEYS.QUIZZES, []);
    return quizzes.find(q => String(q.lessonId) === String(lessonId)) || null;
  }

  async getQuizzesByLessonId(lessonId) {
    if (this.useDatabase) {
      try {
        return await apiClient.get(`/quizzes?lessonId=${lessonId}`);
      } catch (error) {
        console.error('Database error, fallback to localStorage:', error);
      }
    }

    const quizzes = storage.get(STORAGE_KEYS.QUIZZES, []);
    return quizzes.filter(q => String(q.lessonId) === String(lessonId));
  }

  async createQuiz(quizData) {
    const quiz = {
      ...quizData,
      id: quizData.id || `quiz-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    if (this.useDatabase) {
      try {
        return await apiClient.post('/quizzes', quiz);
      } catch (error) {
        console.error('Database error, fallback to localStorage:', error);
      }
    }

    // localStorage fallback
    const quizzes = storage.get(STORAGE_KEYS.QUIZZES, []);
    quizzes.push(quiz);
    storage.set(STORAGE_KEYS.QUIZZES, quizzes);
    return quiz;
  }

  async updateQuiz(id, updates) {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (this.useDatabase) {
      try {
        return await apiClient.put(`/quizzes/${id}`, updatedData);
      } catch (error) {
        console.error('Database error, fallback to localStorage:', error);
      }
    }

    // localStorage fallback
    const quizzes = storage.get(STORAGE_KEYS.QUIZZES, []);
    const index = quizzes.findIndex(q => String(q.id) === String(id));
    
    if (index !== -1) {
      quizzes[index] = { ...quizzes[index], ...updatedData };
      storage.set(STORAGE_KEYS.QUIZZES, quizzes);
      return quizzes[index];
    }
    
    return null;
  }

  async deleteQuiz(id) {
    if (this.useDatabase) {
      try {
        return await apiClient.delete(`/quizzes/${id}`);
      } catch (error) {
        console.error('Database error, fallback to localStorage:', error);
      }
    }

    // localStorage fallback
    const quizzes = storage.get(STORAGE_KEYS.QUIZZES, []);
    const filtered = quizzes.filter(q => String(q.id) !== String(id));
    storage.set(STORAGE_KEYS.QUIZZES, filtered);
    
    // Also clean up attempts
    const attempts = storage.get(STORAGE_KEYS.ATTEMPTS, []);
    const cleanAttempts = attempts.filter(a => String(a.quizId) !== String(id));
    storage.set(STORAGE_KEYS.ATTEMPTS, cleanAttempts);
    
    return { success: true };
  }

  // QUIZ ATTEMPTS
  async saveAttempt(attemptData) {
    const attempt = {
      id: `attempt-${Date.now()}`,
      ...attemptData,
      createdAt: new Date().toISOString()
    };

    if (this.useDatabase) {
      try {
        return await apiClient.post('/quiz-attempts', attempt);
      } catch (error) {
        console.error('Database error, fallback to localStorage:', error);
      }
    }

    // localStorage fallback
    const attempts = storage.get(STORAGE_KEYS.ATTEMPTS, []);
    attempts.push(attempt);
    storage.set(STORAGE_KEYS.ATTEMPTS, attempts);
    return attempt;
  }

  async getAttempts() {
    if (this.useDatabase) {
      try {
        return await apiClient.get('/quiz-attempts');
      } catch (error) {
        console.error('Database error, fallback to localStorage:', error);
      }
    }
    return storage.get(STORAGE_KEYS.ATTEMPTS, []);
  }

  async getAttemptsByUser(userId) {
    const attempts = await this.getAttempts();
    return attempts.filter(a => String(a.userId) === String(userId));
  }

  async getAttemptsByQuiz(quizId) {
    const attempts = await this.getAttempts();
    return attempts.filter(a => String(a.quizId) === String(quizId));
  }

  // STATISTICS
  async getQuizStats(quizId) {
    const attempts = await this.getAttemptsByQuiz(quizId);
    const total = attempts.length;
    
    if (total === 0) {
      return { totalAttempts: 0, averageScore: 0, passRate: 0 };
    }

    const averageScore = Math.round(
      attempts.reduce((sum, attempt) => sum + attempt.score, 0) / total
    );
    
    const passRate = Math.round(
      (attempts.filter(a => a.score >= QUIZ_CONFIG.PASSING_SCORE).length / total) * 100
    );

    return { totalAttempts: total, averageScore, passRate };
  }

  async getGlobalStats() {
    const [quizzes, attempts] = await Promise.all([
      this.getQuizzes(),
      this.getAttempts()
    ]);

    const totalQuizzes = quizzes.length;
    const totalAttempts = attempts.length;
    
    const averageScore = totalAttempts > 0 
      ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts)
      : 0;

    return { totalQuizzes, totalAttempts, averageScore };
  }

  // DATABASE CONNECTION METHODS
  async switchToDatabase() {
    try {
      await apiClient.get('/health');
      this.useDatabase = true;
      console.log('✅ Switched to database mode');
      return true;
    } catch (error) {
      console.error('❌ Cannot connect to database:', error);
      return false;
    }
  }

  switchToLocalStorage() {
    this.useDatabase = false;
    console.log('📱 Switched to localStorage mode');
  }

  isUsingDatabase() {
    return this.useDatabase;
  }
}

// Create singleton instance
export const quizService = new QuizService();
export default quizService;