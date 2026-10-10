import { Certificate, Achievement, Project } from '@/types/careerCompass';
import { loadState, getInitialState } from '@/services/persistence/storage';

export interface PortfolioData {
  certificates: Certificate[];
  achievements: Achievement[];
  projects: Project[];
}

/**
 * Portfolio API Service
 * Handles verified certificates, gamified badges, and showcase projects.
 */
export async function getPortfolio(): Promise<PortfolioData> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const state = loadState() || getInitialState();
  return {
    certificates: JSON.parse(JSON.stringify(state.certificates)),
    achievements: JSON.parse(JSON.stringify(state.achievements)),
    projects: JSON.parse(JSON.stringify(state.projects))
  };
}

export async function addProject(project: Project): Promise<Project> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  return JSON.parse(JSON.stringify(project));
}

export async function addCertificate(certificate: Certificate): Promise<Certificate> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  return JSON.parse(JSON.stringify(certificate));
}

export async function addAchievement(achievement: Achievement): Promise<Achievement> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  return JSON.parse(JSON.stringify(achievement));
}
