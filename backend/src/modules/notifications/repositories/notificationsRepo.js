import { query } from '../../../config/pool.js';

export async function createNotification({ type, title, body, data = {}, isGlobal = true, targetUserId = null, lessonId = null, quizId = null }) {
  const r = await query(`
    INSERT INTO notifications(type, title, body, data, is_global, target_user_id, lesson_id, quiz_id)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
  `, [type, title, body || null, JSON.stringify(data || {}), !!isGlobal, targetUserId, lessonId, quizId]);
  return r.rows[0];
}

export async function listUserNotifications(userId, limit = 10, offset = 0) {
  const r = await query(`
    SELECT n.*, (nr.user_id IS NULL) AS unread
    FROM notifications n
    LEFT JOIN notification_reads nr ON nr.notification_id=n.notification_id AND nr.user_id=$1
    WHERE (n.is_global = TRUE OR n.target_user_id = $1)
    ORDER BY n.notification_id DESC
    LIMIT $2 OFFSET $3
  `, [userId, limit, offset]);
  return r.rows;
}

export async function getUnreadCount(userId) {
  const r = await query(`
    SELECT COUNT(*)::int AS cnt
    FROM notifications n
    LEFT JOIN notification_reads nr ON nr.notification_id=n.notification_id AND nr.user_id=$1
    WHERE (n.is_global = TRUE OR n.target_user_id = $1) AND nr.user_id IS NULL
  `, [userId]);
  return r.rows[0]?.cnt || 0;
}

export async function markRead(userId, notificationId) {
  await query(`
    INSERT INTO notification_reads(notification_id, user_id, read_at)
    VALUES($1,$2,NOW()) ON CONFLICT DO NOTHING
  `, [notificationId, userId]);
  const unread = await getUnreadCount(userId);
  return { success: true, unreadCount: unread };
}

export async function markAllRead(userId) {
  await query(`
    INSERT INTO notification_reads(notification_id, user_id, read_at)
    SELECT n.notification_id, $1, NOW()
    FROM notifications n
    LEFT JOIN notification_reads nr ON nr.notification_id=n.notification_id AND nr.user_id=$1
    WHERE (n.is_global = TRUE OR n.target_user_id = $1) AND nr.user_id IS NULL
  `, [userId]);
  const unread = await getUnreadCount(userId);
  return { success: true, unreadCount: unread };
}
