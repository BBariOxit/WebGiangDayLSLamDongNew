import apiClient from '../shared/services/apiClient';

// COMMENTS
export async function fetchComments(lessonId) {
  const res = await apiClient.get(`/lessons/${lessonId}/comments`);
  return res.data?.data || [];
}

export async function addComment(lessonId, { content, rating }) {
  const res = await apiClient.post(`/lessons/${lessonId}/comments`, { content, rating });
  return res.data?.data;
}

export async function deleteComment(lessonId, commentId) {
  const res = await apiClient.delete(`/lessons/${lessonId}/comments/${commentId}`);
  return res.data?.data;
}

// RATING SUMMARY
export async function fetchRatingSummary(lessonId) {
  const res = await apiClient.get(`/lessons/${lessonId}/rating-summary`);
  return res.data?.data || { avg_rating: 0, rating_count: 0 };
}

// PROGRESS
export async function fetchProgress(lessonId) {
  const res = await apiClient.get(`/lessons/${lessonId}/progress`);
  return res.data?.data || null;
}

export async function saveProgress(lessonId, progress) {
  const res = await apiClient.post(`/lessons/${lessonId}/progress`, { progress });
  return res.data?.data;
}

// QUIZ
export async function fetchQuizBundle(lessonId) {
  const res = await apiClient.get(`/lessons/${lessonId}/quiz-bundle`);
  return res.data?.data || null;
}

export async function submitQuizAttempt(lessonId, payload) {
  const res = await apiClient.post(`/lessons/${lessonId}/quiz-attempts`, payload);
  return res.data?.data;
}

export async function listQuizAttempts(lessonId) {
  const res = await apiClient.get(`/lessons/${lessonId}/quiz-attempts`);
  return res.data?.data || [];
}

export async function recordStudySession(lessonId) {
  const res = await apiClient.post(`/lessons/${lessonId}/study-sessions`);
  return res.data?.data || null;
}

// BOOKMARKS
export async function listMyBookmarks(){
  const res = await apiClient.get('/lessons/me/bookmarks');
  return res.data?.data || [];
}
export async function addBookmarkApi(lessonId){
  const res = await apiClient.post(`/lessons/${lessonId}/bookmark`);
  return res.data?.data || null;
}
export async function removeBookmarkApi(lessonId){
  const res = await apiClient.delete(`/lessons/${lessonId}/bookmark`);
  return res.data?.data || null;
}
