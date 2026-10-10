import { 
  Skill, 
  SkillGapItem, 
  LearningResource, 
  LearningPath, 
  Project, 
  Simulation, 
  RoadmapPhase, 
  RoadmapItem,
  RoadmapStatus,
  PredictionRecord, 
  Certificate, 
  Achievement, 
  NotificationItemData 
} from './careerCompass';

export interface StudentProfile {
  name: string;
  email: string;
  headline: string;
  bio: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  education: {
    degree: string;
    institution: string;
    gradYear: number | string;
    gpa: number | string;
  };
  targetCareer: string;
  interests: string[];
  completeness: number; // 0 - 100
  careerPreferences: {
    preferredTrack: string;
    workMode: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
    expectedGraduation: string;
  };
}

export interface AssessmentRecord {
  id: string;
  skillId: string;
  skillName: string;
  answers: Record<string, string>; // questionId -> optionId
  score: number; // percentage 0 - 100
  totalQuestions: number;
  correctCount: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  completedAt: string;
  derivedProficiency: number;
  strongAreas: string[];
  weakAreas: string[];
  recommendedAction?: string;
}

export interface PreferencesState {
  darkMode: boolean;
  emailAlerts: boolean;
  weeklyDigest: boolean;
  roadmapReminders: boolean;
  skillRecommendations: boolean;
  privacyLevel: 'Public' | 'Private' | 'Recruiters Only';
}

export interface CareerProjectRecord {
  projectId: string;
  status: 'planned' | 'in_progress' | 'completed';
  completedEvidence: string[];
  deliverableLinks?: Record<string, string>;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface StudentState {
  profile: StudentProfile;
  skills: Skill[];
  assessments: AssessmentRecord[];
  skillGaps: SkillGapItem[];
  learningResources: LearningResource[];
  learningPaths: LearningPath[];
  roadmap: RoadmapPhase[];
  projects: Project[];
  simulations: Simulation[];
  certificates: Certificate[];
  achievements: Achievement[];
  predictionHistory: PredictionRecord[];
  notifications: NotificationItemData[];
  preferences: PreferencesState;
  careerIntelligence?: CareerIntelligenceState;
  careerProjects?: Record<string, CareerProjectRecord>;
}

export interface CareerIntelligenceState {
  activeTargetCareer: string;
  targetSource: 'model_prediction' | 'user_selected';
  selectedSkills: string[];
  intelligenceResult: any | null;
  roadmapProgress: Record<string, 'not_started' | 'in_progress' | 'completed'>;
  completedRoadmapItemIds: string[];
  lastUpdated: string | null;
}

export type AppStateAction =
  // CAREER INTELLIGENCE (PHASE 5 & 6)
  | { type: 'SET_CAREER_INTELLIGENCE'; payload: { intelligence: any; selectedSkills: string[] } }
  | { type: 'SET_CAREER_TARGET_OVERRIDE'; payload: { targetCareer: string } }
  | { type: 'UPDATE_INTELLIGENCE_ROADMAP_STATUS'; payload: { itemId: string; status: 'not_started' | 'in_progress' | 'completed' } }
  | { type: 'UPDATE_CAREER_PROJECT_STATUS'; payload: { projectId: string; status: 'planned' | 'in_progress' | 'completed' } }
  | { type: 'TOGGLE_PROJECT_EVIDENCE'; payload: { projectId: string; evidenceItem: string } }
  | { type: 'UPDATE_PROJECT_DELIVERABLE_LINK'; payload: { projectId: string; deliverable: string; link: string } }

  // PROFILE
  | { type: 'UPDATE_PROFILE'; payload: Partial<StudentProfile> }

  // SKILLS
  | { type: 'UPDATE_SKILL'; payload: Skill }
  | { type: 'UPDATE_SKILL_PROFICIENCY'; payload: { skillId: string; proficiency: number; evidence?: string } }

  // ASSESSMENT
  | { type: 'START_ASSESSMENT'; payload: { skillId: string } }
  | { type: 'ANSWER_ASSESSMENT'; payload: { skillId: string; questionId: string; optionId: string } }
  | { type: 'COMPLETE_ASSESSMENT'; payload: AssessmentRecord }

  // ROADMAP
  | { type: 'START_ROADMAP_ITEM'; payload: { itemId: string } }
  | { type: 'COMPLETE_ROADMAP_ITEM'; payload: { itemId: string } }
  | { type: 'RESET_ROADMAP_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_ROADMAP_ITEM_STATUS'; payload: { itemId: string; status: RoadmapStatus } }

  // LEARNING
  | { type: 'START_RESOURCE'; payload: { resourceId: string } }
  | { type: 'UPDATE_RESOURCE_PROGRESS'; payload: { resourceId: string; progress: number } }
  | { type: 'COMPLETE_RESOURCE'; payload: { resourceId: string } }

  // PROJECTS
  | { type: 'START_PROJECT'; payload: { projectId: string } }
  | { type: 'UPDATE_PROJECT_PROGRESS'; payload: { projectId: string; progress: number; completedTaskId?: string } }
  | { type: 'COMPLETE_PROJECT'; payload: { projectId: string } }

  // SIMULATIONS
  | { type: 'START_SIMULATION'; payload: { simulationId: string } }
  | { type: 'COMPLETE_SIMULATION_TASK'; payload: { simulationId: string; taskId: string } }
  | { type: 'COMPLETE_SIMULATION'; payload: { simulationId: string } }

  // PORTFOLIO
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'ADD_CERTIFICATE'; payload: Certificate }
  | { type: 'ADD_ACHIEVEMENT'; payload: Achievement }

  // NOTIFICATIONS
  | { type: 'MARK_NOTIFICATION_READ'; payload: { notificationId: string } }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }

  // PREFERENCES
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<PreferencesState> }

  // PREDICTIONS
  | { type: 'RECORD_PREDICTION'; payload: PredictionRecord }

  // DEMO DATA MANAGEMENT
  | { type: 'RESET_DEMO_DATA' }
  | { type: 'SET_ENTIRE_STATE'; payload: StudentState };

