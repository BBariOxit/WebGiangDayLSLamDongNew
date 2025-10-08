# 🚀 Frontend Migration Guide

## Đã hoàn thành

Dự án đã được migration thành công sang kiến trúc Feature-Based với Redux Toolkit.

## Cấu trúc mới

```
frontend/src/
├── app/                    # App configuration
│   ├── store/             # Redux store
│   │   └── index.js       # Configured store với tất cả reducers
│   ├── routes/            # Application routes
│   │   └── index.jsx      # Main routing configuration
│   └── App.jsx            # Root app component
│
├── features/              # Feature-based modules
│   ├── auth/
│   │   ├── hooks/
│   │   │   └── useAuth.js       # Custom auth hook
│   │   ├── authSlice.js         # Auth Redux slice
│   │   └── authThunks.js        # Async auth actions
│   ├── lessons/
│   │   ├── components/
│   │   │   └── CommentSection.jsx
│   │   ├── hooks/
│   │   │   └── useLessons.js    # Custom lessons hook
│   │   ├── pages/
│   │   └── lessonsSlice.js       # Lessons Redux slice
│   ├── quizzes/
│   │   ├── hooks/
│   │   │   └── useQuizzes.js    # Custom quizzes hook
│   │   └── quizzesSlice.js       # Quizzes Redux slice
│   └── admin/
│
├── shared/                # Shared resources
│   ├── components/        # Reusable UI components
│   │   ├── ErrorBoundary.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Navbar.jsx
│   │   └── Sidebar.jsx
│   ├── layouts/           # Layout components
│   │   ├── AppLayout.jsx
│   │   └── MainLayout.jsx
│   ├── services/          # API services
│   │   ├── apiClient.js         # Axios client with interceptors
│   │   ├── lessonService.js
│   │   ├── quizService.js
│   │   └── commentService.js
│   ├── hooks/             # Custom hooks
│   │   └── useComments.js
│   ├── constants/         # Constants & static data
│   │   └── lessonsData.js
│   └── utils/             # Utility functions
│
├── pages/                 # Page components
├── styles/                # Global styles
├── App.jsx                # Main entry wrapper
└── main.jsx               # Application entry point
```

## Thay đổi chính

### 1. State Management

**Trước:**

- Context API cho auth
- Props drilling
- localStorage trực tiếp

**Sau:**

- Redux Toolkit cho toàn bộ state
- Custom hooks (useAuth, useLessons, useQuizzes)
- Centralized state management

### 2. Imports mới

```javascript
// Auth
import { useAuth } from "@/features/auth/hooks/useAuth";

// Lessons
import { useLessons } from "@/features/lessons/hooks/useLessons";

// Quizzes
import { useQuizzes } from "@/features/quizzes/hooks/useQuizzes";

// Components
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import AppLayout from "@/shared/layouts/AppLayout";

// Services
import lessonService from "@/shared/services/lessonService";
import quizService from "@/shared/services/quizService";
import commentService from "@/shared/services/commentService";
```

### 3. Custom Hooks Usage

#### useAuth Hook

```javascript
const {
  // State
  user,
  token,
  loading,
  error,
  hydrated,

  // Computed
  isAuthenticated,
  isAdmin,
  isTeacher,
  isStudent,

  // Actions
  login,
  loginWithGoogle,
  register,
  logout,
  updateUser,
} = useAuth();
```

#### useLessons Hook

```javascript
const {
  // State
  lessons,
  currentLesson,
  searchResults,
  userProgress,
  loading,
  error,
  filters,
  filteredLessons,

  // Actions
  getLessonById,
  getLessonBySlug,
  search,
  saveProgress,
  markCompleted,
  setCurrentLesson,
  clearCurrentLesson,
  filterLessons,
  clearFilters,
  refresh,

  // Helpers
  getUserStats,
  getPopularLessons,
  getRecentLessons,
  getCategories,
  getAllTags,
} = useLessons();
```

#### useQuizzes Hook

```javascript
const {
  // State
  quizzes,
  currentQuiz,
  attempts,
  currentAttempt,
  loading,
  error,

  // Actions
  getQuizById,
  getQuizByLessonId,
  submitAttempt,
  createNewQuiz,
  updateExistingQuiz,
  deleteExistingQuiz,
  setCurrentQuiz,
  clearCurrentQuiz,

  // Helpers
  getQuizStats,
  getGlobalStats,
  getUserQuizAttempts,
  getUserBestScore,
  hasCompletedQuiz,
} = useQuizzes();
```

## Migration từ Legacy Code

### 1. Thay thế Context API

**Trước:**

```javascript
import { useAuth } from "../contexts/AuthContext";

function MyComponent() {
  const { user, login, logout } = useAuth();
  // ...
}
```

**Sau:**

```javascript
import { useAuth } from "@/features/auth/hooks/useAuth";

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  // ...
}
```

### 2. Thay thế Direct Service Calls

**Trước:**

```javascript
import { lessonsData } from "../data/lessonsData";

function LessonsList() {
  const [lessons, setLessons] = useState(lessonsData);
  // ...
}
```

**Sau:**

```javascript
import { useLessons } from "@/features/lessons/hooks/useLessons";

function LessonsList() {
  const { lessons, loading, error } = useLessons();
  // Auto-fetches on mount
}
```

### 3. Update Imports trong Pages

**Các file cần update:**

- All pages in `src/pages/`
- Components using auth context
- Components using services directly

**Tìm và thay thế:**

```bash
# Old imports
'../contexts/AuthContext' → '../../features/auth/hooks/useAuth'
'../components/' → '../../shared/components/'
'../layouts/' → '../../shared/layouts/'
'../services/' → '../../shared/services/'
'../data/lessonsData' → '../../shared/constants/lessonsData'
```

## Testing Checklist

- [x] App khởi động không lỗi
- [x] Redux store hoạt động
- [x] Custom hooks trả về đúng data
- [ ] Login/Logout functionality
- [ ] Lessons listing và detail pages
- [ ] Quiz functionality
- [ ] Protected routes
- [ ] User progress tracking
- [ ] Comments và ratings

## Next Steps

1. **Test từng tính năng:**

   - Authentication flow
   - Lesson navigation
   - Quiz taking
   - Comments system

2. **Update remaining pages:**

   - Update all imports trong pages/
   - Thay thế useContext bằng hooks mới
   - Test navigation

3. **Clean up old files:**

   - Xóa legacy context files sau khi migrate xong
   - Xóa old store/index.js
   - Xóa duplicate services

4. **Performance optimization:**
   - Add React.memo where needed
   - Implement code splitting
   - Optimize re-renders

## Known Issues

- Auth persistence cần test kỹ
- Quiz submission cần verify score calculation
- Comment realtime updates (nếu cần)

## Rollback Plan

Nếu cần rollback, các file legacy vẫn tồn tại ở:

- `src/contexts/AuthContext.jsx`
- `src/store/index.js`
- `src/components/`
- `src/layouts/`
- `src/services/`

Chỉ cần revert `App.jsx` và `main.jsx` về version cũ.

## Support

Nếu gặp vấn đề, kiểm tra:

1. Redux DevTools để debug state
2. Console logs trong custom hooks
3. Network tab cho API calls (khi integrate backend)
