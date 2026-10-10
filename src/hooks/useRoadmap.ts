import { useMemo, useCallback } from 'react';
import { useAppStateContext } from '@/context/AppStateContext';
import { RoadmapItem, RoadmapStatus } from '@/types/careerCompass';

export function useRoadmap() {
  const { state, dispatch } = useAppStateContext();
  const phases = state.roadmap;

  const allMilestones = useMemo<RoadmapItem[]>(() => {
    return phases.flatMap((p) => p.items);
  }, [phases]);

  const totalMilestones = allMilestones.length;
  const completedMilestones = useMemo(() => {
    return allMilestones.filter((m) => m.status === 'Completed').length;
  }, [allMilestones]);

  const overallProgress = useMemo(() => {
    if (totalMilestones === 0) return 0;
    return Math.round((completedMilestones / totalMilestones) * 100);
  }, [completedMilestones, totalMilestones]);

  const currentPhase = useMemo(() => {
    const found = phases.find((p) => p.status === 'current');
    if (found) return found;
    return phases.find((p) => p.status !== 'completed') || phases[0];
  }, [phases]);

  const startRoadmapItem = useCallback((itemId: string) => {
    dispatch({ type: 'START_ROADMAP_ITEM', payload: { itemId } });
  }, [dispatch]);

  const completeRoadmapItem = useCallback((itemId: string) => {
    dispatch({ type: 'COMPLETE_ROADMAP_ITEM', payload: { itemId } });
  }, [dispatch]);

  const resetRoadmapItem = useCallback((itemId: string) => {
    dispatch({ type: 'RESET_ROADMAP_ITEM', payload: { itemId } });
  }, [dispatch]);

  const updateItemStatus = useCallback((itemId: string, status: RoadmapStatus) => {
    dispatch({ type: 'UPDATE_ROADMAP_ITEM_STATUS', payload: { itemId, status } });
  }, [dispatch]);

  return {
    phases,
    allMilestones,
    totalMilestones,
    completedMilestones,
    overallProgress,
    currentPhase,
    activePhase: currentPhase,
    startRoadmapItem,
    completeRoadmapItem,
    resetRoadmapItem,
    updateItemStatus
  };
}
