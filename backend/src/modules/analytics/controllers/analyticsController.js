import { getPublicAnalytics, getPersonalAnalytics } from '../services/analyticsService.js';
import { ok, fail } from '../../../utils/response.js';

export async function getPublic(req, res) {
  try {
    const days = req.query.days ? parseInt(req.query.days, 10) : 14;
    const data = await getPublicAnalytics(days);
    ok(res, data);
  } catch (e) { fail(res, 400, e.message); }
}

export async function getMine(req, res) {
  try {
    const days = req.query.days ? parseInt(req.query.days, 10) : 14;
    const data = await getPersonalAnalytics(req.user.id, days);
    ok(res, data);
  } catch (e) { fail(res, 400, e.message); }
}
