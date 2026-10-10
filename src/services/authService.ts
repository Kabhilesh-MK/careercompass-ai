/**
 * Auth service — register, login, logout, password reset.
 * Falls back to mock data when the backend is unreachable.
 */

import { api, getToken, setTokens, clearTokens, getRefreshToken } from './api';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: string;
  user_id: string;
  full_name: string;
  profile_completed?: boolean;
}

export async function register(data: { full_name: string; email: string; password: string; phone?: string }) {
  return api<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: false,
  }).then((res) => {
    setTokens(res.access_token, res.refresh_token);
    return res;
  });
}

export async function login(email: string, password: string) {
  return api<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    auth: false,
  }).then((res) => {
    setTokens(res.access_token, res.refresh_token);
    return res;
  });
}

export async function adminLogin(email: string, password: string) {
  return api<AuthResponse>('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    auth: false,
  }).then((res) => {
    setTokens(res.access_token, res.refresh_token);
    return res;
  });
}

export async function logout() {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch {
    // ignore — clear local tokens regardless
  }
  clearTokens();
}

export async function forgotPassword(email: string) {
  return api<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    auth: false,
    fallback: () => ({ message: 'If that email exists, a reset link has been sent.' }),
  });
}

export async function resetPassword(token: string, new_password: string) {
  return api<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password }),
    auth: false,
    fallback: () => ({ message: 'Password reset successfully.' }),
  });
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  return api<{ access_token: string }>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refresh }),
    auth: false,
  }).then((res) => {
    setTokens(res.access_token);
    return res.access_token;
  });
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
