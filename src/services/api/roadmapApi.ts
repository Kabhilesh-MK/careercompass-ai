import { RoadmapPhase, RoadmapItem, RoadmapStatus } from '@/types/careerCompass';
import { loadState, getInitialState } from '@/services/persistence/storage';

/**
 * Roadmap API Service
 * Handles multi-phase milestone retrieval and completion tracking.
 */
export async function getRoadmap(): Promise<RoadmapPhase[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const state = loadState() || getInitialState();
  return JSON.parse(JSON.stringify(state.roadmap));
}

export async function updateRoadmapItem(
  id: string,
  status: RoadmapStatus
): Promise<RoadmapItem | null> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  const state = loadState() || getInitialState();
  for (const phase of state.roadmap) {
    const item = phase.items.find((i) => i.id === id);
    if (item) {
      return { ...item, status, progress: status === 'Completed' ? 100 : item.progress };
    }
  }
  return null;
}
