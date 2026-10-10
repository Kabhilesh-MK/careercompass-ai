import { api } from './api';

// ---------- Achievements ----------
export const getAchievements = () =>
  api('/api/achievements');

export const evaluateAchievements = (context: Record<string, unknown>) =>
  api('/api/achievements/evaluate', {
    method: 'POST',
    body: JSON.stringify(context),
  });

// ---------- Notifications ----------
export const getNotifications = (unreadOnly = false) =>
  api(`/api/notifications${unreadOnly ? '?unread_only=true' : ''}`);

export const getUnreadCount = () =>
  api('/api/notifications/count');

export const markNotificationsRead = (ids: string[] = []) =>
  api('/api/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });

export const deleteNotification = (id: string) =>
  api(`/api/notifications/${id}`, { method: 'DELETE' });

// ---------- Favorites ----------
export const getFavorites = (itemType?: string) =>
  api(`/api/favorites${itemType ? `?item_type=${itemType}` : ''}`);

export const addFavorite = (item: { item_type: string; item_id: string; item_title: string; item_meta?: Record<string, unknown> }) =>
  api('/api/favorites', { method: 'POST', body: JSON.stringify(item) });

export const removeFavorite = (itemType: string, itemId: string) =>
  api(`/api/favorites?item_type=${itemType}&item_id=${itemId}`, {
    method: 'DELETE',
  });

export const checkFavorite = (itemType: string, itemId: string) =>
  api(`/api/favorites/check?item_type=${itemType}&item_id=${itemId}`);

// ---------- Learning Progress ----------
export const getLearningProgress = () =>
  api('/api/progress');

export const updateProgressItem = (item: {
  item_type: string; item_id: string; completed: boolean;
  progress_pct: number; title?: string; provider?: string;
}) =>
  api('/api/progress/item', { method: 'POST', body: JSON.stringify(item) });

export const updateProjectProgress = (
  projectId: string,
  progressPct: number,
  completed?: boolean,
  status?: string,
) => {
  const q = new URLSearchParams();
  q.set('progress_pct', String(progressPct));
  if (completed !== undefined) q.set('completed', String(completed));
  if (status) q.set('status', status);
  return api(`/api/progress/project/${encodeURIComponent(projectId)}?${q.toString()}`, { method: 'PUT' });
};

export const updateCertificationProgress = (
  certId: string,
  completed = true,
  status?: string,
) => {
  const q = new URLSearchParams();
  q.set('completed', String(completed));
  if (status) q.set('status', status);
  return api(`/api/progress/certification/${encodeURIComponent(certId)}?${q.toString()}`, { method: 'PUT' });
};

// ---------- Resume Analysis ----------
export const analyzeResume = (resumeId: string, predictedCareer = '') =>
  api(`/api/resume/analyze/${resumeId}?predicted_career=${encodeURIComponent(predictedCareer)}`, {
    method: 'POST',
  });

export const getResumeAnalysis = (resumeId: string) =>
  api(`/api/resume/analyze/${resumeId}`);

// ---------- Report Export ----------
export const getHtmlReport = (reportData: Record<string, unknown>, userInfo: Record<string, unknown> = {}) =>
  api('/api/report/html', {
    method: 'POST',
    body: JSON.stringify({ report_data: reportData, user_info: userInfo }),
  });

export const sendEmailReport = (reportData: Record<string, unknown>, toEmail = '') =>
  api('/api/report/email', {
    method: 'POST',
    body: JSON.stringify({ report_data: reportData, to_email: toEmail }),
  });
