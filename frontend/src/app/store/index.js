import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../features/auth/authSlice';
import lessonsReducer from '../../features/lessons/lessonsSlice';
import quizzesReducer from '../../features/quizzes/quizzesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    lessons: lessonsReducer,
    quizzes: quizzesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: ['lessons/fetchAll/fulfilled', 'quizzes/fetchAll/fulfilled'],
        // Ignore these paths in the state
        ignoredPaths: ['lessons.items', 'quizzes.items'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
