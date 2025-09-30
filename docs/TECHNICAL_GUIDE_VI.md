# Tài liệu kỹ thuật hệ thống WebGiangDayLSLamDongNew

Tài liệu này mô tả kiến trúc, luồng chạy, mô hình dữ liệu, chuẩn mã nguồn, hướng dẫn phát triển – triển khai, cũng như xử lý sự cố thường gặp cho dự án.

Mục tiêu: giúp Dev/PM nhanh chóng nắm được hệ thống, setup môi trường, debug vấn đề (đặc biệt các lỗi import Vite, màn hình trắng), và mở rộng tính năng.

---

## 1. Kiến trúc tổng quan

- Frontend: React 18 + Vite 5 + MUI 6 + React Router v6 + Redux Toolkit.
- Dịch vụ dữ liệu: LocalStorage-first (mock) cho Lessons và Quizzes; có thể nâng cấp sang backend thật (REST) sau.
- Cấu trúc thư mục (rút gọn):

```
frontend/
  src/
    pages/                # Legacy pages (đang được sử dụng runtime)
    layouts/              # Legacy AppLayout (đang được sử dụng runtime)
    routes/               # Legacy router (đang được sử dụng runtime)
    contexts/             # Legacy AuthContext (AuthProvider + useAuth)
    features/             # Kiến trúc theo feature (mới) – đã có admin
      admin/
        pages/AdminDashboard.jsx
        components/AdminLessons.jsx
    shared/
      api/
        quizService.js    # LocalStorage + seed
        lessonService.js  # LocalStorage + seed (mặc định)
      constants/appConfig.js
      utils/helpers.js
```

Lưu ý: hiện tồn tại song song 2 “phong cách” (legacy vs feature-based). Runtime đang dùng legacy entry: `src/main.jsx` → `src/App.jsx` → `src/routes/index.jsx` → `src/layouts/AppLayout.jsx`.

---

## 2. Luồng runtime (Frontend)

1. `src/main.jsx` khởi tạo Theme + Router, render `App`.
2. `src/App.jsx` bọc `AuthProvider` (legacy) và `ErrorBoundary`, render `AppRoutes`.
3. `src/routes/index.jsx` khai báo routes (public + protected) và dùng `AppLayout` làm layout.
4. `AppLayout` render Drawer/Menu theo role từ `useAuth()`.
5. Admin → truy cập `/admin` sẽ render `features/admin/pages/AdminDashboard.jsx` (đã tích hợp `AdminLessons`).

Auth mock (legacy): `src/contexts/AuthContext.jsx` lưu user + authToken vào localStorage. Có Redux slice cho auth, nhưng hiện entry đang dùng context.

---

## 3. Dịch vụ dữ liệu (LocalStorage)

- `src/shared/api/quizService.js`
  - Khóa lưu: `app_quizzes_v3`, `app_quiz_attempts_v3`.
  - API: `getQuizzes()`, `getQuizById()`, `createQuiz()`, `updateQuiz()`, `deleteQuiz()`, `saveAttempt()`, `getGlobalStats()`, `getQuizStats(quizId)`.
  - `seedIfEmpty()` tạo dữ liệu mẫu nếu chưa có.

- `src/shared/api/lessonService.js`
  - Khóa lưu: `app_lessons_v3` (xem `shared/constants/appConfig.js`).
  - Mặc định: LocalStorage-only, seed 2 bài học mẫu.
  - Có comment sẵn để sau này “inject” `apiClient` nếu cần backend.

- `src/shared/constants/appConfig.js` định nghĩa các key/const quan trọng (QUIZ_CONFIG, LESSON_CONFIG…).

---

## 4. Routing và phân quyền

- Public: `/`, `/lesson/:slug`, `/login`, `/register`, `/lessons` (với layout).
- Protected chung: `/dashboard`, `/quizzes`, `/quizzes/take/:id`, `/quizzes/results/:attemptId`.
- Teacher: `/teacher/quizzes`.
- Admin: `/admin`, `/admin/create-quiz`, `/admin/quizzes`.
- Component bảo vệ: `src/components/ProtectedRoute.jsx` – đọc `useAuth()`; Admin có quyền truy cập tất cả.

---

## 5. Chuẩn code & UI

- React function components + hooks, tách nhỏ component theo feature khi có thể.
- Material UI v6:
  - Import icon đúng tên (ví dụ: không có `Draft`, dùng `Archive` hoặc icon khác phù hợp).
  - Sử dụng `sx` cho style cục bộ.
- Không import file không tồn tại; Vite sẽ lỗi import và gây "màn hình trắng".

---

## 6. Quy ước dữ liệu

Ví dụ Lesson:
```
{
  id: number|string,
  title: string,
  slug: string,
  description: string,
  content: string (có thể chứa HTML),
  category: string,
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao',
  estimatedTime: number,
  imageUrl?: string,
  status: 'draft' | 'published' | 'archived',
  tags: string[],
  createdAt: ISODate,
  updatedAt: ISODate,
  createdBy?: string
}
```

Ví dụ Quiz:
```
{
  id: string|number,
  lessonId: string|number,
  title: string,
  description: string,
  category: string,
  difficulty: string,
  timeLimit: number, // minutes
  questions: { id:number, text:string, options:string[], correctIndex:number, explanation?:string }[],
  tags: string[],
  createdByRole: 'teacher'|'admin',
  createdAt: ISODate,
  updatedAt?: ISODate
}
```

---

## 7. Thiết lập môi trường & chạy

- Yêu cầu Node 18+, npm 9+.
- Luôn chạy lệnh bên trong thư mục `frontend/`:

```
cd frontend
npm install
npm run dev
```

- Vite mặc định cổng 5173; nếu bận, sẽ tự chuyển 5174.
- Đăng nhập nhanh bằng tài khoản demo trên trang Login (Admin/Teacher/Student).

---

## 8. Xử lý sự cố (Troubleshooting)

1) Lỗi Vite: Failed to resolve import './client.js' từ quizService.js/lessonService.js
- Nguyên nhân: file service import `./client.js` không tồn tại.
- Cách xử lý: đảm bảo `src/shared/api/quizService.js` và `lessonService.js` KHÔNG import `./client.js`. Phiên bản hiện tại sử dụng LocalStorage-only.

2) Màn hình trắng (white screen) khi vào /admin hoặc trang khác
- Mở DevTools → Console, xem lỗi đỏ đầu tiên.
- Lỗi thường gặp:
  - Import icon sai (ví dụ `Draft` không tồn tại) → sửa sang `Archive` hoặc icon hợp lệ.
  - Import tới file không tồn tại (./client.js, ./something.js) → xóa hoặc sửa import.

3) npm error: Could not read package.json
- Chắc chắn đang ở thư mục `frontend` trước khi chạy `npm install` hoặc `npm run dev`.

4) Port 5173 đang bận
- Vite tự chuyển cổng (5174). Dùng đường link hiển thị trong terminal.

---

## 9. Hướng dẫn mở rộng sang Backend thật

- Thêm `src/shared/api/axiosClient.js` (hoặc dùng `src/api/axiosClient.js` – cần hợp nhất để tránh trùng lặp).
- Cập nhật `lessonService.js`:
  - Bổ sung phương thức `init(apiClient)` và bật `this.useDatabase = true`.
  - Mở lại các đoạn code gọi `this.apiClient.get('/lessons')`…
- Cập nhật `.env` với `VITE_API_BASE_URL`.
- Triển khai backend (Node/Express/Prisma hoặc service khác) trả về JSON tương thích.

---

## 10. Kiểm thử nhanh (Smoke test)

- Chạy `npm run dev` trong `frontend/` → mở app trên trình duyệt.
- Đăng nhập Admin (demo) → mở `/admin`.
- Tab "Quản lý Bài học" hiển thị danh sách seed → thử tạo/sửa/xóa → kiểm tra LocalStorage cập nhật.
- Mở Quizzes → làm thử 1 bài → xem kết quả và thống kê.

---

## 11. Gợi ý dọn dẹp & hợp nhất

- Hợp nhất axios client: `src/api/axiosClient.js` và `src/shared/api/axiosClient.js` → giữ 1 bản duy nhất.
- Hợp nhất store: `src/store/index.js` và `src/app/store/index.js` → giữ 1 entry point dùng thực tế.
- Dần di chuyển legacy pages/layouts/routes sang feature-based để đồng nhất kiến trúc.

---

## 12. Chuẩn PR & Review

- Tuân thủ eslint/prettier (nếu bổ sung sau).
- Giữ patch nhỏ, mô tả rõ thay đổi, ảnh chụp màn hình khi có UI.
- Có Smoke test mô tả: chạy, mở route, kết quả mong đợi.

---

## 13. Phụ lục: Checklist điều tra lỗi nhanh

- [ ] Xác định route/layout đang dùng (legacy hay feature-based?)
- [ ] Kiểm tra console lỗi đầu tiên
- [ ] Tìm import sai (file không tồn tại, icon sai tên)
- [ ] Kiểm tra cwd khi chạy npm (phải ở `frontend/`)
- [ ] Xóa LocalStorage khi dữ liệu giả gây xung đột
- [ ] Kiểm tra cổng Vite, dùng link đúng

---

Tài liệu này sẽ được cập nhật khi cấu trúc dự án thay đổi hoặc khi bổ sung backend/CI/CD.
