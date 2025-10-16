const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export function resolveAssetUrl(url) {
  if (!url) return url;
  if (typeof url !== 'string') return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Base host: http://host:port (strip trailing /api)
  const baseRaw = (API_BASE_URL || '').replace(/\/api\/?$/, '');
  const base = baseRaw.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`.replace(/([^:])\/\/+/, '$1/');
}

export default resolveAssetUrl;
