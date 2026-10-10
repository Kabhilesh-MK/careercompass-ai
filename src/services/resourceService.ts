/**
 * Resource services — projects, certifications, careers, roadmap, reports,
 * settings, mentor, admin, resume. Mock data fallbacks have been removed
 * to ensure strict backend validation for authenticated users.
 */

import { api, apiUpload } from './api';

// ── Projects ──────────────────────────────────────────
export async function listProjects(params?: { career?: string; skill?: string; difficulty?: string; search?: string }) {
  const q = new URLSearchParams();
  if (params?.career) q.set('career', params.career);
  if (params?.skill) q.set('skill', params.skill);
  if (params?.difficulty && params.difficulty !== 'All') q.set('difficulty', params.difficulty);
  if (params?.search) q.set('search', params.search);
  const qs = q.toString();
  return api(`/api/projects${qs ? `?${qs}` : ''}`);
}
export async function getProject(id: string) {
  return api(`/api/projects/${encodeURIComponent(id)}`);
}
export async function getRecommendedProjects(career?: string) {
  const q = career ? `?career=${encodeURIComponent(career)}` : '';
  return api(`/api/projects/recommended${q}`);
}
export async function createProject(data: any) {
  return api('/api/projects', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateProject(id: string, data: any) {
  return api(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function deleteProject(id: string) {
  return api(`/api/projects/${id}`, { method: 'DELETE' });
}

// ── Certifications ────────────────────────────────────
export async function listCertifications(params?: { career?: string; skill?: string; level?: string; search?: string }) {
  const q = new URLSearchParams();
  if (params?.career) q.set('career', params.career);
  if (params?.skill) q.set('skill', params.skill);
  if (params?.level && params.level !== 'All') q.set('level', params.level);
  if (params?.search) q.set('search', params.search);
  const qs = q.toString();
  return api(`/api/certifications${qs ? `?${qs}` : ''}`);
}
export async function getCertification(id: string) {
  return api(`/api/certifications/${encodeURIComponent(id)}`);
}
export async function getRecommendedCertifications(career?: string) {
  const q = career ? `?career=${encodeURIComponent(career)}` : '';
  return api(`/api/certifications/recommended${q}`);
}
export async function createCertification(data: any) {
  return api('/api/certifications', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateCertification(id: string, data: any) {
  return api(`/api/certifications/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function deleteCertification(id: string) {
  return api(`/api/certifications/${id}`, { method: 'DELETE' });
}

// ── Careers ───────────────────────────────────────────
export async function listCareers() {
  return api('/api/careers');
}
export async function getCareerDetail(careerId: string) {
  return api(`/api/careers/${encodeURIComponent(careerId)}`);
}
export async function getCareerFit(careerId: string) {
  return api(`/api/careers/${encodeURIComponent(careerId)}/fit`);
}
export async function compareCareers(careers: string[]) {
  return api('/api/ml/compare', { method: 'POST', body: JSON.stringify({ careers }) });
}

// ── Skill Gap ─────────────────────────────────────────
export async function getSkillGap(career?: string) {
  const query = career ? `?career=${encodeURIComponent(career)}` : '';
  return api(`/api/ml/skill-gap${query}`);
}

// ── Roadmap ───────────────────────────────────────────
export async function getRoadmap(career?: string, regenerate?: boolean) {
  const params = new URLSearchParams();
  if (career) params.set('career', career);
  if (regenerate) params.set('regenerate', 'true');
  const qs = params.toString();
  return api(`/api/roadmap${qs ? `?${qs}` : ''}`);
}
export async function generateRoadmap(career?: string) {
  return api('/api/roadmap/generate', {
    method: 'POST',
    body: JSON.stringify(career ? { career } : {}),
  });
}
export async function saveRoadmap(target_role: string, milestones: any[]) {
  return api('/api/roadmap', { method: 'POST', body: JSON.stringify({ target_role, milestones }) });
}
export async function updateMilestone(roadmapId: string, index: number, status: string, progress: number) {
  return api(
    `/api/roadmap/milestone/${encodeURIComponent(roadmapId)}/${index}?status=${encodeURIComponent(status)}&progress=${progress}`,
    { method: 'PUT' }
  );
}

// ── Placement ─────────────────────────────────────────
export async function getPlacement() {
  return api('/api/ml/placement');
}

// ── Reports ───────────────────────────────────────────
export async function getReport() {
  return api('/api/reports');
}

// ── Settings ──────────────────────────────────────────
export async function getSettings() {
  return api('/api/settings');
}
export async function updateSettings(data: any) {
  return api('/api/settings', { method: 'PUT', body: JSON.stringify(data) });
}
export async function changePassword(current_password: string, new_password: string) {
  return api('/api/settings/password', { method: 'PUT', body: JSON.stringify({ current_password, new_password }) });
}

// ── AI Mentor ─────────────────────────────────────────
export async function getChatHistory() {
  return api('/api/mentor/history');
}
export async function sendMentorMessage(text: string) {
  return api('/api/mentor/message', { method: 'POST', body: JSON.stringify({ role: 'user', text, time: 'Now' }) });
}
export async function clearChatHistory() {
  return api('/api/mentor/history', { method: 'DELETE' });
}

// ── Admin ─────────────────────────────────────────────
export async function getAdminStats() {
  return api('/api/admin/stats');
}
export async function getAdminUsers() {
  return api('/api/admin/users');
}

// ── Resume ────────────────────────────────────────────
export async function uploadResume(file: File) {
  const form = new FormData();
  form.append('file', file);
  return apiUpload('/api/resume/upload', form);
}
export async function getResume() {
  return api('/api/resume');
}
export async function listResumes() {
  return api('/api/resume/list');
}

// ── ML Prediction (Direct & Persistent) ───────────────
export async function getMLPrediction(profileData: any) {
  return api('/api/ml/predict', { method: 'POST', body: JSON.stringify(profileData) });
}
export async function getLatestPrediction() {
  return api('/api/ml/prediction');
}
