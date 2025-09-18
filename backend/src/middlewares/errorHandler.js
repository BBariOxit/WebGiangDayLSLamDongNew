export function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err); // fallback; in real case use logger
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
}
