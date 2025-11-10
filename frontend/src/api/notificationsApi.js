import apiClient from '../shared/services/apiClient';

export async function fetchNotifications(limit = 10) {
  const res = await apiClient.get(`/notifications?limit=${limit}`);
  return res.data?.data || { items: [], unreadCount: 0 };
}

export async function markNotificationRead(id) {
  const res = await apiClient.post(`/notifications/${id}/read`);
  return res.data?.data || { success: true };
}

export async function markAllNotificationsRead() {
  const res = await apiClient.post(`/notifications/read-all`);
  return res.data?.data || { success: true };
}

export async function deleteNotification(id) {
  const res = await apiClient.delete(`/notifications/${id}`);
  return res.data?.data || { success: true };
}
