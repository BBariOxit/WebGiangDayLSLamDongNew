# Frontend - Giảng dạy Lịch sử Lâm Đồng

Giao diện React xây với Vite + Material UI + React Router + Redux Toolkit.

## Chạy dự án

Trong PowerShell (thư mục `frontend`):

```powershell
# Cài dependencies
npm install

# Chạy dev server
npm run dev

# Build production
npm run build

# Xem bản build
npm run preview
```

## Cấu trúc chính

- `src/styles/theme.js`: chủ đề MUI (màu sắc, typography)
- `src/layouts/MainLayout.jsx`: Navbar + Sidebar + vùng nội dung
- `src/pages/{Home,Login,Register}.jsx`: Trang Home, Login, Register đang dùng

Bạn có thể bắt đầu phát triển các module Student/Teacher/Admin trong `src/features`.
