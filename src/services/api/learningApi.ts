import { LearningResource, LearningPath, Project, Simulation } from '@/types/careerCompass';
import { loadState, getInitialState } from '@/services/persistence/storage';

/**
 * Learning API Service
 * Handles marketplace courses, structured paths, projects, and job simulations.
 */
export async function getLearningResources(): Promise<LearningResource[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const state = loadState() || getInitialState();
  return JSON.parse(JSON.stringify(state.learningResources));
}

export async function getLearningPaths(): Promise<LearningPath[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const state = loadState() || getInitialState();
  return JSON.parse(JSON.stringify(state.learningPaths));
}

export async function getProjects(): Promise<Project[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const state = loadState() || getInitialState();
  return JSON.parse(JSON.stringify(state.projects));
}

export async function getSimulations(): Promise<Simulation[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const state = loadState() || getInitialState();
  return JSON.parse(JSON.stringify(state.simulations));
}

export async function updateResourceProgress(
  id: string,
  progress: number
): Promise<LearningResource | null> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  const state = loadState() || getInitialState();
  const res = state.learningResources.find((r) => r.id === id);
  if (!res) return null;
  return { ...res, progress, enrolled: true };
}

export async function updateProjectProgress(
  id: string,
  progress: number
): Promise<Project | null> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  const state = loadState() || getInitialState();
  const proj = state.projects.find((p) => p.id === id);
  if (!proj) return null;
  return { ...proj, progress };
}

export async function completeSimulationTask(
  simulationId: string,
  taskId: string
): Promise<Simulation | null> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  const state = loadState() || getInitialState();
  const sim = state.simulations.find((s) => s.id === simulationId);
  if (!sim) return null;
  return { ...sim };
}
