import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quizService from '@shared/services/quizService';

// Async thunks
export const fetchQuizzes = createAsyncThunk(
  'quizzes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return quizService.getQuizzes();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQuizById = createAsyncThunk(
  'quizzes/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return quizService.getQuizById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQuizByLessonId = createAsyncThunk(
  'quizzes/fetchByLessonId',
  async (lessonId, { rejectWithValue }) => {
    try {
      return quizService.getQuizByLessonId(lessonId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitQuizAttempt = createAsyncThunk(
  'quizzes/submitAttempt',
  async ({ userId, quizId, score, durationSeconds, answers }, { rejectWithValue }) => {
    try {
      return quizService.saveAttempt({ userId, quizId, score, durationSeconds, answers });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createQuiz = createAsyncThunk(
  'quizzes/create',
  async (quizData, { rejectWithValue }) => {
    try {
      return quizService.createQuiz(quizData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateQuiz = createAsyncThunk(
  'quizzes/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return quizService.updateQuiz(id, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quizzes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await quizService.deleteQuiz(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState: {
    items: [],
    currentQuiz: null,
    attempts: [],
    currentAttempt: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload;
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },
    setCurrentAttempt: (state, action) => {
      state.currentAttempt = action.payload;
    },
    clearCurrentAttempt: (state) => {
      state.currentAttempt = null;
    },
    loadUserAttempts: (state, action) => {
      state.attempts = quizService.getAttemptsByUser(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch quiz by ID
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch quiz by lesson ID
      .addCase(fetchQuizByLessonId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizByLessonId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizByLessonId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit attempt
      .addCase(submitQuizAttempt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQuizAttempt.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttempt = action.payload;
        state.attempts.push(action.payload);
      })
      .addCase(submitQuizAttempt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create quiz
      .addCase(createQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update quiz
      .addCase(updateQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentQuiz?.id === action.payload.id) {
          state.currentQuiz = action.payload;
        }
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete quiz
      .addCase(deleteQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(q => q.id !== action.payload);
        if (state.currentQuiz?.id === action.payload) {
          state.currentQuiz = null;
        }
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentQuiz,
  clearCurrentQuiz,
  setCurrentAttempt,
  clearCurrentAttempt,
  loadUserAttempts,
} = quizzesSlice.actions;

export default quizzesSlice.reducer;
