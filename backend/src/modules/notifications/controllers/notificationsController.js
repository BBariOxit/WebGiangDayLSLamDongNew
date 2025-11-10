import { ok, fail } from '../../../utils/response.js';
import { listMyNotifications, markNotificationRead, markAllNotificationsRead, dismissNotification } from '../services/notificationsService.js';

export async function getMyNotifications(req, res) {
  try {
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit, 10), 50) : 10;
    const data = await listMyNotifications(req.user.id, limit);
    ok(res, data);
  } catch (e) {
    fail(res, 400, e.message);
  }
}

export async function markReadCtrl(req, res) {
  try {
    const notificationId = parseInt(req.params.id, 10);
    ok(res, await markNotificationRead(req.user.id, notificationId));
  } catch (e) {
    fail(res, 400, e.message);
  }
}

export async function markAllReadCtrl(req, res) {
  try {
    ok(res, await markAllNotificationsRead(req.user.id));
  } catch (e) {
    fail(res, 400, e.message);
  }
}

export async function dismissNotificationCtrl(req, res) {
  try {
    const notificationId = parseInt(req.params.id, 10);
    ok(res, await dismissNotification(req.user.id, notificationId));
  } catch (e) {
    fail(res, 400, e.message);
  }
}
