# 🐳 Hướng dẫn Setup PostgreSQL với Docker

## 📋 Mục lục

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt Docker](#cài-đặt-docker)
3. [Khởi động Database](#khởi-động-database)
4. [Kiểm tra kết nối](#kiểm-tra-kết-nối)
5. [Quản lý Database](#quản-lý-database)
6. [Các lệnh hữu ích](#các-lệnh-hữu-ích)
7. [Xử lý sự cố](#xử-lý-sự-cố)

---

## ✅ Yêu cầu hệ thống

- **Docker Desktop** (Windows/Mac) hoặc **Docker Engine** (Linux)
- **Docker Compose** (thường đi kèm với Docker Desktop)
- Ít nhất **2GB RAM** trống
- Ít nhất **5GB** dung lượng ổ đĩa

---

## 📦 Cài đặt Docker

### Windows

1. **Tải Docker Desktop:**

   - Truy cập: https://www.docker.com/products/docker-desktop/
   - Tải phiên bản Windows
   - Cài đặt và khởi động lại máy

2. **Kiểm tra cài đặt:**
   ```powershell
   docker --version
   docker-compose --version
   ```

### macOS

1. **Tải Docker Desktop:**

   - Truy cập: https://www.docker.com/products/docker-desktop/
   - Chọn phiên bản phù hợp (Intel hoặc Apple Silicon)

2. **Kiểm tra:**
   ```bash
   docker --version
   docker-compose --version
   ```

### Linux (Ubuntu/Debian)

```bash
# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài đặt Docker Compose
sudo apt-get install docker-compose-plugin

# Thêm user vào group docker (không cần sudo)
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🚀 Khởi động Database

### Bước 1: Khởi động containers

```powershell
# Từ thư mục gốc dự án
cd "c:\Users\phanb\OneDrive\Máy tính\Workspace\Project\WebGiangDayLSLamDongNew"

# Khởi động (lần đầu sẽ tải images và tạo database)
docker-compose up -d
```

**Output mong đợi:**

```
[+] Running 4/4
 ✔ Network webgiangday-network      Created
 ✔ Volume webgiangday_postgres_data Created
 ✔ Container webgiangday-postgres   Started
 ✔ Container webgiangday-pgadmin    Started
```

### Bước 2: Kiểm tra trạng thái

```powershell
# Xem containers đang chạy
docker-compose ps

# Xem logs
docker-compose logs postgres
docker-compose logs pgadmin
```

---

## 🔍 Kiểm tra kết nối

### 1. Kiểm tra PostgreSQL khởi động thành công

```powershell
# Xem logs của PostgreSQL
docker-compose logs postgres | Select-String "database system is ready"
```

Bạn sẽ thấy:

```
webgiangday-postgres | database system is ready to accept connections
```

### 2. Truy cập pgAdmin (Web UI)

1. **Mở trình duyệt:**

   ```
   http://localhost:5050
   ```

2. **Đăng nhập:**

   - Email: `admin@lamdong.edu.vn`
   - Password: `admin123`

3. **Kết nối đến server PostgreSQL:**
   - Click **Add New Server**
   - **General Tab:**
     - Name: `WebGiangDay Local`
   - **Connection Tab:**
     - Host: `postgres` (tên container)
     - Port: `5432`
     - Maintenance database: `webgiangday_db`
     - Username: `admin`
     - Password: `admin123`
   - Click **Save**

### 3. Kiểm tra dữ liệu đã seed

Trong pgAdmin, mở **Query Tool** và chạy:

```sql
-- Kiểm tra users
SELECT id, email, name, role FROM users;

-- Kiểm tra lessons
SELECT id, title, difficulty, duration FROM lessons;

-- Kiểm tra categories
SELECT * FROM categories;

-- Kiểm tra quiz questions
SELECT id, lesson_id, question_text FROM quiz_questions LIMIT 5;
```

**Kết quả mong đợi:**

- 3 users (admin, teacher, student)
- 5 lessons (Lang Biang, Djiring, Đà Lạt, Liên Khương, Bảo Lộc)
- 4 categories
- 8 quiz questions

### 4. Test kết nối từ backend

```powershell
# Từ thư mục backend
cd backend

# Cài đặt dependencies (nếu chưa)
npm install

# Test kết nối
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: 'postgresql://admin:admin123@localhost:5432/webgiangday_db' }); pool.query('SELECT NOW()', (err, res) => { console.log(err || res.rows[0]); pool.end(); })"
```

---

## 📊 Quản lý Database

### Dùng psql (Command Line)

```powershell
# Truy cập vào container PostgreSQL
docker exec -it webgiangday-postgres psql -U admin -d webgiangday_db

# Một số lệnh psql hữu ích
\dt          # Liệt kê tất cả tables
\d users     # Xem cấu trúc table users
\l           # Liệt kê databases
\q           # Thoát
```

### Backup Database

```powershell
# Backup toàn bộ database
docker exec webgiangday-postgres pg_dump -U admin webgiangday_db > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Backup chỉ schema
docker exec webgiangday-postgres pg_dump -U admin --schema-only webgiangday_db > schema_backup.sql

# Backup chỉ data
docker exec webgiangday-postgres pg_dump -U admin --data-only webgiangday_db > data_backup.sql
```

### Restore Database

```powershell
# Restore từ file backup
Get-Content backup_20250125_143000.sql | docker exec -i webgiangday-postgres psql -U admin -d webgiangday_db
```

### Reset Database (Xóa và tạo lại)

```powershell
# Dừng và xóa containers + volumes
docker-compose down -v

# Khởi động lại (sẽ chạy lại init scripts)
docker-compose up -d
```

---

## 🛠️ Các lệnh hữu ích

### Quản lý Containers

```powershell
# Khởi động
docker-compose up -d

# Dừng
docker-compose stop

# Dừng và xóa containers (giữ data)
docker-compose down

# Dừng và xóa containers + volumes (xóa hết data)
docker-compose down -v

# Khởi động lại
docker-compose restart

# Xem logs real-time
docker-compose logs -f postgres

# Xem logs 100 dòng cuối
docker-compose logs --tail=100 postgres
```

### Kiểm tra tài nguyên

```powershell
# Xem dung lượng volumes
docker volume ls
docker volume inspect webgiangday_postgres_data

# Xem resource usage
docker stats webgiangday-postgres
```

### Dọn dẹp

```powershell
# Xóa containers không dùng
docker container prune

# Xóa images không dùng
docker image prune

# Xóa volumes không dùng
docker volume prune

# Xóa tất cả (CẢNH BÁO: mất hết data)
docker system prune -a --volumes
```

---

## 🔧 Xử lý sự cố

### 1. Port 5432 đã được sử dụng

**Triệu chứng:**

```
Error: bind: address already in use
```

**Giải pháp:**

```powershell
# Kiểm tra process đang dùng port 5432
netstat -ano | findstr :5432

# Dừng PostgreSQL đang chạy trên máy (nếu có)
# Hoặc thay đổi port trong docker-compose.yml
# "5433:5432" thay vì "5432:5432"
```

### 2. Container không khởi động

```powershell
# Xem logs chi tiết
docker-compose logs postgres

# Xem health check
docker inspect webgiangday-postgres --format='{{.State.Health.Status}}'

# Vào container để debug
docker exec -it webgiangday-postgres sh
```

### 3. Không kết nối được từ backend

**Kiểm tra:**

```powershell
# 1. Container có chạy không?
docker-compose ps

# 2. Port có mở không?
Test-NetConnection -ComputerName localhost -Port 5432

# 3. Firewall có chặn không? (Windows)
# Mở Windows Defender Firewall
# Thêm inbound rule cho port 5432

# 4. Thử kết nối trực tiếp
docker exec webgiangday-postgres pg_isready -U admin
```

### 4. Data bị mất sau khi restart

**Nguyên nhân:** Dùng `docker-compose down -v` (xóa volumes)

**Giải pháp:**

- Chỉ dùng `docker-compose stop` hoặc `docker-compose down`
- Backup thường xuyên
- Volumes được lưu vĩnh viễn trừ khi dùng `-v`

### 5. Init scripts không chạy

**Nguyên nhân:** Database đã tồn tại từ trước

**Giải pháp:**

```powershell
# Xóa volume và tạo lại
docker-compose down -v
docker-compose up -d

# Hoặc chạy scripts thủ công
Get-Content database/postgresql_schema.sql | docker exec -i webgiangday-postgres psql -U admin -d webgiangday_db
Get-Content database/seed_postgresql.sql | docker exec -i webgiangday-postgres psql -U admin -d webgiangday_db
```

---

## 📝 Thông tin truy cập

### PostgreSQL Database

- **Host:** `localhost` (từ máy host) hoặc `postgres` (từ containers khác)
- **Port:** `5432`
- **Database:** `webgiangday_db`
- **Username:** `admin`
- **Password:** `admin123`
- **Connection String:** `postgresql://admin:admin123@localhost:5432/webgiangday_db`

### pgAdmin Web UI

- **URL:** http://localhost:5050
- **Email:** `admin@lamdong.edu.vn`
- **Password:** `admin123`

### Demo Accounts

| Role    | Email                  | Password   |
| ------- | ---------------------- | ---------- |
| Admin   | admin@lamdong.edu.vn   | admin123   |
| Teacher | teacher@lamdong.edu.vn | teacher123 |
| Student | student@lamdong.edu.vn | student123 |

---

## 🎯 Next Steps

1. **Setup Backend API:**

   ```powershell
   cd backend
   npm install
   # Tạo file .env với DATABASE_URL
   npm run dev
   ```

2. **Test API endpoints:**

   - GET http://localhost:4000/api/lessons
   - POST http://localhost:4000/api/auth/login

3. **Kết nối Frontend:**
   - Sửa `USE_MOCK_AUTH = false` trong `authThunks.js`
   - Thay đổi API base URL

---

## 📚 Tài liệu tham khảo

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Lưu ý:** Đây là môi trường development. Khi deploy production, cần:

- Thay đổi passwords mạnh hơn
- Sử dụng environment variables
- Setup SSL/TLS
- Cấu hình backup tự động
- Giới hạn quyền truy cập
