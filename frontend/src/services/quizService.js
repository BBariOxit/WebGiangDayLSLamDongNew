// Quiz Service: mock implementation backed by localStorage with a clean API surface.
// This can be swapped later to a REST/GraphQL client that hits a PostgreSQL-backed server.

const QUIZZES_KEY = 'app_quizzes_v1';
const ATTEMPTS_KEY = 'app_quiz_attempts_v1';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed initial quizzes if none exist
function seedIfEmpty() {
  const quizzes = load(QUIZZES_KEY, []);
  if (quizzes.length === 0) {
    const seed = [
      {
        id: 101,
        title: 'Quiz: Lịch sử hình thành Lâm Đồng',
        description: 'Kiểm tra kiến thức về quá trình hình thành và phát triển của Lâm Đồng mới.',
        category: 'Lịch sử địa phương',
        difficulty: 'Cơ bản',
        timeLimit: 20,
        questions: [
          {
            id: 1,
            text: 'Tỉnh Lâm Đồng mới được thành lập từ việc sáp nhập những tỉnh nào?',
            options: ['Lâm Đồng, Bình Thuận, Đắk Lắk', 'Lâm Đồng, Bình Thuận, Đắk Nông', 'Lâm Đồng, Khánh Hòa, Đắk Nông', 'Lâm Đồng, Ninh Thuận, Đắk Nông'],
            correctIndex: 1,
            explanation: 'Sáp nhập Lâm Đồng cũ, Bình Thuận và Đắk Nông.'
          }
        ],
        tags: ['Lịch sử', 'Lâm Đồng'],
        createdByRole: 'teacher',
        createdAt: new Date().toISOString()
      },
      {
        id: 102,
        title: 'Quiz: Địa lý và khí hậu Đà Lạt',
        description: 'Đánh giá hiểu biết về đặc điểm địa lý và khí hậu của Đà Lạt.',
        category: 'Địa lý',
        difficulty: 'Trung bình',
        timeLimit: 25,
        questions: [
          {
            id: 1,
            text: 'Đỉnh cao nhất liên quan tới vùng cao nguyên Lâm Đồng là gì?',
            options: ['Bidoup - 2.167m', 'Lang Biang - 2.169m', 'Tà Cú - 649m', 'Chư Yang Sin - 2.442m'],
            correctIndex: 0,
            explanation: 'Đỉnh Bidoup cao 2.167m.'
          }
        ],
        tags: ['Địa lý', 'Khí hậu'],
        createdByRole: 'teacher',
        createdAt: new Date().toISOString()
      }
    ];
    save(QUIZZES_KEY, seed);
  }
}

seedIfEmpty();

export const quizService = {
  // Quizzes
  getQuizzes() {
    return load(QUIZZES_KEY, []);
  },
  getQuizById(id) {
    const quizzes = load(QUIZZES_KEY, []);
    return quizzes.find(q => String(q.id) === String(id)) || null;
  },
  createQuiz(quiz) {
    const quizzes = load(QUIZZES_KEY, []);
    const newQuiz = { ...quiz, id: quiz.id || Date.now(), createdAt: new Date().toISOString() };
    quizzes.push(newQuiz);
    save(QUIZZES_KEY, quizzes);
    return newQuiz;
  },
  updateQuiz(id, patch) {
    const quizzes = load(QUIZZES_KEY, []);
    const idx = quizzes.findIndex(q => String(q.id) === String(id));
    if (idx === -1) return null;
    quizzes[idx] = { ...quizzes[idx], ...patch, updatedAt: new Date().toISOString() };
    save(QUIZZES_KEY, quizzes);
    return quizzes[idx];
  },
  deleteQuiz(id) {
    const quizzes = load(QUIZZES_KEY, []);
    const next = quizzes.filter(q => String(q.id) !== String(id));
    save(QUIZZES_KEY, next);
    return { success: true };
  },

  // Attempts
  getAttempts() {
    return load(ATTEMPTS_KEY, []);
  },
  getAttemptsByUser(userId) {
    return this.getAttempts().filter(a => String(a.userId) === String(userId));
  },
  getAttemptsByQuiz(quizId) {
    return this.getAttempts().filter(a => String(a.quizId) === String(quizId));
  },
  saveAttempt({ userId, quizId, score, durationSeconds, answers }) {
    const attempts = this.getAttempts();
    const attempt = {
      id: Date.now(),
      userId,
      quizId,
      score,
      durationSeconds,
      answers,
      createdAt: new Date().toISOString()
    };
    attempts.push(attempt);
    save(ATTEMPTS_KEY, attempts);
    return attempt;
  },

  // Stats
  getQuizStats(quizId) {
    const attempts = this.getAttemptsByQuiz(quizId);
    const total = attempts.length;
    const averageScore = total ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / total) : 0;
    const passRate = total ? Math.round((attempts.filter(a => a.score >= 70).length / total) * 100) : 0;
    return { totalAttempts: total, averageScore, passRate };
    },
  getGlobalStats() {
    const quizzes = this.getQuizzes();
    const attempts = this.getAttempts();
    const totalQuizzes = quizzes.length;
    const totalAttempts = attempts.length;
    const averageScore = totalAttempts ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / totalAttempts) : 0;
    return { totalQuizzes, totalAttempts, averageScore };
  }
};

export default quizService;
