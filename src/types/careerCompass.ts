export type CareerTrack = 
  | 'AI & Machine Learning'
  | 'Data Science & Analytics'
  | 'Cloud & DevOps'
  | 'Full-Stack Software Engineering'
  | 'Cybersecurity'
  | 'Mobile Engineering';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type IntensityLevel = 'Low' | 'Medium' | 'High' | 'Very High';
export type SkillStatus = 'Strong' | 'Developing' | 'Needs Attention';
export type RoadmapStatus = 'Completed' | 'In Progress' | 'Available' | 'Locked';

export interface Career {
  id: string;
  title: string;
  slug: string;
  careerTrack: CareerTrack;
  shortDescription: string;
  overview: string;
  responsibilities: string[];
  coreSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  typicalTools: string[];
  learningDifficulty: DifficultyLevel;
  programmingIntensity: IntensityLevel;
  dataIntensity: IntensityLevel;
  cloudExposure: IntensityLevel;
  salaryRange: string;
  demandRating: 'High' | 'Very High' | 'Moderate';
  learningPathOverview: string[];
  recommendedProjectIds: string[];
  simulationIds: string[];
  demoMatchScore?: number;
  marketOutlook: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Programming' | 'Data' | 'Cloud' | 'AI/ML' | 'Database' | 'Tools' | 'Soft Skills';
  currentProficiency: number; // 0 - 100
  status: SkillStatus;
  evidence: string;
  lastAssessed: string;
  trend: 'up' | 'stable' | 'down';
  verified: boolean;
  description?: string;
  targetRoleScore?: number;
}

export interface SkillCategoryGroup {
  id: string;
  name: string;
  icon: string;
  color: string;
  skills: Skill[];
}

export interface SkillGapItem {
  skill: string;
  category: string;
  current: number;
  required: number;
  gap: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Strong' | 'Moderate' | 'Needs Development';
  recommendedAction: string;
  actionUrl?: string;
}

export type LearningPlatform = 
  | 'Coursera'
  | 'Pluralsight'
  | 'DataCamp'
  | 'Forage'
  | 'edX'
  | 'Internal'
  | 'Official Docs';

export type ResourceType = 'Course' | 'Learning Path' | 'Project' | 'Simulation' | 'Specialization';

export interface LearningResource {
  id: string;
  platform: LearningPlatform;
  title: string;
  careerTracks: CareerTrack[];
  skills: string[];
  level: DifficultyLevel;
  duration: string;
  resourceType: ResourceType;
  description: string;
  url?: string | null;
  lastVerified: string;
  active: boolean;
  progress?: number;
  enrolled?: boolean;
  rating?: number;
  badge?: string;
}

export interface LearningStage {
  stageNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'available' | 'locked';
  progress: number;
  prerequisites: string[];
  skills: string[];
  resourceIds: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  careerTrack: CareerTrack;
  description: string;
  estimatedDuration: string;
  totalStages: number;
  completedStages: number;
  stages: LearningStage[];
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  skills: string[];
  estimatedDuration: string;
  careerTracks: CareerTrack[];
  status: 'Not Started' | 'In Progress' | 'Completed';
  problemStatement: string;
  objectives: string[];
  prerequisites: string[];
  tasks: ProjectTask[];
  deliverables: string[];
  progress: number;
  githubUrl?: string;
  liveDemoUrl?: string;
}

export interface SimulationTask {
  id: string;
  stepNumber: number;
  title: string;
  brief: string;
  duration: string;
  status: 'todo' | 'in-progress' | 'completed';
  instructions: string;
  deliverableType: string;
}

export interface Simulation {
  id: string;
  title: string;
  companyContext: string;
  careerTrack: CareerTrack;
  skills: string[];
  difficulty: DifficultyLevel;
  estimatedDuration: string;
  status: 'Available' | 'In Progress' | 'Completed';
  progress: number;
  tasks: SimulationTask[];
}

export interface RoadmapItem {
  id: string;
  phaseId: string;
  phaseNumber: number;
  phaseTitle: string;
  title: string;
  description: string;
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  progress: number;
  prerequisite: string;
  resource: string;
  status: RoadmapStatus;
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  phaseTitle: string;
  subtitle: string;
  status: 'completed' | 'current' | 'locked';
  items: RoadmapItem[];
}

export interface PredictionRecord {
  id: string;
  date: string;
  predictedCareer: string;
  confidenceEstimate: number; // In demo records: mock score. In real ML: rounded model-predicted probability (0-100).
  assessmentVersion: string;
  skillProfileVersion: string;
  whatChanged: string[];
  alternativeTracks: { name: string; probability: number }[];
  isRealMl?: boolean;
  submittedSkills?: string[];
  recognizedSkills?: string[];
  unknownSkills?: string[];
  modelType?: string;
  featureConfiguration?: string;
  probabilities?: { career_track: string; probability: number }[];
}


export interface Certificate {
  id: string;
  title: string;
  provider: string;
  issueDate: string;
  expiryDate?: string;
  skills: string[];
  credentialId?: string;
  credentialUrl?: string;
  verificationUrl?: string;
  skill?: string;
  status: 'Verified' | 'In Review' | 'Self-Reported';
}

export interface Achievement {
  id: string;
  title: string;
  date: string;
  reason: string;
  badgeIcon: string;
  category: 'Skill' | 'Project' | 'Consistency' | 'Milestone';
  points: number;
}

export interface NotificationItemData {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'assessment' | 'roadmap' | 'learning' | 'skill' | 'system';
  actionUrl?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface AssessmentQuestion {
  id: string;
  questionNumber: number;
  topic: string;
  difficulty: DifficultyLevel;
  stem: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
}
