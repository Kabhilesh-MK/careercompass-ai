import { Skill, SkillGapItem } from '@/types/careerCompass';
import { loadState, getInitialState } from '@/services/persistence/storage';
import { DEMO_SKILL_GAPS } from '@/data/skills';

/**
 * Skills API Service
 * Handles skill proficiency queries and skill gap benchmarks with async contracts.
 */
export async function getSkills(): Promise<Skill[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const state = loadState() || getInitialState();
  return JSON.parse(JSON.stringify(state.skills));
}

export async function getSkillGaps(careerId?: string): Promise<SkillGapItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const state = loadState() || getInitialState();
  if (state.skillGaps && state.skillGaps.length > 0) {
    return JSON.parse(JSON.stringify(state.skillGaps));
  }
  return JSON.parse(JSON.stringify(DEMO_SKILL_GAPS));
}

export async function updateSkillProficiency(
  skillId: string,
  proficiency: number
): Promise<Skill | null> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  const state = loadState() || getInitialState();
  const skill = state.skills.find((s) => s.id === skillId);
  if (!skill) return null;
  return {
    ...skill,
    currentProficiency: proficiency,
    lastAssessed: new Date().toISOString().split('T')[0]
  };
}
