import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import lessonService from '@shared/services/lessonService';

// Async thunks
export const fetchLessons = createAsyncThunk(
  'lessons/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await lessonService.getAllLessons();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLessonById = createAsyncThunk(
  'lessons/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await lessonService.getLessonById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLessonBySlug = createAsyncThunk(
  'lessons/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      return await lessonService.getLessonBySlug(slug);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchLessons = createAsyncThunk(
  'lessons/search',
  async (query, { rejectWithValue }) => {
    try {
      return await lessonService.searchLessons(query);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLessonProgress = createAsyncThunk(
  'lessons/updateProgress',
  async ({ userId, lessonId, progress }, { rejectWithValue }) => {
    try {
      const updatedProgress = lessonService.saveLessonProgress(userId, lessonId, progress);
      return { lessonId, progress: updatedProgress };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const lessonsSlice = createSlice({
  name: 'lessons',
  initialState: {
    items: [],
    currentLesson: null,
    searchResults: [],
    userProgress: {}, // { lessonId: progressPercent }
    loading: false,
    error: null,
    filters: {
      category: null,
      difficulty: null,
      tag: null,
    },
  },
  reducers: {
    setCurrentLesson: (state, action) => {
      state.currentLesson = action.payload;
    },
    clearCurrentLesson: (state) => {
      state.currentLesson = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { category: null, difficulty: null, tag: null };
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setUserProgress: (state, action) => {
      const { lessonId, progress } = action.payload;
      state.userProgress[lessonId] = progress;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all lessons
      .addCase(fetchLessons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch lesson by ID
      .addCase(fetchLessonById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLesson = action.payload;
      })
      .addCase(fetchLessonById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch lesson by slug
      .addCase(fetchLessonBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLesson = action.payload;
      })
      .addCase(fetchLessonBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search lessons
      .addCase(searchLessons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchLessons.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchLessons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update progress
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        const { lessonId, progress } = action.payload;
        state.userProgress[lessonId] = progress;
      });
  },
});

export const {
  setCurrentLesson,
  clearCurrentLesson,
  setFilters,
  clearFilters,
  clearSearchResults,
  setUserProgress,
} = lessonsSlice.actions;

export default lessonsSlice.reducer;
