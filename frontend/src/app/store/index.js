// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// import các slice khác

const store = configureStore({
  reducer: {
    auth: authReducer,
    // student: studentReducer,
    // teacher: teacherReducer,
    // admin: adminReducer,
  },
});

export default store;
