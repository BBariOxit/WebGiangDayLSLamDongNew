// Quiz Service: mock implementation backed by localStorage with a clean API surface.
// This can be swapped later to a REST/GraphQL client that hits a PostgreSQL-backed server.

const QUIZZES_KEY = 'app_quizzes_v2';
const ATTEMPTS_KEY = 'app_quiz_attempts_v2';

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
      // Lesson 1 quiz
      {
        id: 'lesson-1',
        lessonId: 1,
        title: 'Bài học 1: Lịch sử hình thành',
        description: 'Kiểm tra kiến thức về quá trình sát nhập tạo nên tỉnh Lâm Đồng mới.',
        category: 'Lịch sử địa phương',
        difficulty: 'Cơ bản',
        timeLimit: 15,
        questions: [
          {
            id: 1,
            text: 'Nghị quyết sát nhập được Quốc hội thông qua vào thời điểm nào?',
            options: ['3/2023', '3/2024', '8/2024', '1/2025'],
            correctIndex: 1,
            explanation: 'Tháng 3/2024 Quốc hội thông qua Nghị quyết sát nhập.'
          },
          {
            id: 2,
            text: 'Ba tỉnh hợp nhất thành Lâm Đồng mới là?',
            options: [
              'Lâm Đồng, Bình Thuận, Đắk Lắk',
              'Lâm Đồng, Bình Thuận, Đắk Nông',
              'Lâm Đồng, Ninh Thuận, Đắk Nông',
              'Lâm Đồng, Bình Thuận, Khánh Hòa'
            ],
            correctIndex: 1,
            explanation: 'Lâm Đồng cũ, Bình Thuận và Đắk Nông.'
          },
          {
            id: 3,
            text: 'Diện tích và dân số tỉnh mới (2025) khoảng?',
            options: [
              '20.000 km² / 2,5 triệu',
              '24.101 km² / 3,1 triệu',
              '25.500 km² / 3,5 triệu',
              '22.000 km² / 2,8 triệu'
            ],
            correctIndex: 1,
            explanation: '24.101 km² và ~3,1 triệu dân.'
          },
          {
            id: 4,
            text: 'Trung tâm hành chính chính của tỉnh là?',
            options: ['Đà Lạt', 'Phan Thiết', 'Gia Nghĩa', 'Bảo Lộc'],
            correctIndex: 0,
            explanation: 'Đà Lạt giữ vai trò trung tâm hành chính.'
          },
          {
            id: 5,
            text: 'Hai trung tâm phụ được định hướng phát triển là?',
            options: [
              'Bảo Lộc & Đức Trọng',
              'Phan Thiết & Gia Nghĩa',
              'Gia Nghĩa & Bảo Lộc',
              'Phan Thiết & Di Linh'
            ],
            correctIndex: 1,
            explanation: 'Phan Thiết (kinh tế biển) và Gia Nghĩa (nông lâm nghiệp).'
          }
        ],
        tags: ['Lịch sử', 'Sát nhập', 'Bài 1'],
        createdByRole: 'teacher',
        createdAt: new Date().toISOString()
      },
      // Lesson 2 quiz
      {
        id: 'lesson-2',
        lessonId: 2,
        title: 'Bài học 2: Địa lý & Khí hậu',
        description: 'Đánh giá hiểu biết về ba vùng địa lý và đặc điểm khí hậu.',
        category: 'Địa lý',
        difficulty: 'Trung bình',
        timeLimit: 18,
        questions: [
          {
            id: 1,
            text: 'Cao độ trung bình vùng cao nguyên Lâm Đồng?',
            options: ['300-700m', '500-1000m', '800-1500m', '1500-2000m'],
            correctIndex: 2,
            explanation: 'Vùng cao nguyên có cao độ 800-1500m.'
          },
            {
            id: 2,
            text: 'Đỉnh cao nhất của tỉnh là?',
            options: ['Lang Biang 2.169m', 'Bidoup 2.167m', 'Tà Cú 649m', 'Chư Yang Sin 2.442m'],
            correctIndex: 1,
            explanation: 'Đỉnh Bidoup cao 2.167m.'
          },
          {
            id: 3,
            text: 'Bờ biển dài ~192 km thuộc vùng nào?',
            options: ['Cao nguyên', 'Duyên hải Bình Thuận', 'Tây Nguyên Đắk Nông', 'Cả ba vùng'],
            correctIndex: 1,
            explanation: 'Duyên hải Bình Thuận có chiều dài bờ biển ~192 km.'
          },
          {
            id: 4,
            text: 'Lượng mưa thấp nhất thuộc vùng?',
            options: [
              'Cao nguyên (1500-2500mm)',
              'Duyên hải (800-1200mm)',
              'Tây Nguyên Đắk Nông (1600-2000mm)',
              'Cả ba tương đương'
            ],
            correctIndex: 1,
            explanation: 'Vùng duyên hải khô hạn nhất.'
          },
          {
            id: 5,
            text: 'Đất bazan màu mỡ tập trung nhiều ở?',
            options: ['Cao nguyên Lâm Đồng', 'Duyên hải Bình Thuận', 'Tây Nguyên Đắk Nông', 'Ven biển & cao nguyên'],
            correctIndex: 2,
            explanation: 'Đắk Nông nổi bật về đất bazan.'
          }
        ],
        tags: ['Địa lý', 'Khí hậu', 'Bài 2'],
        createdByRole: 'teacher',
        createdAt: new Date().toISOString()
      },
      // Lesson 3 quiz (culture placeholder)
      {
        id: 'lesson-3',
        lessonId: 3,
        title: 'Bài học 3: Văn hóa đa dạng',
        description: 'Câu hỏi mẫu về đa dạng văn hóa các dân tộc.',
        category: 'Văn hóa',
        difficulty: 'Cơ bản',
        timeLimit: 12,
        questions: [
          {
            id: 1,
            text: 'Số dân tộc cùng sinh sống (ước tính) > ?',
            options: ['10', '15', '20', '30'],
            correctIndex: 2,
            explanation: 'Hơn 20 dân tộc cùng sinh sống.'
          },
          {
            id: 2,
            text: 'Một di sản văn hóa tiêu biểu của Tây Nguyên?',
            options: ['Không gian cồng chiêng', 'Trống đồng', 'Ca trù', 'Quan họ'],
            correctIndex: 0,
            explanation: 'Không gian văn hóa cồng chiêng Tây Nguyên.'
          }
        ],
        tags: ['Văn hóa', 'Dân tộc', 'Bài 3'],
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
  getQuizByLessonId(lessonId) {
    const quizzes = load(QUIZZES_KEY, []);
    return quizzes.find(q => String(q.lessonId) === String(lessonId)) || null;
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
