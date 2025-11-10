# WebGiangDayLSLamDongNew

A React + Vite frontend (and backend folder stub) for "Hệ thống Giảng dạy Lịch sử Lâm Đồng" with an Admin dashboard, lessons management (CRUD via localStorage), and quizzes. This README focuses on getting the frontend running quickly and troubleshooting common issues observed in this repo.

## Contents
- Overview
- Project Structure
- Prerequisites
- Environment Variables
- Install & Run
- Demo Accounts
- Features
- Routing Map (active UI)
- Data & Storage
- Troubleshooting (white screen, import errors, ports)
- Common Tasks
- Next Steps

## Overview
- Frontend: React 18, Vite 5, MUI 6, React Router v6, Redux Toolkit (auth slice present).
- Data: LocalStorage-first services for lessons and quizzes (mock), optional backend later.
- Goal: Provide a working Admin dashboard with Lessons CRUD and a clean dev experience.

## Project Structure
```
webGDLSLD/
├─ frontend/                  # React app
│  ├─ src/
│  │  ├─ pages/               # Legacy pages used at runtime
│  │  ├─ layouts/             # Legacy AppLayout used at runtime
│  │  ├─ routes/              # Legacy router used at runtime
│  │  ├─ contexts/            # Legacy AuthContext (AuthProvider + useAuth)
│  │  ├─ features/            # New feature-based modules
│  │  │  ├─ admin/
│  │  │  │  ├─ pages/LessonsManagement.jsx   # Active admin lessons view
│  │  │  │  └─ pages/QuizzesManagement.jsx   # Active admin quizzes view
│  │  │  └─ teacher/
│  │  │     └─ pages/MyQuizzes.jsx           # Reuses admin quizzes UI for teachers
│  │  └─ shared/
│  │     ├─ api/              # LocalStorage-first services
│  │     │  ├─ quizService.js
│  │     │  └─ lessonService.js (localStorage by default)
│  │     ├─ constants/appConfig.js
│  │     └─ utils/helpers.js
│  ├─ package.json
│  └─ vite.config.js
└─ backend/                   # Placeholder (not required for dev)
```

Note: Both legacy (pages/layouts/routes/contexts) and new (features/app/shared) structures exist. The legacy router/layout are currently active entry points.

## Prerequisites
- Node.js 18+ (recommended LTS)
- npm 9+
- Windows users: run commands inside the `frontend` folder (not the repo root) to avoid npm errors about missing package.json at root.

## Environment Variables
Create `frontend/.env` (or use `.env.example` as reference) if needed:
```
VITE_API_BASE_URL=http://localhost:4000/api
```
For now, services default to localStorage and do not require a backend.

## Install & Run
From Windows PowerShell:

```
# 1) Install deps (inside frontend)
cd frontend
npm install

# 2) Start dev server
npm run dev
# Vite will run on http://localhost:5173 (or auto-switch to :5174 if busy)
```

If a previous terminal shows npm errors about missing package.json, ensure your working directory is `webGDLSLD/frontend` before running npm commands.

## Demo Accounts
Use the Login page quick buttons or enter manually:
- Admin
  - Email: admin@lamdong.edu.vn
  - Password: admin123
- Teacher
  - Email: teacher@lamdong.edu.vn
  - Password: teacher123
- Student
  - Email: student@lamdong.edu.vn
  - Password: student123

After login as Admin, the left menu shows "Bảng điều khiển Admin".

## Features
- Admin Dashboard
  - Lessons management (CRUD)
  - Quiz stats preview
- Lessons
  - List & detail pages
- Quizzes
  - Listing, taking quizzes, and viewing results

## Routing Map (active UI)
The app uses the legacy router at `src/routes/index.jsx` and layout at `src/layouts/AppLayout.jsx`. Key routes:
- `/` Home (public)
- `/login`, `/register` (public; redirect to `/dashboard` when logged in)
- `/lessons` (public with layout)
- `/dashboard` (protected)
- `/quizzes`, `/quizzes/take/:id`, `/quizzes/results/:attemptId` (protected)
- `/teacher/quizzes` (protected; teacher)
- `/admin/lessons`, `/admin/quizzes`, `/admin/create-quiz` (protected; admin management views)
- `/admin/create-quiz`, `/admin/quizzes` (protected; legacy admin pages)

## Data & Storage
- `src/shared/api/quizService.js`: LocalStorage-backed quizzes + attempts. Seeds initial quizzes if empty.
- `src/shared/api/lessonService.js`: LocalStorage-backed lessons. Seeds two sample lessons if empty. Designed to optionally support a backend later by injecting a client.
- Keys are versioned in `src/shared/constants/appConfig.js`:
  - `app_quizzes_v3`, `app_quiz_attempts_v3`, `app_lessons_v3`, etc.

## Troubleshooting

### 1) White screen after navigation
- Open the browser console (F12) and check the first red error.
- Common causes fixed in this repo:
  - Invalid MUI icon imports (e.g., `Draft` doesn’t exist; use `Archive` or other icons).
  - Accidental imports to non-existent files such as `./client.js` from services.

### 2) Vite import error: Failed to resolve import './client.js' from quizService.js or lessonService.js
- Ensure `src/shared/api/quizService.js` and `src/shared/api/lessonService.js` do NOT import `./client.js`.
- Current quizService is localStorage-only and has no external imports.
- Current lessonService is localStorage-first and does not import a client by default.
- If you previously edited these files and see this error again, revert to the versions in this repository or remove the bad import.

### 3) npm error: Could not read package.json at repo root
- Run npm commands inside `frontend` folder:
```
cd frontend
npm install
npm run dev
```

### 4) Port 5173 in use
- Vite auto-switches to another port, usually 5174. Follow the link shown in the terminal.

### 5) Admin menu not visible
- Log in as the Admin demo account (see above). The layout shows role-based menu items.

## Common Tasks
- Reset demo data: Clear browser localStorage for keys `app_quizzes_v3`, `app_quiz_attempts_v3`, and `app_lessons_v3`.
- Update seed data: Modify `seedIfEmpty()` in `quizService.js` and `seedLocalStorage()` in `lessonService.js`.
- Switch to real backend later: Add an axios client and inject it into services (e.g., provide `lessonService.init(apiClient)` and enable DB paths).

## Next Steps
- Consolidate duplicate API clients (`src/api/axiosClient.js` vs `src/shared/api/axiosClient.js`).
- Consolidate Redux stores (`src/store/index.js` vs `src/app/store/index.js`).
- Migrate more pages to feature-based structure progressively.
- Add basic unit tests for services and components.
