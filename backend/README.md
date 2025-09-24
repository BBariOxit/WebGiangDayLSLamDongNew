# Backend - Giảng dạy Lịch sử Lâm Đồng

## Yêu cầu

- Node.js >= 18
- SQL Server đã tạo schema (xem thư mục `../database`)

## Cài đặt

```bash
cp .env.example .env
# Chỉnh sửa thông tin DB, JWT secrets, GOOGLE_CLIENT_ID
npm install
npm run dev
```

Server mặc định chạy: `http://localhost:4000`

## Endpoint Auth

| Method | Path               | Body                             | Mô tả                         |
| ------ | ------------------ | -------------------------------- | ----------------------------- |
| POST   | /api/auth/register | { email, password, name, role? } | Đăng ký (Teacher => Pending)  |
| POST   | /api/auth/login    | { email, password }              | Đăng nhập local               |
| POST   | /api/auth/google   | { idToken }                      | Đăng nhập qua Google ID Token |
| POST   | /api/auth/refresh  | { refreshToken }                 | Cấp lại access token          |
| POST   | /api/auth/logout   | { refreshToken }                 | Thu hồi refresh token         |
| GET    | /health            | -                                | Kiểm tra sống                 |

## Endpoint Lessons

| Method | Path             | Body / Query                                     | Auth                   | Mô tả                      |
| ------ | ---------------- | ------------------------------------------------ | ---------------------- | -------------------------- |
| GET    | /api/lessons     | ?q=&published=1                                  | Public                 | Danh sách bài học (filter) |
| GET    | /api/lessons/:id | -                                                | Public                 | Xem chi tiết bài học       |
| POST   | /api/lessons     | { title, summary?, contentHtml?, isPublished? }  | Bearer (Teacher/Admin) | Tạo mới                    |
| PUT    | /api/lessons/:id | { title?, summary?, contentHtml?, isPublished? } | Bearer (Owner/Admin)   | Cập nhật                   |
| DELETE | /api/lessons/:id | -                                                | Bearer (Owner/Admin)   | Xoá                        |

Bearer token truyền qua header: `Authorization: Bearer <accessToken>`

## Ghi chú Bảo mật

- Lưu mật khẩu: bcrypt (salt rounds từ env)
- Refresh token rotation (cơ bản) — TODO: bổ sung field Email vào truy vấn refresh để đầy đủ user context.
- Khi triển khai Google cần verify từ frontend: lấy credential từ Google Identity Services -> gửi idToken lên backend.

## Roadmap tiếp

- Thêm middleware kiểm tra JWT (access token) cho các module khác. (ĐÃ thêm: `verifyAccess`)
- Thêm endpoint xác minh email / quên mật khẩu (dùng bảng VerificationTokens).
- Thêm audit log (ghi bảng ActivityLogs).
- Tách cấu hình logger & error codes chuẩn hoá.

## Cấu trúc chính

```
src/
  app.js            # Khởi tạo express
  server.js         # Lắng nghe cổng
  config/           # Cấu hình DB & pool
  modules/auth/     # Auth module
    controllers/
    services/
    repositories/
    utils/
  middlewares/
  utils/
```

## Kiểm thử nhanh bằng curl

```bash
curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" \
  -d '{"email":"student1@test.com","password":"123456","name":"Student 1"}'
```
