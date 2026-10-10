/**
 * Central API client for the CareerCompass AI FastAPI backend.
 *
 * The backend runs separately (see backend/README.md). When it is not
 * reachable (e.g. inside the Bolt preview), every helper falls back to the
 * existing mock data so the UI keeps working. Set VITE_API_URL in .env to
 * point at your running backend.
 */

const API_URL = (
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000'
).replace(/\/+$/, '');
const TOKEN_KEY = 'cc_auth_token';
const REFRESH_KEY = 'cc_refresh_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh?: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
  fallback?: () => any | Promise<any>;
}

/**
 * Low-level fetch wrapper. On network failure, calls `fallback` if provided.
 */
async function apiRequest<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth = true, fallback, headers = {}, ...rest } = options;
  const finalHeaders: Record<string, string> = { 'Content-Type': 'application/json', ...(headers as any) };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      let msg = 'Request failed';
      if (typeof body.detail === 'string' && body.detail) {
        msg = body.detail;
      } else if (typeof body.message === 'string' && body.message) {
        msg = body.message;
      } else if (Array.isArray(body.detail) && body.detail.length > 0) {
        msg = body.detail[0].msg || `Validation error (${res.status})`;
      } else if (typeof body.error === 'string' && body.error) {
        msg = body.error;
      } else {
        msg = `Request failed (${res.status})`;
      }
      if (typeof msg === 'string' && msg.startsWith('Value error, ')) {
        msg = msg.replace('Value error, ', '');
      }
      throw new ApiError(msg, res.status);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (err: any) {
    // Network error / backend down — use fallback mock data if available.
    if (fallback && (err instanceof TypeError || err.message.includes('Failed to fetch'))) {
      return fallback();
    }
    throw err;
  }
}

/** Upload helper (multipart). Falls back on network failure. */
async function apiUpload<T = any>(path: string, formData: FormData, fallback?: () => any): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers, body: formData });
    if (!res.ok) throw new Error('Upload failed');
    return (await res.json()) as T;
  } catch (err: any) {
    if (fallback && err instanceof TypeError) return fallback();
    throw err;
  }
}

export { apiRequest as api, apiUpload, API_URL };
