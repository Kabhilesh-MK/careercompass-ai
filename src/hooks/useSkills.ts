import { useMemo, useCallback } from 'react';
import { useAppStateContext } from '@/context/AppStateContext';
import { Skill, SkillCategoryGroup, SkillGapItem } from '@/types/careerCompass';

const CATEGORY_METADATA: Record<string, { icon: string; color: string }> = {
  'Programming': { icon: 'Code', color: 'indigo' },
  'Database': { icon: 'Database', color: 'cyan' },
  'Data': { icon: 'BarChart2', color: 'blue' },
  'AI/ML': { icon: 'Brain', color: 'purple' },
  'Cloud': { icon: 'Cloud', color: 'sky' },
  'Tools': { icon: 'Wrench', color: 'emerald' },
  'Soft Skills': { icon: 'Users', color: 'amber' }
};

export function useSkills() {
  const { state, dispatch } = useAppStateContext();
  const { skills, skillGaps } = state;

  const strongSkills = useMemo(() => skills.filter((s) => s.status === 'Strong'), [skills]);
  const developingSkills = useMemo(() => skills.filter((s) => s.status === 'Developing'), [skills]);
  const attentionSkills = useMemo(() => skills.filter((s) => s.status === 'Needs Attention'), [skills]);

  const categories = useMemo<SkillCategoryGroup[]>(() => {
    const map = new Map<string, Skill[]>();
    skills.forEach((sk) => {
      const existing = map.get(sk.category) || [];
      existing.push(sk);
      map.set(sk.category, existing);
    });

    return Array.from(map.entries()).map(([categoryName, groupSkills]) => ({
      id: `cat-${categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: categoryName,
      icon: CATEGORY_METADATA[categoryName]?.icon || 'Code',
      color: CATEGORY_METADATA[categoryName]?.color || 'indigo',
      skills: groupSkills
    }));
  }, [skills]);

  const updateSkill = useCallback((skill: Skill) => {
    dispatch({ type: 'UPDATE_SKILL', payload: skill });
  }, [dispatch]);

  const updateSkillProficiency = useCallback((skillId: string, proficiency: number, evidence?: string) => {
    dispatch({
      type: 'UPDATE_SKILL_PROFICIENCY',
      payload: { skillId, proficiency, evidence }
    });
  }, [dispatch]);

  const getSkillById = useCallback((id: string) => {
    return skills.find((s) => s.id === id);
  }, [skills]);

  const getSkillByName = useCallback((name: string) => {
    return skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
  }, [skills]);

  return {
    skills,
    skillGaps,
    categories,
    strongSkills,
    developingSkills,
    attentionSkills,
    updateSkill,
    updateSkillProficiency,
    getSkillById,
    getSkillByName
  };
}
