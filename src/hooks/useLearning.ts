import { useMemo, useCallback } from 'react';
import { useAppStateContext } from '@/context/AppStateContext';

export function useLearning() {
  const { state, dispatch } = useAppStateContext();
  const { learningResources, learningPaths, projects, simulations } = state;

  const enrolledResources = useMemo(() => {
    return learningResources.filter((r) => r.enrolled);
  }, [learningResources]);

  const completedResources = useMemo(() => {
    return learningResources.filter((r) => (r.progress ?? 0) >= 100);
  }, [learningResources]);

  const inProgressProjects = useMemo(() => {
    return projects.filter((p) => p.status === 'In Progress');
  }, [projects]);

  const completedProjects = useMemo(() => {
    return projects.filter((p) => p.status === 'Completed');
  }, [projects]);

  const inProgressSimulations = useMemo(() => {
    return simulations.filter((s) => s.status === 'In Progress');
  }, [simulations]);

  const completedSimulations = useMemo(() => {
    return simulations.filter((s) => s.status === 'Completed');
  }, [simulations]);

  const startResource = useCallback((resourceId: string) => {
    dispatch({ type: 'START_RESOURCE', payload: { resourceId } });
  }, [dispatch]);

  const updateResourceProgress = useCallback((resourceId: string, progress: number) => {
    dispatch({ type: 'UPDATE_RESOURCE_PROGRESS', payload: { resourceId, progress } });
  }, [dispatch]);

  const completeResource = useCallback((resourceId: string) => {
    dispatch({ type: 'COMPLETE_RESOURCE', payload: { resourceId } });
  }, [dispatch]);

  const startProject = useCallback((projectId: string) => {
    dispatch({ type: 'START_PROJECT', payload: { projectId } });
  }, [dispatch]);

  const updateProjectProgress = useCallback((projectId: string, progress: number, completedTaskId?: string) => {
    dispatch({ type: 'UPDATE_PROJECT_PROGRESS', payload: { projectId, progress, completedTaskId } });
  }, [dispatch]);

  const completeProject = useCallback((projectId: string) => {
    dispatch({ type: 'COMPLETE_PROJECT', payload: { projectId } });
  }, [dispatch]);

  const startSimulation = useCallback((simulationId: string) => {
    dispatch({ type: 'START_SIMULATION', payload: { simulationId } });
  }, [dispatch]);

  const completeSimulationTask = useCallback((simulationId: string, taskId: string) => {
    dispatch({ type: 'COMPLETE_SIMULATION_TASK', payload: { simulationId, taskId } });
  }, [dispatch]);

  const completeSimulation = useCallback((simulationId: string) => {
    dispatch({ type: 'COMPLETE_SIMULATION', payload: { simulationId } });
  }, [dispatch]);

  return {
    resources: learningResources,
    learningPaths,
    projects,
    simulations,
    enrolledResources,
    completedResources,
    inProgressProjects,
    completedProjects,
    inProgressSimulations,
    completedSimulations,
    startResource,
    updateResourceProgress,
    completeResource,
    startProject,
    updateProjectProgress,
    completeProject,
    startSimulation,
    completeSimulationTask,
    completeSimulation
  };
}
