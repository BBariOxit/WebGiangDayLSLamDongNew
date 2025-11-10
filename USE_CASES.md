# 📋 Danh sách Use Case - Hệ thống Giảng dạy Lịch sử Lâm Đồng

## 📌 Tổng quan

Hệ thống này có **3 roles**: Admin, Teacher, Student với các use case khác nhau.

---

## 👥 Actors (Các diễn viên)

| Actor              | Mô tả                     | Quyền                  |
| ------------------ | ------------------------- | ---------------------- |
| **Admin**          | Quản trị viên hệ thống    | Toàn quyền             |
| **Teacher**        | Giáo viên                 | Quản lý nội dung riêng |
| **Student**        | Học sinh                  | Xem bài học, làm quiz  |
| **Anonymous User** | Người dùng chưa đăng nhập | Chỉ xem trang chủ      |

---

## 🔐 Authentication Use Cases (Xác thực)

### UC1: Đăng nhập

- **Actor:** Anonymous User
- **Mô tả:** Người dùng nhập email và mật khẩu để truy cập hệ thống
- **Điều kiện tiên quyết:** Tài khoản đã được đăng ký
- **Các bước:**
  1. Người dùng truy cập trang login
  2. Nhập email và mật khẩu
  3. Hệ thống xác thực thông tin
  4. Nếu đúng → Tạo JWT token → Chuyển đến Dashboard
  5. Nếu sai → Hiển thị lỗi
- **Output:** JWT token, Redirect to dashboard
- **Liên quan:** UC3 (Logout)

### UC2: Đăng ký

- **Actor:** Anonymous User
- **Mô tả:** Người dùng mới tạo tài khoản
- **Các bước:**
  1. Người dùng nhập email, mật khẩu, họ tên, role
  2. Hệ thống kiểm tra email đã tồn tại chưa
  3. Nếu có → Lỗi
  4. Nếu không → Tạo tài khoản mới
- **Output:** Tài khoản được tạo, chuyển đến trang login
- **Liên quan:** UC1 (Login)

### UC3: Đăng xuất

- **Actor:** Admin, Teacher, Student
- **Mô tả:** Người dùng thoát khỏi hệ thống
- **Các bước:**
  1. Người dùng nhấn nút Logout
  2. Hệ thống xóa JWT token
  3. Chuyển đến trang chủ
- **Output:** Quay về trang login/home
- **Liên quan:** UC1 (Login)

### UC4: Làm mới Token (Refresh Token)

- **Actor:** Hệ thống (tự động)
- **Mô tả:** Cấp lại JWT token khi hết hạn
- **Các bước:**
  1. Token sắp hết hạn
  2. Hệ thống tự động gọi API refresh
  3. Cấp token mới
- **Output:** Token mới được cấp
- **Liên quan:** UC1 (Login)

---

## 📖 Lessons Management (Bài học)

### UC5: Xem danh sách bài học (Public)

- **Actor:** Anonymous User, Student
- **Mô tả:** Xem danh sách tất cả bài học đã xuất bản
- **Các bước:**
  1. Vào trang "Bài học"
  2. Hiển thị danh sách bài học
  3. Có thể tìm kiếm, lọc, phân trang
- **Output:** Danh sách bài học
- **API:** `GET /api/lessons`
- **Liên quan:** UC6 (Xem chi tiết bài học), UC7 (Đánh dấu yêu thích)

### UC6: Xem chi tiết bài học

- **Actor:** Anonymous User, Student
- **Mô tả:** Xem nội dung chi tiết của một bài học
- **Các bước:**
  1. Nhấp vào bài học trong danh sách
  2. Hiển thị toàn bộ nội dung bài học
  3. Nếu có quiz → Hiển thị nút "Làm bài kiểm tra"
- **Output:** Chi tiết bài học (tiêu đề, nội dung, hình ảnh, v.v.)
- **API:** `GET /api/lessons/:id` hoặc `GET /api/lessons/slug/:slug`
- **Liên quan:** UC5 (Danh sách), UC9 (Làm quiz), UC7 (Bookmark)

### UC7: Đánh dấu bài học yêu thích

- **Actor:** Student
- **Mô tả:** Lưu bài học vào danh sách "Yêu thích"
- **Các bước:**
  1. Xem chi tiết bài học
  2. Nhấn nút "♥ Yêu thích"
  3. Bài học được lưu vào danh sách
- **Output:** Bài học được thêm vào bookmarks
- **API:** `POST /api/lessons/:id/bookmark`
- **Liên quan:** UC6 (Xem chi tiết)

### UC8: Tạo bài học mới (Admin/Teacher)

- **Actor:** Admin, Teacher
- **Mô tả:** Tạo bài học mới với Rich Text Editor
- **Điều kiện tiên quyết:** Người dùng đã đăng nhập với role Admin/Teacher
- **Các bước:**
  1. Vào trang "Tạo bài học mới"
  2. Điền thông tin:
     - Tiêu đề
     - Tóm tắt
     - Nội dung (dùng Rich Text Editor)
     - Danh mục
     - Chọn "Xuất bản" hay "Nháp"
  3. Nhấn "Tạo"
  4. Hệ thống lưu bài học
- **Output:** Bài học được tạo, redirect to detail page
- **API:** `POST /api/lessons`
- **Permissions:**
  - Admin: Có thể tạo bài học cho mọi người
  - Teacher: Chỉ tạo bài học riêng (owner)
- **Liên quan:** UC12 (Rich Text Editor), UC10 (Sửa bài học)

### UC9: Sửa bài học (Admin/Teacher)

- **Actor:** Admin, Teacher
- **Mô tả:** Chỉnh sửa thông tin bài học
- **Điều kiện tiên quyết:**
  - Người dùng đã đăng nhập
  - Là Admin hoặc chủ sở hữu bài học (teacher)
- **Các bước:**
  1. Vào danh sách bài học
  2. Nhấn nút "Edit" (bút chì)
  3. Sửa các trường thông tin
  4. Nhấn "Cập nhật"
  5. Hệ thống lưu thay đổi
- **Output:** Bài học được cập nhật
- **API:** `PUT /api/lessons/:id`
- **Liên quan:** UC8 (Tạo bài học), UC10 (Xóa bài học)

### UC10: Xóa bài học (Admin/Teacher)

- **Actor:** Admin, Teacher
- **Mô tả:** Xóa một bài học khỏi hệ thống
- **Điều kiện tiên quyết:**
  - Người dùng đã đăng nhập
  - Là Admin hoặc chủ sở hữu bài học
- **Các bước:**
  1. Vào danh sách bài học
  2. Nhấn nút "Delete" (thùng rác)
  3. Xác nhận xóa
  4. Hệ thống xóa bài học
- **Output:** Bài học bị xóa khỏi hệ thống
- **API:** `DELETE /api/lessons/:id`
- **Liên quan:** UC8 (Tạo), UC9 (Sửa)

### UC11: Quản lý bài học của tôi (Teacher)

- **Actor:** Teacher
- **Mô tả:** Xem danh sách bài học do chính giáo viên tạo
- **Các bước:**
  1. Đăng nhập với role Teacher
  2. Vào menu "GV: Quản lý Bài học"
  3. Hiển thị bài học do giáo viên này tạo
  4. Có thể thực hiện CRUD
- **Output:** Danh sách bài học riêng
- **API:** `GET /api/lessons?createdBy=userId`
- **Liên quan:** UC8, UC9, UC10

### UC12: Quản lý tất cả bài học (Admin)

- **Actor:** Admin
- **Mô tả:** Xem và quản lý tất cả bài học trong hệ thống
- **Các bước:**
  1. Đăng nhập với role Admin
  2. Vào menu "Admin: Quản lý Bài học"
  3. Hiển thị toàn bộ bài học
  4. Có thể thực hiện CRUD
- **Output:** Danh sách bài học toàn hệ thống
- **API:** `GET /api/lessons`
- **Liên quan:** UC8, UC9, UC10, UC11

### UC13: Xuất bản bài học (Admin/Teacher)

- **Actor:** Admin, Teacher
- **Mô tả:** Thay đổi trạng thái bài học từ "Nháp" → "Xuất bản"
- **Các bước:**
  1. Sửa bài học (UC9)
  2. Bật checkbox "Published"
  3. Cập nhật
  4. Bài học hiển thị cho học sinh
- **Output:** Bài học có thể xem được
- **API:** `PUT /api/lessons/:id` (set published = true)
- **Liên quan:** UC8 (Tạo), UC9 (Sửa)

---

## 📝 Rich Text Editor

### UC14: Sử dụng trình soạn thảo Rich Text

- **Actor:** Admin, Teacher
- **Mô tả:** Sử dụng Rich Text Editor khi tạo/sửa bài học
- **Các bước:**
  1. Nhấp vào trường "Nội dung"
  2. Rich Text Editor hiển thị
  3. Có thể:
     - **Định dạng:** Bold, Italic, Underline
     - **Tiêu đề:** H1, H2, H3, H4, H5, H6
     - **Danh sách:** Bullet list, Numbered list
     - **Link:** Chèn liên kết
     - **Hình ảnh:** Upload hình ảnh
     - **Màu chữ:** Chọn màu
     - **Căn chỉnh:** Left, Center, Right
  4. Lưu nội dung
- **Output:** HTML content được lưu
- **Liên quan:** UC8 (Tạo bài học), UC9 (Sửa bài học)

---

## 🧪 Quiz Management (Bài kiểm tra)

### UC15: Xem danh sách quiz

- **Actor:** Student
- **Mô tả:** Xem tất cả quiz có sẵn
- **Các bước:**
  1. Vào trang "Bài kiểm tra"
  2. Hiển thị danh sách quiz
  3. Có thể tìm kiếm, lọc theo bài học
- **Output:** Danh sách quiz
- **API:** `GET /api/quizzes`
- **Liên quan:** UC16 (Làm quiz), UC17 (Xem kết quả)

### UC16: Làm bài quiz

- **Actor:** Student
- **Mô tả:** Học sinh làm bài kiểm tra
- **Điều kiện tiên quyết:** Đã đăng nhập, quiz tồn tại
- **Các bước:**
  1. Vào trang quiz hoặc từ trang bài học
  2. Nhấn "Làm bài kiểm tra"
  3. Hiển thị câu hỏi lần lượt (hoặc tất cả cùng lúc)
  4. Học sinh chọn đáp án
  5. Có thể quay lại xem lại câu hỏi trước đó
  6. Nhấn "Nộp bài"
- **Output:** Quiz attempt được lưu
- **API:** `POST /api/quizzes/:lessonId/start` (tạo attempt)
- **Liên quan:** UC17 (Xem kết quả), UC18 (Nộp bài)

### UC17: Nộp bài quiz

- **Actor:** Student
- **Mô tả:** Học sinh nộp bài quiz
- **Điều kiện tiên quyết:** Đang làm quiz
- **Các bước:**
  1. Sau khi trả lời các câu hỏi
  2. Nhấn nút "Nộp bài"
  3. Hệ thống xác nhận
  4. Chuyển đến trang xem kết quả
- **Output:** Nộp bài thành công, hiển thị điểm số
- **API:** `POST /api/quizzes/:lessonId/submit`
- **Liên quan:** UC16 (Làm quiz), UC18 (Xem kết quả)

### UC18: Xem kết quả quiz

- **Actor:** Student
- **Mô tả:** Xem điểm số và kết quả chi tiết
- **Các bước:**
  1. Sau khi nộp bài
  2. Hiển thị:
     - Tổng điểm
     - Phần trăm
     - Chi tiết từng câu (đúng/sai)
     - Giải thích (nếu có)
  3. Có thể xem lại quiz cũ từ Dashboard
- **Output:** Chi tiết kết quả quiz
- **API:** `GET /api/quizzes/results/:attemptId`
- **Liên quan:** UC16 (Làm quiz), UC17 (Nộp bài)

### UC19: Tạo quiz mới (Admin/Teacher)

- **Actor:** Admin, Teacher
- **Mô tả:** Tạo một bài kiểm tra mới
- **Điều kiện tiên quyết:** Đã đăng nhập với role Admin/Teacher
- **Các bước:**
  1. Vào trang "Tạo Quiz mới"
  2. Điền thông tin:
     - Tiêu đề
     - Mô tả
     - Chọn bài học liên kết (tuỳ chọn)
  3. Nhấn "Tiếp tục" để thêm câu hỏi
- **Output:** Quiz được tạo (chưa có câu hỏi)
- **API:** `POST /api/quizzes/manage`
- **Liên quan:** UC20 (Thêm câu hỏi), UC21 (Sửa quiz), UC22 (Xóa quiz)

### UC20: Thêm câu hỏi vào quiz

- **Actor:** Admin, Teacher
- **Mô tả:** Thêm các câu hỏi cho quiz
- **Điều kiện tiên quyết:** Quiz đã được tạo
- **Các bước:**
  1. Nhấn "Thêm câu hỏi"
  2. Nhập:
     - Nội dung câu hỏi
     - Điểm số
     - Ít nhất 2 đáp án
  3. Đánh dấu câu trả lời đúng
  4. Lưu câu hỏi
  5. Có thể thêm nhiều câu hỏi
  6. Nhấn "Tạo Quiz" khi xong
- **Output:** Quiz có các câu hỏi
- **API:** `POST /api/quizzes/manage/:quizId/questions`
- **Liên quan:** UC19 (Tạo quiz)

### UC21: Sửa quiz (Admin/Teacher)

- **Actor:** Admin, Teacher
- **Mô tả:** Chỉnh sửa quiz hoặc câu hỏi
- **Điều kiện tiên quyết:**
  - Đã đăng nhập
  - Là Admin hoặc chủ sở hữu quiz
- **Các bước:**
  1. Vào danh sách quiz
  2. Nhấn "Edit"
  3. Sửa thông tin quiz hoặc câu hỏi
  4. Nhấn "Cập nhật"
- **Output:** Quiz được cập nhật
- **API:** `PUT /api/quizzes/manage/:id`
- **Liên quan:** UC19 (Tạo), UC22 (Xóa)

### UC22: Xóa quiz (Admin/Teacher)

- **Actor:** Admin, Teacher
- **Mô tả:** Xóa một quiz khỏi hệ thống
- **Điều kiện tiên quyết:**
  - Đã đăng nhập
  - Là Admin hoặc chủ sở hữu
- **Các bước:**
  1. Vào danh sách quiz
  2. Nhấn "Delete"
  3. Xác nhận xóa
  4. Quiz bị xóa
- **Output:** Quiz bị xóa khỏi hệ thống
- **API:** `DELETE /api/quizzes/manage/:id`
- **Liên quan:** UC19 (Tạo), UC21 (Sửa)

### UC23: Quản lý quiz của tôi (Teacher)

- **Actor:** Teacher
- **Mô tả:** Xem và quản lý quiz do chính giáo viên tạo
- **Các bước:**
  1. Vào menu "GV: Quản lý Quiz"
  2. Hiển thị quiz do giáo viên này tạo
  3. Có thể CRUD
- **Output:** Danh sách quiz riêng
- **API:** `GET /api/quizzes/manage?createdBy=userId`
- **Liên quan:** UC19, UC21, UC22

### UC24: Quản lý tất cả quiz (Admin)

- **Actor:** Admin
- **Mô tả:** Xem và quản lý tất cả quiz trong hệ thống
- **Các bước:**
  1. Vào menu "Admin: Quản lý Quiz"
  2. Hiển thị toàn bộ quiz
  3. Có thể CRUD
- **Output:** Danh sách quiz toàn hệ thống
- **API:** `GET /api/quizzes/manage`
- **Liên quan:** UC19, UC21, UC22, UC23

---

## 📊 Analytics & Dashboard

### UC25: Xem Dashboard cá nhân

- **Actor:** Admin, Teacher, Student
- **Mô tả:** Xem bảng điều khiển cá nhân với các thông tin liên quan
- **Các bước:**
  1. Đăng nhập
  2. Vào trang "Dashboard"
  3. Hiển thị các widget khác nhau tùy role
- **Output:** Dashboard được hiển thị
- **API:** `GET /api/analytics/dashboard`
- **Liên quan:** UC26, UC27, UC28

### UC26: Xem thống kê hệ thống (Admin)

- **Actor:** Admin
- **Mô tả:** Xem các thống kê toàn hệ thống
- **Các bước:**
  1. Vào Dashboard
  2. Xem các thống kê:
     - Tổng số users
     - Tổng bài học
     - Tổng quiz
     - Quiz được làm
     - Tỉ lệ hoàn thành
- **Output:** Thống kê hệ thống
- **API:** `GET /api/analytics/stats`
- **Liên quan:** UC25 (Dashboard)

### UC27: Xem tiến độ học tập (Student/Teacher)

- **Actor:** Student, Teacher
- **Mô tả:** Xem tiến độ học tập
- **Các bước:**
  1. Vào Dashboard
  2. Xem:
     - Bài học đã hoàn thành
     - Bài học đang học
     - Bài học chưa học
- **Output:** Tiến độ học tập
- **API:** `GET /api/analytics/progress`
- **Liên quan:** UC25 (Dashboard)

### UC28: Xem điểm số (Student/Teacher)

- **Actor:** Student, Teacher
- **Mô tả:** Xem các điểm số từ các quiz
- **Các bước:**
  1. Vào Dashboard
  2. Xem:
     - Danh sách quiz đã làm
     - Điểm số từng quiz
     - Trung bình cộng
- **Output:** Danh sách điểm số
- **API:** `GET /api/analytics/scores`
- **Liên quan:** UC25 (Dashboard), UC18 (Kết quả quiz)

---

## 🔔 Notifications (Thông báo)

### UC29: Nhận thông báo

- **Actor:** Admin, Teacher, Student
- **Mô tả:** Nhận thông báo từ hệ thống
- **Các bước:**
  1. Sự kiện xảy ra:
     - Bài học mới được xuất bản
     - Quiz mới được tạo
     - Có kết quả chấm
  2. Hệ thống gửi thông báo
  3. Người dùng thấy biểu tượng thông báo
- **Output:** Thông báo được tạo
- **API:** WebSocket hoặc polling từ `/api/notifications`
- **Liên quan:** UC30 (Xem danh sách thông báo)

### UC30: Xem danh sách thông báo

- **Actor:** Admin, Teacher, Student
- **Mô tả:** Xem danh sách thông báo
- **Các bước:**
  1. Nhấn biểu tượng chuông
  2. Hiển thị danh sách thông báo
  3. Có thể đánh dấu đã đọc
- **Output:** Danh sách thông báo
- **API:** `GET /api/notifications`
- **Liên quan:** UC29 (Nhận thông báo)

---

## 📝 Learning Engagement (Mức độ tham gia)

### UC31: Ghi nhận hoạt động học tập

- **Actor:** Hệ thống (tự động)
- **Mô tả:** Ghi nhận các hoạt động học tập của học sinh
- **Các bước:**
  1. Học sinh xem bài học → Ghi nhận
  2. Học sinh làm quiz → Ghi nhận
  3. Học sinh đạt điểm cao → Ghi nhận
- **Output:** Lịch sử hoạt động được lưu
- **API:** `POST /api/lessons/:id/engagement`
- **Liên quan:** UC27 (Tiến độ học tập)

### UC32: Đánh dấu hoàn thành bài học

- **Actor:** Student
- **Mô tả:** Đánh dấu bài học là đã hoàn thành
- **Các bước:**
  1. Sau khi xem xong bài học
  2. Nhấn "Hoàn thành bài học"
  3. Bài học được đánh dấu hoàn thành
- **Output:** Lesson completion được lưu
- **API:** `POST /api/lessons/:id/complete`
- **Liên quan:** UC6 (Xem chi tiết bài học), UC27 (Tiến độ)

---

## 🎯 Advanced Features (Tính năng nâng cao)

### UC33: Tìm kiếm bài học

- **Actor:** Anonymous User, Student
- **Mô tả:** Tìm kiếm bài học theo từ khóa
- **Các bước:**
  1. Vào trang Bài học
  2. Nhập từ khóa vào ô tìm kiếm
  3. Kết quả được hiển thị
- **Output:** Danh sách bài học phù hợp
- **API:** `GET /api/lessons?search=keyword`
- **Liên quan:** UC5 (Danh sách bài học)

### UC34: Lọc bài học theo danh mục

- **Actor:** Anonymous User, Student
- **Mô tả:** Lọc bài học theo danh mục/chủ đề
- **Các bước:**
  1. Vào trang Bài học
  2. Chọn danh mục
  3. Hiển thị bài học của danh mục đó
- **Output:** Danh sách bài học theo danh mục
- **API:** `GET /api/lessons?category=id`
- **Liên quan:** UC5 (Danh sách bài học)

### UC35: Sắp xếp quiz theo độ khó

- **Actor:** Student
- **Mô tả:** Sắp xếp quiz theo mức độ khó
- **Các bước:**
  1. Vào trang Quiz
  2. Chọn sắp xếp: "Dễ → Khó" hoặc "Khó → Dễ"
  3. Hiển thị quiz theo thứ tự
- **Output:** Danh sách quiz sắp xếp
- **API:** `GET /api/quizzes?sortBy=difficulty`
- **Liên quan:** UC15 (Danh sách quiz)

---

## 📱 Use Cases theo Data Entities

### Entities chính:

| Entity               | Description          | Attributes                                                                     |
| -------------------- | -------------------- | ------------------------------------------------------------------------------ |
| **User**             | Người dùng hệ thống  | id, email, password, name, role, created_at                                    |
| **Lesson**           | Bài học              | id, title, slug, summary, content, category, created_by, published, created_at |
| **Quiz**             | Bài kiểm tra         | id, title, description, lessonId, created_by, created_at                       |
| **Question**         | Câu hỏi              | id, quizId, content, points, created_at                                        |
| **Answer**           | Đáp án               | id, questionId, content, isCorrect                                             |
| **QuizAttempt**      | Lần làm quiz         | id, studentId, quizId, started_at, submitted_at, score                         |
| **StudentAnswer**    | Trả lời của học sinh | id, attemptId, questionId, answerId                                            |
| **LessonCompletion** | Hoàn thành bài học   | id, studentId, lessonId, completed_at                                          |
| **Bookmark**         | Bài học yêu thích    | id, studentId, lessonId, created_at                                            |
| **Notification**     | Thông báo            | id, userId, message, read_at, created_at                                       |

---

## 🔗 Use Case Dependencies

### Chuỗi Use Cases (Flow):

**Flow 1: Học sinh học bài**

```
Login (UC1)
  → Xem danh sách bài học (UC5)
  → Xem chi tiết bài học (UC6)
  → Đánh dấu yêu thích (UC7)
  → Hoàn thành bài học (UC32)
```

**Flow 2: Học sinh làm quiz**

```
Login (UC1)
  → Xem danh sách quiz (UC15)
  → Làm bài quiz (UC16)
  → Nộp bài (UC17)
  → Xem kết quả (UC18)
```

**Flow 3: Giáo viên tạo bài học**

```
Login (UC1)
  → Tạo bài học mới (UC8)
  → Sử dụng Rich Text Editor (UC14)
  → Xuất bản (UC13)
  → Quản lý bài học (UC11)
```

**Flow 4: Giáo viên tạo quiz**

```
Login (UC1)
  → Tạo quiz mới (UC19)
  → Thêm câu hỏi (UC20)
  → Quản lý quiz (UC23)
```

**Flow 5: Admin quản lý toàn bộ**

```
Login (UC1)
  → Xem Dashboard (UC25)
  → Xem thống kê (UC26)
  → Quản lý bài học (UC12)
  → Quản lý quiz (UC24)
```

---

## 📊 Sơ đồ Actors - Use Cases

```
┌─────────────────────────────────────────────────────────────────┐
│                    Actors                                       │
│  ┌──────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │
│  │  Admin   │  │ Teacher │  │ Student │  │ Anonymous User  │  │
│  └──────────┘  └─────────┘  └─────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────── Authentication ──────────────────────────┐
│  UC1: Login           UC2: Register      UC3: Logout            │
│  UC4: Refresh Token                                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────── Lessons ──────────────────────────────────┐
│  UC5: View List       UC6: View Detail   UC7: Bookmark           │
│  UC8: Create          UC9: Update        UC10: Delete            │
│  UC11: My Lessons     UC12: All Lessons  UC13: Publish           │
│  UC33: Search         UC34: Filter       UC14: Rich Text Editor  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────── Quizzes ──────────────────────────────────┐
│  UC15: View List      UC16: Take Quiz    UC17: Submit            │
│  UC18: View Result    UC19: Create       UC20: Add Questions     │
│  UC21: Update         UC22: Delete       UC23: My Quizzes        │
│  UC24: All Quizzes    UC35: Sort by Difficulty                   │
└─────────────────────────────────────────────────────────────────┘

┌────────────────── Analytics & Dashboard ────────────────────────┐
│  UC25: Dashboard      UC26: Stats        UC27: Progress          │
│  UC28: Scores                                                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────── Learning Engagement ────────────────────────┐
│  UC29: Receive Notifications  UC30: View Notifications          │
│  UC31: Track Activity        UC32: Mark Complete                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Mapping: Use Cases → API Endpoints

| Use Case | HTTP Method | Endpoint                          | Role          |
| -------- | ----------- | --------------------------------- | ------------- |
| UC1      | POST        | `/api/auth/login`                 | Public        |
| UC2      | POST        | `/api/auth/register`              | Public        |
| UC3      | POST        | `/api/auth/logout`                | Auth          |
| UC4      | POST        | `/api/auth/refresh`               | Auth          |
| UC5      | GET         | `/api/lessons`                    | Public        |
| UC6      | GET         | `/api/lessons/:id`                | Public        |
| UC7      | POST        | `/api/lessons/:id/bookmark`       | Student       |
| UC8      | POST        | `/api/lessons`                    | Admin/Teacher |
| UC9      | PUT         | `/api/lessons/:id`                | Admin/Teacher |
| UC10     | DELETE      | `/api/lessons/:id`                | Admin/Teacher |
| UC13     | PUT         | `/api/lessons/:id`                | Admin/Teacher |
| UC15     | GET         | `/api/quizzes`                    | Public        |
| UC16     | POST        | `/api/quizzes/:id/start`          | Student       |
| UC17     | POST        | `/api/quizzes/:id/submit`         | Student       |
| UC18     | GET         | `/api/quizzes/results/:attemptId` | Student       |
| UC19     | POST        | `/api/quizzes/manage`             | Admin/Teacher |
| UC20     | POST        | `/api/quizzes/:id/questions`      | Admin/Teacher |
| UC21     | PUT         | `/api/quizzes/manage/:id`         | Admin/Teacher |
| UC22     | DELETE      | `/api/quizzes/manage/:id`         | Admin/Teacher |
| UC25     | GET         | `/api/analytics/dashboard`        | Auth          |
| UC26     | GET         | `/api/analytics/stats`            | Admin         |
| UC27     | GET         | `/api/analytics/progress`         | Auth          |
| UC28     | GET         | `/api/analytics/scores`           | Auth          |
| UC29     | GET/POST    | `/api/notifications`              | Auth          |
| UC31     | POST        | `/api/lessons/:id/engagement`     | Student       |
| UC32     | POST        | `/api/lessons/:id/complete`       | Student       |
| UC33     | GET         | `/api/lessons?search=keyword`     | Public        |
| UC34     | GET         | `/api/lessons?category=id`        | Public        |
| UC35     | GET         | `/api/quizzes?sortBy=difficulty`  | Public        |

---

## 📌 Tóm tắt

- **Tổng cộng:** 35 Use Cases
- **Authentication:** 4 UC
- **Lessons:** 14 UC
- **Quizzes:** 10 UC
- **Analytics:** 4 UC
- **Notifications:** 2 UC
- **Engagement:** 2 UC
- **Advanced:** 3 UC (tìm kiếm, lọc, sắp xếp)

---

## 🎯 Priority (Ưu tiên triển khai)

### **P0 - Critical (bắt buộc)**

- UC1, UC2, UC3 (Auth)
- UC5, UC6, UC8, UC9, UC10 (Lessons CRUD)
- UC15, UC16, UC17, UC18 (Quiz take & submit)
- UC19, UC20, UC21, UC22 (Quiz CRUD)

### **P1 - High**

- UC25, UC26, UC27, UC28 (Dashboard)
- UC11, UC12, UC23, UC24 (Management)
- UC14 (Rich Text Editor)
- UC29, UC30 (Notifications)

### **P2 - Medium**

- UC7, UC32 (Bookmarks, Completion)
- UC31 (Activity tracking)
- UC33, UC34, UC35 (Search, Filter, Sort)

### **P3 - Low**

- UC4 (Refresh token - tuỳ vào strategy)
- UC13 (Publish - có thể merge với UC9)

---

**Tài liệu này cập nhật lần cuối: November 10, 2025**
