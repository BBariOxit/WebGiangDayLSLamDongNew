# 📊 KIỂM TRA DATABASE - Hướng dẫn từng bước

## ✅ Bước 1: Kiểm tra Docker containers đang chạy

```powershell
docker ps
```

**Kết quả mong đợi:**

```
CONTAINER ID   IMAGE                      STATUS         PORTS
xxxxx          postgres:15-alpine         Up (healthy)   0.0.0.0:5432->5432/tcp
xxxxx          dpage/pgadmin4:latest      Up             0.0.0.0:5050->80/tcp
```

---

## ✅ Bước 2: Vào PostgreSQL shell

```powershell
docker exec -it webgiangday-postgres psql -U admin -d webgiangday_db
```

---

## ✅ Bước 3: Kiểm tra các tables

### 3.1. Liệt kê tất cả tables

```sql
\dt
```

**Kết quả mong đợi: 13 tables**

```
 achievements
 categories
 learning_paths
 lesson_ratings
 lessons
 path_lessons
 quiz_answers
 quiz_attempts
 quiz_questions
 user_achievements
 user_lesson_progress
 user_path_progress
 users
```

### 3.2. Xem cấu trúc table users

```sql
\d users
```

**Lưu ý:** Column là `name`, **KHÔNG PHẢI** `full_name`

---

## ✅ Bước 4: Kiểm tra dữ liệu

### 4.1. Kiểm tra Users (✅ ĐÚNG)

```sql
SELECT id, name, email, role FROM users;
```

**Kết quả mong đợi:**

```
                  id                  |       name       |          email          |  role
--------------------------------------+------------------+-------------------------+---------
 a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11 | Admin Hệ thống   | admin@lamdong.edu.vn    | admin
 b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22 | GV. Nguyễn Văn A | teacher@lamdong.edu.vn  | teacher
 c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33 | HS. Trần Thị B   | student@lamdong.edu.vn  | student
```

### 4.2. Kiểm tra Categories

```sql
SELECT * FROM categories ORDER BY sort_order;
```

**Kết quả mong đợi: 4 categories**

```
 id |       name        |      slug         | color    | sort_order
----+-------------------+-------------------+----------+------------
  1 | Lịch sử địa phương | lich-su-dia-phuong | #1976d2  | 1
  2 | Văn hóa bản địa    | van-hoa-ban-dia    | #388e3c  | 2
  3 | Địa lý Lâm Đồng    | dia-ly-lam-dong    | #f57c00  | 3
  4 | Kinh tế - Xã hội   | kinh-te-xa-hoi     | #7b1fa2  | 4
```

### 4.3. Kiểm tra Lessons

```sql
SELECT id, title, difficulty, duration, category_id FROM lessons ORDER BY id;
```

**Kết quả mong đợi: 5 lessons**

```
 id | title                                              | difficulty | duration | category_id
----+----------------------------------------------------+------------+----------+-------------
  1 | Lang Biang: Nền văn hóa bản địa...                 | Cơ bản     | 25       | 1
  2 | Djiring (Di Linh): Cửa ngõ khai phá...             | Cơ bản     | 20       | 1
  3 | Đà Lạt: Trung tâm khí hậu – hành chính...          | Trung bình | 35       | 1
  4 | Liên Khương: Hạ tầng kết nối chiến lược            | Cơ bản     | 18       | 1
  5 | Bảo Lộc (Blao): Trục nông – công nghiệp chế biến   | Trung bình | 22       | 1
```

### 4.4. Kiểm tra Quiz Questions

```sql
SELECT id, lesson_id, LEFT(question_text, 50) as question, difficulty, points
FROM quiz_questions
ORDER BY lesson_id, question_order;
```

**Kết quả mong đợi: 8 questions**

### 4.5. Kiểm tra Achievements

```sql
SELECT name, description, requirement_type, requirement_value FROM achievements;
```

**Kết quả mong đợi: 5 achievements**

### 4.6. Đếm tổng dữ liệu

```sql
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM lessons) as total_lessons,
  (SELECT COUNT(*) FROM quiz_questions) as total_questions,
  (SELECT COUNT(*) FROM achievements) as total_achievements;
```

**Kết quả mong đợi:**

```
 total_users | total_categories | total_lessons | total_questions | total_achievements
-------------+------------------+---------------+-----------------+--------------------
      3      |        4         |       5       |        8        |         5
```

---

## ✅ Bước 5: Thoát PostgreSQL shell

```sql
\q
```

---

## 🌐 Bước 6: Truy cập pgAdmin (Giao diện web)

### 6.1. Mở trình duyệt

Truy cập: **http://localhost:5050**

### 6.2. Đăng nhập

- **Email**: `admin@lamdong.edu.vn`
- **Password**: `admin123`

### 6.3. Thêm Server (nếu chưa có)

**Add New Server:**

**General Tab:**

- Name: `WebGiangDay Local`

**Connection Tab:**

- Host: `postgres`
- Port: `5432`
- Maintenance database: `webgiangday_db`
- Username: `admin`
- Password: `admin123`
- ✅ Save password

### 6.4. Browse Database

**Servers** → **WebGiangDay Local** → **Databases** → **webgiangday_db** → **Schemas** → **public** → **Tables**

Bạn sẽ thấy 13 tables!

### 6.5. Query Tool

Click chuột phải vào `webgiangday_db` → **Query Tool**

Chạy query:

```sql
-- Xem tất cả users
SELECT * FROM users;

-- Xem tất cả lessons
SELECT id, title, difficulty, duration FROM lessons;

-- Xem lessons kèm category
SELECT
  l.id,
  l.title,
  c.name as category_name,
  l.difficulty,
  l.duration
FROM lessons l
LEFT JOIN categories c ON l.category_id = c.id
ORDER BY l.id;
```

---

## 🔧 Troubleshooting

### Lỗi: Column "full_name" does not exist

**Nguyên nhân:** Column đúng là `name`, không phải `full_name`

**Giải pháp:** Sửa query thành:

```sql
SELECT id, name, email, role FROM users;  -- ✅ ĐÚNG
-- KHÔNG dùng: SELECT id, full_name, email, role FROM users;  -- ❌ SAI
```

### Không có dữ liệu trong tables

**Nguyên nhân:** Init scripts chưa chạy

**Giải pháp:**

```powershell
# 1. Stop containers
docker-compose down -v

# 2. Start lại (sẽ chạy init scripts)
docker-compose up -d

# 3. Xem logs
docker-compose logs postgres | Select-String "seed"
```

### Port 5432 đã được sử dụng

**Giải pháp:**

```powershell
# Kiểm tra process nào đang dùng port
netstat -ano | findstr :5432

# Dừng PostgreSQL khác nếu có
# Hoặc thay đổi port trong docker-compose.yml
```

---

## 📝 Thông tin đăng nhập

### PostgreSQL

- **Host**: `localhost` (từ máy) hoặc `postgres` (từ containers)
- **Port**: `5432`
- **Database**: `webgiangday_db`
- **Username**: `admin`
- **Password**: `admin123`

### pgAdmin

- **URL**: http://localhost:5050
- **Email**: `admin@lamdong.edu.vn`
- **Password**: `admin123`

### Demo Accounts (trong database)

| Role    | Email                  | Password   | Name             |
| ------- | ---------------------- | ---------- | ---------------- |
| Admin   | admin@lamdong.edu.vn   | admin123   | Admin Hệ thống   |
| Teacher | teacher@lamdong.edu.vn | teacher123 | GV. Nguyễn Văn A |
| Student | student@lamdong.edu.vn | student123 | HS. Trần Thị B   |

---

## ✅ Checklist hoàn chỉnh

- [ ] Docker Desktop đang chạy
- [ ] 2 containers UP (postgres + pgadmin)
- [ ] Vào được PostgreSQL shell
- [ ] Thấy 13 tables khi chạy `\dt`
- [ ] Query `SELECT * FROM users` trả về 3 users
- [ ] Query `SELECT * FROM lessons` trả về 5 lessons
- [ ] pgAdmin mở được tại http://localhost:5050
- [ ] Kết nối server thành công trong pgAdmin
- [ ] Xem được data trong pgAdmin

---

## 🚀 Next Steps

Sau khi kiểm tra database OK:

1. ✅ **Test backend connection**
2. ✅ **Tạo API endpoints**
3. ✅ **Connect frontend to API**

---

**LƯU Ý QUAN TRỌNG:**

⚠️ Column name trong table `users` là `name` KHÔNG PHẢI `full_name`

Luôn dùng:

```sql
SELECT id, name, email, role FROM users;  -- ✅ ĐÚNG
```

Không dùng:

```sql
SELECT id, full_name, email, role FROM users;  -- ❌ SAI
```
