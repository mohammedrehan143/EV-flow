export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  const isBrowser = typeof window !== 'undefined';
  const isHostLocal = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // If VITE_API_URL is explicitly set and valid
  if (envUrl && envUrl.trim() !== '') {
    const trimmed = envUrl.trim();
    // If deployed on Vercel/web (non-localhost) but VITE_API_URL was accidentally left as localhost
    if (!isHostLocal && trimmed.includes('localhost')) {
      return 'https://ev-flow-backend.onrender.com';
    }
    return trimmed;
  }

  // Fallback when VITE_API_URL is missing:
  // If deployed in production or on non-localhost host (e.g. Vercel), use Render backend URL
  if (!isHostLocal) {
    return 'https://ev-flow-backend.onrender.com';
  }

  // Local development default
  return 'http://localhost:5000';
};

export const API_BASE = getApiBaseUrl();
