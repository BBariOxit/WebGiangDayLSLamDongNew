# Hướng dẫn Setup pgAdmin để Quản lý Database

pgAdmin là công cụ web để quản lý PostgreSQL - xem bảng, chỉnh sửa dữ liệu, chạy query mà không cần Prisma.

## Bước 1: Chạy pgAdmin bằng Docker

### Yêu cầu:

- Docker Desktop đã cài đặt

### Lệnh chạy:

```powershell
docker run -d `
  --name pgadmin `
  -p 5050:80 `
  -e PGADMIN_DEFAULT_EMAIL=admin@example.com `
  -e PGADMIN_DEFAULT_PASSWORD=admin `
  dpage/pgadmin4
```

**Hoặc nếu cần tắt container trước:**

```powershell
# Tắt container cũ nếu có
docker stop pgadmin 2>$null
docker rm pgadmin 2>$null

# Chạy lại
docker run -d --name pgadmin -p 5050:80 -e PGADMIN_DEFAULT_EMAIL=admin@example.com -e PGADMIN_DEFAULT_PASSWORD=admin dpage/pgadmin4
```

### Kiểm tra chạy thành công:

```powershell
docker ps | findstr pgadmin
```

Nếu thấy `pgadmin` trong danh sách → OK ✓

---

## Bước 2: Truy cập pgAdmin

1. Mở trình duyệt: **http://localhost:5050**
2. Đăng nhập:
   - Email: `admin@example.com`
   - Password: `admin`
3. Nhấn "Login"

---

## Bước 3: Kết nối PostgreSQL Database

### Thêm Server mới:

1. **Right-click** vào **"Servers"** ở sidebar trái → **"Register" → "Server"**

2. Tab **"General"**:

   - **Name**: `WebGiangDay` (tên gọi)

3. Tab **"Connection"**:

   - **Host name/address**: `host.docker.internal` (để Docker connect host machine)

     - _Nếu PG chạy trên máy bạn, dùng `host.docker.internal`_
     - _Nếu PG chạy trong Docker, dùng IP container PostgreSQL hoặc service name_

   - **Port**: `5432` (mặc định PostgreSQL)

   - **Maintenance database**: `postgres`

   - **Username**: _(username của DB, mặc định `postgres`)_

   - **Password**: _(password của DB)_

   - **Save password?** ✓ (tích để lưu)

4. Nhấn **"Save"**

### Nếu lỗi kết nối:

- **Lỗi "could not resolve hostname"**: Kiểm tra host name
- **Lỗi "FATAL: role does not exist"**: Kiểm tra username/password
- **Lỗi connection refused**: Kiểm tra PostgreSQL đang chạy

---

## Bước 4: Duyệt Database

Sau khi kết nối thành công:

1. **Servers** → **WebGiangDay** → **Databases** → **[tên_database]** (ví dụ: `web_giang_day`)
2. Expand các mục:
   - **Schemas** → **public** → **Tables**: xem danh sách bảng
   - Click vào bảng (ví dụ: `users`, `quizzes`, `quiz_questions`) → **Data** → xem/sửa dữ liệu

---

## Bước 5: Chạy Query

1. Nhấn **Tools** → **Query Tool** (hoặc `Ctrl+Shift+Q`)
2. Viết SQL query:
   ```sql
   SELECT * FROM quizzes;
   SELECT * FROM quiz_questions WHERE quiz_id = 1;
   ```
3. Nhấn **Execute** (`F5`) hoặc nút Play

---

## Thao tác thường dùng

### Xem dữ liệu bảng:

- Click vào tên bảng → **Data** → **View Data**

### Chỉnh sửa dữ liệu:

- Click dòng data → **Edit** (hoặc double-click ô) → **Save**

### Xóa dữ liệu:

- Right-click dòng → **Delete**

### Tạo bảng mới:

- Right-click **Tables** → **Create** → **Table**

### Xem structure bảng:

- Click tên bảng → **Columns** tab

---

## Dừng pgAdmin

```powershell
# Dừng container
docker stop pgadmin

# Xóa hoàn toàn
docker rm pgadmin
```

---

## Mẹo

- **Nếu muốn pgAdmin chạy ở port khác**: Thay `5050:80` thành `[port_khác]:80`

  ```powershell
  docker run -d --name pgadmin -p 8888:80 ... # sẽ chạy ở localhost:8888
  ```

- **Lưu configuration**: pgAdmin tự lưu setting, lần sau chỉ cần `docker start pgadmin`

- **Xem logs nếu lỗi**:
  ```powershell
  docker logs pgadmin
  ```

---

## Kiểm tra Database đang chạy

Nếu không biết credential PostgreSQL của mình:

### Tìm trong docker (nếu PG chạy bằng Docker):

```powershell
docker ps | findstr postgres
docker inspect [container_id]  # xem ENV variables
```

### Tìm trong `.env` hoặc config backend:

```
cat backend/.env | findstr DB_
```

Sẽ thấy:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=web_user
DB_PASSWORD=...
DB_NAME=web_giang_day
```

---

## Ghi chú:

- pgAdmin **không thay đổi code** - chỉ dùng để xem/test dữ liệu
- Backend vẫn dùng raw SQL queries - pgAdmin chỉ là công cụ quản trị
- Có thể tắt pgAdmin khi không dùng để tiết kiệm tài nguyên
