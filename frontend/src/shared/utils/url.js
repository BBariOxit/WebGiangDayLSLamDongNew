const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export function resolveAssetUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Remove trailing /api or /api/
  const baseRaw = API_BASE_URL.replace(/\/api\/?$/, '');
  const base = baseRaw.endsWith('/') ? baseRaw.slice(0, -1) : baseRaw;
  if (url.startsWith('/')) return base + url;
  return `${base}/${url}`;
}

export default resolveAssetUrl;
