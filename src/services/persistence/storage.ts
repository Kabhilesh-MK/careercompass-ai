import { StudentState, StudentProfile } from '@/types/appState';
import { DEMO_SKILLS, DEMO_SKILL_GAPS } from '@/data/skills';
import { DEMO_ROADMAP_PHASES } from '@/data/roadmap';
import { DEMO_LEARNING_RESOURCES, DEMO_LEARNING_PATHS } from '@/data/learningResources';
import { DEMO_PROJECTS } from '@/data/projects';
import { DEMO_SIMULATIONS } from '@/data/simulations';
import { DEMO_CERTIFICATES, DEMO_ACHIEVEMENTS } from '@/data/portfolio';
import { DEMO_NOTIFICATIONS } from '@/data/notifications';
import { DEMO_PREDICTION_HISTORY } from '@/data/predictions';
import { STORAGE_KEY, STORAGE_VERSION } from './storageKeys';
import { migrateState, StoredPayload } from './migration';

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.edu',
  headline: 'Aspiring AI & Machine Learning Engineer | CS Junior',
  bio: 'Computer Science undergraduate passionate about statistical modeling, deep learning architectures, and scalable ML data pipelines.',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  education: {
    degree: 'B.S. in Computer Science',
    institution: 'University of California, Berkeley',
    gradYear: 2026,
    gpa: '3.82 / 4.0'
  },
  targetCareer: 'AI & Machine Learning Engineering',
  interests: ['Machine Learning', 'Data Science', 'Distributed Systems', 'MLOps'],
  completeness: 85,
  careerPreferences: {
    preferredTrack: 'AI & Machine Learning',
    workMode: 'Hybrid',
    expectedGraduation: 'Spring 2026'
  }
};

export function getInitialState(): StudentState {
  return {
    profile: { ...INITIAL_STUDENT_PROFILE },
    skills: JSON.parse(JSON.stringify(DEMO_SKILLS)),
    assessments: [
      {
        id: 'asm-demo-py-1',
        skillId: 'sk-py',
        skillName: 'Python',
        answers: {},
        score: 82,
        totalQuestions: 20,
        correctCount: 16,
        skillLevel: 'Advanced',
        completedAt: '2026-09-15T14:30:00Z',
        derivedProficiency: 82,
        strongAreas: ['Data Structures', 'OOP', 'List Comprehensions'],
        weakAreas: ['Asyncio', 'Metaclasses'],
        recommendedAction: 'Practice concurrency and async workflows'
      }
    ],
    skillGaps: JSON.parse(JSON.stringify(DEMO_SKILL_GAPS)),
    learningResources: JSON.parse(JSON.stringify(DEMO_LEARNING_RESOURCES)),
    learningPaths: JSON.parse(JSON.stringify(DEMO_LEARNING_PATHS)),
    roadmap: JSON.parse(JSON.stringify(DEMO_ROADMAP_PHASES)),
    projects: JSON.parse(JSON.stringify(DEMO_PROJECTS)),
    simulations: JSON.parse(JSON.stringify(DEMO_SIMULATIONS)),
    certificates: JSON.parse(JSON.stringify(DEMO_CERTIFICATES)),
    achievements: JSON.parse(JSON.stringify(DEMO_ACHIEVEMENTS)),
    predictionHistory: JSON.parse(JSON.stringify(DEMO_PREDICTION_HISTORY)),
    notifications: JSON.parse(JSON.stringify(DEMO_NOTIFICATIONS)),
    preferences: {
      darkMode: true,
      emailAlerts: true,
      weeklyDigest: true,
      roadmapReminders: true,
      skillRecommendations: true,
      privacyLevel: 'Public'
    },
    careerIntelligence: {
      activeTargetCareer: 'AI & Machine Learning Engineering',
      targetSource: 'model_prediction',
      selectedSkills: ['python', 'machine_learning', 'data_analysis'],
      intelligenceResult: null,
      roadmapProgress: {},
      completedRoadmapItemIds: [],
      lastUpdated: null,
    },
    careerProjects: {},
  };
}

/**
 * Checks whether persistent student state exists in storage.
 */
export function hasStoredState(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Loads and migrates persistent student state from storage.
 * Safely falls back to null if storage is unavailable or corrupt.
 */
export function loadState(): StudentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const migrated = migrateState(parsed);
    return migrated;
  } catch (err) {
    console.warn('[CareerCompass Storage] Failed to load or parse stored state:', err);
    return null;
  }
}

/**
 * Saves current student state into versioned localStorage container.
 * No sensitive credentials or secrets are ever persisted.
 */
export function saveState(state: StudentState): void {
  try {
    const payload: StoredPayload = {
      version: STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
      state
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('[CareerCompass Storage] Failed to save student state:', err);
  }
}

/**
 * Clears persistent student state from storage.
 */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[CareerCompass Storage] Failed to clear student state:', err);
  }
}
