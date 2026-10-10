/**
 * Profile service — get/update profile, skills, education, photo.
 */

import { api } from './api';

export async function getProfile() {
  return api('/api/profile');
}

export async function updateProfile(data: any) {
  return api('/api/profile/update', { method: 'PUT', body: JSON.stringify(data) });
}

export async function updateSkills(skills: any[]) {
  return api('/api/profile/skills', { method: 'PUT', body: JSON.stringify({ skills }) });
}

export async function updateEducation(education: any[]) {
  return api('/api/profile/education', { method: 'PUT', body: JSON.stringify(education) });
}

export async function getSkills() {
  return api('/api/skills');
}

export async function uploadPhoto(file: File) {
  const form = new FormData();
  form.append('file', file);
  return api('/api/profile/photo', { method: 'POST', body: form as any });
}
