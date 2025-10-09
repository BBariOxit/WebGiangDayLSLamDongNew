# 🚀 QUICK START GUIDE - Setup Backend & Database

## ✅ Bạn đã có:

- ✅ Docker Desktop chạy
- ✅ PostgreSQL container đang chạy
- ✅ Database có 13 tables với sample data
- ✅ Files backend đã được tạo

---

## 📋 BÂY GIỜ LÀM THEO CÁC BƯỚC SAU:

### BƯỚC 1: Install Root Dependencies

```powershell
cd "C:\Users\phanb\OneDrive\Máy tính\Workspace\Project\WebGiangDayLSLamDongNew"
npm install
```

**Kết quả:** Cài đặt `concurrently` package

---

### BƯỚC 2: Install Backend Dependencies

```powershell
cd backend
npm install
```

**Kết quả:** Cài đặt express, cors, dotenv, pg, và các packages khác

---

### BƯỚC 3: Start Backend Server

```powershell
# Cách 1: Từ thư mục backend
cd backend
npm run dev:simple

# Cách 2: Từ thư mục root
cd ..
npm run backend
```

**Kết quả mong đợi:**

```
======================================================================
🚀 WebGiangDay API Server Started Successfully!
======================================================================
📍 Server running on: http://localhost:4000
🌍 Environment: development
⏰ Started at: 08/10/2024, 20:30:00
======================================================================
📊 Available Endpoints:
   → Root:        http://localhost:4000/
   → Health:      http://localhost:4000/api/health
   → DB Test:     http://localhost:4000/api/db-test
   → Users:       http://localhost:4000/api/db-users
   → Lessons:     http://localhost:4000/api/db-lessons
   → Stats:       http://localhost:4000/api/db-stats
======================================================================
💾 Database Info:
   → PostgreSQL:  localhost:5432
   → Database:    webgiangday_db
   → pgAdmin:     http://localhost:5050
   → Login:       admin@lamdong.edu.vn / admin123
======================================================================
🎯 Ready to accept connections!
======================================================================
✅ New client connected to PostgreSQL
✅ Database connected successfully at: 2024-10-08T...
```

---

### BƯỚC 4: Test API Endpoints

**Mở browser mới** (giữ terminal backend chạy):

#### Test 1: Root Endpoint

```
http://localhost:4000/
```

✅ Phải thấy JSON response với danh sách endpoints

#### Test 2: Health Check

```
http://localhost:4000/api/health
```

✅ Phải thấy `"database": "Connected"`

#### Test 3: Database Test

```
http://localhost:4000/api/db-test
```

✅ Phải thấy:

```json
{
  "success": true,
  "message": "Database connection successful! 🎉",
  "data": {
    "totalUsers": 3,
    "totalLessons": 5,
    "totalCategories": 4,
    "totalAchievements": 5,
    "totalQuestions": 8
  }
}
```

#### Test 4: Get Users

```
http://localhost:4000/api/db-users
```

✅ Phải thấy danh sách 3 users (Admin, Teacher, Student)

#### Test 5: Get Lessons

```
http://localhost:4000/api/db-lessons
```

✅ Phải thấy danh sách 5 lessons về Lâm Đồng

#### Test 6: Database Statistics

```
http://localhost:4000/api/db-stats
```

✅ Phải thấy thống kê 13 tables

---

## 🎯 KIỂM TRA HOÀN CHỈNH

Checklist:

- [ ] `npm install` ở root thành công
- [ ] `npm install` ở backend thành công
- [ ] Backend start không có lỗi
- [ ] Thấy dòng "✅ Database connected successfully"
- [ ] http://localhost:4000/ mở được
- [ ] http://localhost:4000/api/health → Connected
- [ ] http://localhost:4000/api/db-test → totalUsers: 3
- [ ] http://localhost:4000/api/db-users → 3 users
- [ ] http://localhost:4000/api/db-lessons → 5 lessons

---

## 🚨 Nếu có lỗi:

### Lỗi: "Cannot find module 'express'"

```powershell
cd backend
npm install
```

### Lỗi: "ECONNREFUSED" hoặc "Database connection failed"

```powershell
# Kiểm tra Docker
docker ps

# Khởi động lại PostgreSQL
docker-compose restart postgres

# Xem logs
docker-compose logs postgres
```

### Lỗi: Port 4000 đã được sử dụng

```powershell
# Tìm process đang dùng port 4000
netstat -ano | findstr :4000

# Hoặc thay đổi port trong backend/.env
# PORT=4001
```

---

## 📚 Files đã tạo:

1. ✅ `backend/src/config/database.cjs` - Database connection & helpers
2. ✅ `backend/src/routes/health.cjs` - Health check & test endpoints
3. ✅ `backend/server-simple.cjs` - Main server file
4. ✅ `backend/package.json` - Updated với scripts mới
5. ✅ `package.json` (root) - Helper scripts
6. ✅ `API_ENDPOINTS.md` - API documentation
7. ✅ `DATABASE_CHECK_GUIDE.md` - Database verification guide
8. ✅ `DOCKER_SETUP_GUIDE.md` - Docker setup guide
9. ✅ `verify-database.ps1` - Database verification script

---

## 🎉 SAU KHI TẤT CẢ OK:

Bạn sẽ có:

- ✅ PostgreSQL chạy trong Docker
- ✅ Backend API kết nối thành công với database
- ✅ 6 test endpoints hoạt động
- ✅ Sample data (3 users, 5 lessons, 8 questions...)

**Tiếp theo tôi sẽ tạo:**

1. Auth API (Login, Register, JWT)
2. Lessons API (CRUD operations)
3. Quizzes API (Take quiz, submit answers)
4. Kết nối Frontend với real API

---

## 💡 Helper Commands (sau khi install xong):

```powershell
# Start tất cả (Database + Backend + Frontend)
npm run dev:all

# Start chỉ Database + Backend
npm run dev:backend

# Stop database
npm run db:stop

# Xem database logs
npm run db:logs

# Vào PostgreSQL shell
npm run db:shell

# Kiểm tra database
npm run db:verify
```

---

**Bây giờ hãy làm theo BƯỚC 1 và BƯỚC 2, sau đó báo tôi!** 🚀
