import { useCallback } from 'react';
import { useAppStateContext } from '@/context/AppStateContext';
import { Project, Certificate, Achievement } from '@/types/careerCompass';

export function usePortfolio() {
  const { state, dispatch } = useAppStateContext();
  const { certificates, achievements, projects } = state;
  const careerProjects = state.careerProjects || {};

  const addProject = useCallback((project: Project) => {
    dispatch({ type: 'ADD_PROJECT', payload: project });
  }, [dispatch]);

  const addCertificate = useCallback((certificate: Certificate) => {
    dispatch({ type: 'ADD_CERTIFICATE', payload: certificate });
  }, [dispatch]);

  const addAchievement = useCallback((achievement: Achievement) => {
    dispatch({ type: 'ADD_ACHIEVEMENT', payload: achievement });
  }, [dispatch]);

  const updateCareerProjectStatus = useCallback(
    (projectId: string, status: 'planned' | 'in_progress' | 'completed') => {
      dispatch({ type: 'UPDATE_CAREER_PROJECT_STATUS', payload: { projectId, status } });
    },
    [dispatch]
  );

  const toggleProjectEvidence = useCallback(
    (projectId: string, evidenceItem: string) => {
      dispatch({ type: 'TOGGLE_PROJECT_EVIDENCE', payload: { projectId, evidenceItem } });
    },
    [dispatch]
  );

  const updateProjectDeliverableLink = useCallback(
    (projectId: string, deliverable: string, link: string) => {
      dispatch({ type: 'UPDATE_PROJECT_DELIVERABLE_LINK', payload: { projectId, deliverable, link } });
    },
    [dispatch]
  );

  return {
    certificates,
    achievements,
    projects,
    careerProjects,
    addProject,
    addCertificate,
    addAchievement,
    updateCareerProjectStatus,
    toggleProjectEvidence,
    updateProjectDeliverableLink,
  };
}
