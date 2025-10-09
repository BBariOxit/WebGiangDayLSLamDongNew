// Standard API response helpers
export function ok(res, data, meta) {
  if (res.headersSent) return; // safety
  const body = { success: true, data };
  if (meta) body.meta = meta;
  res.json(body);
}

export function created(res, data) {
  if (res.headersSent) return;
  res.status(201).json({ success: true, data });
}

export function fail(res, status, error, code, extra) {
  if (res.headersSent) return;
  const body = { success: false, error };
  if (code) body.code = code;
  if (extra) body.extra = extra;
  res.status(status || 400).json(body);
}

export function notFound(res, message = 'Not found') {
  fail(res, 404, message);
}

export function unauthorized(res, message = 'Unauthorized') {
  fail(res, 401, message);
}

export function forbidden(res, message = 'Forbidden') {
  fail(res, 403, message);
}