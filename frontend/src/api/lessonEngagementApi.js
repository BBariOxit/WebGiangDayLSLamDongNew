import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// COMMENTS
export async function fetchComments(lessonId, token) {
  const res = await axios.get(`${API_BASE_URL}/lessons/${lessonId}/comments`, { headers: authHeaders(token) });
  return res.data?.data || [];
}

export async function addComment(lessonId, { content, rating }, token) {
  const res = await axios.post(`${API_BASE_URL}/lessons/${lessonId}/comments`, { content, rating }, { headers: { 'Content-Type': 'application/json', ...authHeaders(token) } });
  return res.data?.data;
}

export async function deleteComment(lessonId, commentId, token) {
  const res = await axios.delete(`${API_BASE_URL}/lessons/${lessonId}/comments/${commentId}`, { headers: authHeaders(token) });
  return res.data?.data;
}

// RATING SUMMARY
export async function fetchRatingSummary(lessonId) {
  const res = await axios.get(`${API_BASE_URL}/lessons/${lessonId}/rating-summary`);
  return res.data?.data || { avg_rating: 0, rating_count: 0 };
}

// PROGRESS
export async function fetchProgress(lessonId, token) {
  const res = await axios.get(`${API_BASE_URL}/lessons/${lessonId}/progress`, { headers: authHeaders(token) });
  return res.data?.data || null;
}

export async function saveProgress(lessonId, progress, token) {
  const res = await axios.post(`${API_BASE_URL}/lessons/${lessonId}/progress`, { progress }, { headers: { 'Content-Type': 'application/json', ...authHeaders(token) } });
  return res.data?.data;
}

// QUIZ
export async function fetchQuizBundle(lessonId, token) {
  const res = await axios.get(`${API_BASE_URL}/lessons/${lessonId}/quiz-bundle`, { headers: authHeaders(token) });
  return res.data?.data || null;
}

export async function submitQuizAttempt(lessonId, payload, token) {
  const res = await axios.post(`${API_BASE_URL}/lessons/${lessonId}/quiz-attempts`, payload, { headers: { 'Content-Type': 'application/json', ...authHeaders(token) } });
  return res.data?.data;
}

export async function listQuizAttempts(lessonId, token) {
  const res = await axios.get(`${API_BASE_URL}/lessons/${lessonId}/quiz-attempts`, { headers: authHeaders(token) });
  return res.data?.data || [];
}
