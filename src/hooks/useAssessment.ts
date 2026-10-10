import { useCallback } from 'react';
import { useAppStateContext } from '@/context/AppStateContext';
import { AssessmentRecord } from '@/types/appState';

export function useAssessment() {
  const { state, dispatch } = useAppStateContext();
  const assessments = state.assessments;

  const latestAssessment = assessments[0] || null;

  const getAssessmentBySkill = useCallback(
    (skillIdentifier: string) => {
      const lower = skillIdentifier.toLowerCase();
      return assessments.find(
        (a) => a.skillId.toLowerCase() === lower || a.skillName.toLowerCase() === lower
      );
    },
    [assessments]
  );

  const saveAssessmentResult = useCallback(
    (record: AssessmentRecord) => {
      dispatch({ type: 'COMPLETE_ASSESSMENT', payload: record });
    },
    [dispatch]
  );

  return {
    assessments,
    latestAssessment,
    getAssessmentBySkill,
    saveAssessmentResult
  };
}
