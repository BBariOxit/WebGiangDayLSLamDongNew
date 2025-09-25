// Quiz Service: mock implementation backed by localStorage with a clean API surface.
// This can be swapped later to a REST/GraphQL client that hits a PostgreSQL-backed server.

// Versioned storage keys (v3 aligns với mô hình mỗi ĐỊA DANH = 1 lesson)
const QUIZZES_KEY = 'app_quizzes_v3';
const ATTEMPTS_KEY = 'app_quiz_attempts_v3';

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
  if (quizzes.length > 0) return;
  const now = new Date().toISOString();
  const seed = [
    {
      id: 'lesson-1',
      lessonId: 1,
      title: 'Quiz: Lang Biang nền bản địa',
      description: 'Củng cố kiến thức về vai trò nền tảng văn hóa – sinh thái của Lang Biang.',
      category: 'Lịch sử địa phương',
      difficulty: 'Cơ bản',
      timeLimit: 10,
      questions: [
        { id: 1, text: 'Nhóm tộc người gắn bó lâu đời với Lang Biang?', options: ['K\'Ho – Lạch – Chil', 'Mường – Thái', 'Chăm – Khmer', 'Tày – Nùng'], correctIndex: 0, explanation: 'Lang Biang là không gian cư trú K\'Ho – Lạch – Chil.' },
        { id: 2, text: 'Yếu tố tự nhiên nào giúp Lang Biang thành nền tảng cư trú?', options: ['Núi lửa hoạt động', 'Nguồn nước đầu nguồn & vi khí hậu mát', 'Sa mạc khô', 'Đồng bằng phù sa'], correctIndex: 1, explanation: 'Nguồn nước + khí hậu mát ổn định hỗ trợ định cư sớm.' },
        { id: 3, text: 'Truyền thuyết Lang – Biang phản ánh điều gì?', options: ['Xung đột văn hóa & hòa giải tộc nhóm', 'Chiến tranh thuộc địa', 'Thuần túy nông nghiệp', 'Chỉ tín ngưỡng biển'], correctIndex: 0, explanation: 'Nhấn mạnh tương tác – hòa giải giữa cộng đồng.' }
      ],
      tags: ['Lịch sử','Địa danh','Lang Biang'],
      createdByRole: 'teacher',
      createdAt: now
    },
    {
      id: 'lesson-2',
      lessonId: 2,
      title: 'Quiz: Djiring cửa ngõ khai phá',
      description: 'Kiểm tra hiểu biết về chức năng hậu cần & mở đường của Djiring.',
      category: 'Lịch sử địa phương',
      difficulty: 'Cơ bản',
      timeLimit: 8,
      questions: [
        { id: 1, text: 'Tuyến khảo sát có Djiring làm trạm trung chuyển?', options: ['Huế – Đà Nẵng – Đà Lạt', 'Phan Rang – Djiring – Lang Biang', 'Sài Gòn – Cần Thơ – Đà Lạt', 'Nha Trang – Buôn Ma Thuột'], correctIndex: 1, explanation: 'Tuyến Phan Rang – Djiring – Lang Biang thời Pháp.' },
        { id: 2, text: 'Chức năng chính của Djiring giai đoạn 1900–1930?', options: ['Thương cảng biển', 'Hậu cần & khai phá', 'Trung tâm giáo dục', 'Sản xuất tơ lụa'], correctIndex: 1, explanation: 'Djiring cung cấp hậu cần và mở đường cao nguyên.' }
      ],
      tags: ['Lịch sử','Địa danh','Djiring'],
      createdByRole: 'teacher',
      createdAt: now
    },
    {
      id: 'lesson-3',
      lessonId: 3,
      title: 'Quiz: Đà Lạt trung tâm đa chức năng',
      description: 'Câu hỏi về các giai đoạn quy hoạch & chuyển đổi chức năng Đà Lạt.',
      category: 'Lịch sử địa phương',
      difficulty: 'Trung bình',
      timeLimit: 12,
      questions: [
        { id: 1, text: 'Giai đoạn kiến thiết biệt thự – trường học mạnh nhất?', options: ['1920–1945', '1955–1960', '1986–1990', '2005–2010'], correctIndex: 0, explanation: 'Thời kỳ thuộc địa cao điểm 1920–1945.' },
        { id: 2, text: 'Chức năng bổ sung sau 1975 của Đà Lạt?', options: ['Cảng biển quốc tế', 'Nông nghiệp công nghệ cao & giáo dục', 'Khai thác dầu khí', 'Trung tâm luyện kim'], correctIndex: 1, explanation: 'Đà Lạt mở rộng giáo dục – nông nghiệp CNC.' }
      ],
      tags: ['Lịch sử','Địa danh','Đà Lạt'],
      createdByRole: 'teacher',
      createdAt: now
    },
    {
      id: 'lesson-4',
      lessonId: 4,
      title: 'Quiz: Liên Khương hạ tầng kết nối',
      description: 'Đánh giá vai trò sân bay & tác động kinh tế vùng.',
      category: 'Lịch sử địa phương',
      difficulty: 'Cơ bản',
      timeLimit: 7,
      questions: [
        { id: 1, text: 'Liên Khương khởi đầu vào thập niên nào?', options: ['1930s', '1960s', '1980s', '2000s'], correctIndex: 1, explanation: 'Bắt đầu từ thập niên 1960.' },
        { id: 2, text: 'Một tác động chính của nâng cấp Liên Khương?', options: ['Giảm thời gian vận chuyển nông sản tươi', 'Tăng sản lượng khai thác khoáng sản', 'Thay thế hoàn toàn đường bộ', 'Phát triển dầu khí ngoài khơi'], correctIndex: 0, explanation: 'Hạ tầng giúp rút ngắn thời gian logistics.' }
      ],
      tags: ['Lịch sử','Địa danh','Liên Khương'],
      createdByRole: 'teacher',
      createdAt: now
    },
    {
      id: 'lesson-5',
      lessonId: 5,
      title: 'Quiz: Bảo Lộc trục nông – công nghiệp',
      description: 'Củng cố chuỗi tiến hóa đồn điền -> chế biến sâu -> cực tăng trưởng.',
      category: 'Lịch sử địa phương',
      difficulty: 'Trung bình',
      timeLimit: 10,
      questions: [
        { id: 1, text: 'Ngành nào KHÔNG phải trụ cột chế biến sâu Bảo Lộc?', options: ['Chè', 'Cà phê', 'Tơ tằm', 'Luyện thép'], correctIndex: 3, explanation: 'Luyện thép không thuộc chuỗi đặc trưng Bảo Lộc.' },
        { id: 2, text: 'Một vai trò chiến lược của Bảo Lộc trong cơ cấu đô thị tỉnh?', options: ['Giảm áp lực dân cư Đà Lạt', 'Đóng cửa giao thông', 'Thay thế toàn bộ Đà Lạt', 'Cảng nước sâu quốc tế'], correctIndex: 0, explanation: 'Bảo Lộc cân bằng phân bố dân cư & kinh tế.' }
      ],
      tags: ['Lịch sử','Địa danh','Bảo Lộc'],
      createdByRole: 'teacher',
      createdAt: now
    }
  ];
  save(QUIZZES_KEY, seed);
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
  // Multi-quiz support (restored)
  getQuizzesByLessonId(lessonId) {
    const quizzes = load(QUIZZES_KEY, []);
    return quizzes.filter(q => String(q.lessonId) === String(lessonId));
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
