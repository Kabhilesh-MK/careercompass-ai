import { PredictionRecord } from '@/types/careerCompass';

export const DEMO_PREDICTION_CURRENT = {
  predictedCareer: 'AI & Machine Learning Engineering',
  careerTrack: 'AI & Machine Learning',
  confidenceEstimate: 86, // Clearly marked DEMO
  confidenceNote: 'Demo model estimate based on current academic profile & verified repository skills.',
  alternativeTracks: [
    { name: 'Data Scientist', probability: 78 },
    { name: 'MLOps & Platform Engineer', probability: 72 },
    { name: 'Full-Stack Software Engineer', probability: 68 },
    { name: 'Data Engineer', probability: 65 },
    { name: 'Cloud & DevOps Engineer', probability: 61 }
  ],
  explanation: {
    title: 'Why this prediction?',
    demoDisclaimer: 'This explanation is generated from mock skill profile heuristics for demonstration purposes.',
    summary: 'Your high proficiency in Python (82%), analytical coursework in Statistics (48%), strong problem-solving assessment scores, and active engagement with data manipulation libraries align strongly with modern AI/ML engineering competencies.',
    strengthsIdentified: [
      'Strong Python algorithmic syntax and object-oriented foundations',
      'Solid command of Git collaborative workflows and repository organization',
      'Demonstrated interest in predictive modeling through completed churn analysis projects',
      'High quantitative aptitude and logical problem decomposition'
    ],
    primaryGapsToBridge: [
      'Advanced Supervised & Deep Learning practical implementation (+33% gap)',
      'Relational query optimization with SQL window functions (+14% gap)',
      'Production containerization with Docker and cloud microservice deployment'
    ]
  },
  assessmentVersion: 'v2.1-preview',
  skillProfileVersion: 'profile-2026.09.28'
};

export const DEMO_PREDICTION_HISTORY: PredictionRecord[] = [
  {
    id: 'pred-rec-3',
    date: '2026-09-28',
    predictedCareer: 'AI & Machine Learning Engineering',
    confidenceEstimate: 86,
    assessmentVersion: 'v2.1-preview',
    skillProfileVersion: 'profile-2026.09.28',
    whatChanged: [
      'SQL skill increased from 52% to 61% after completing Database Lab',
      'Customer Churn portfolio repository verified on GitHub',
      'Technical Communication assessment evaluated at 85%'
    ],
    alternativeTracks: [
      { name: 'Data Scientist', probability: 78 },
      { name: 'MLOps Engineer', probability: 72 },
      { name: 'Full-Stack Engineer', probability: 68 }
    ]
  },
  {
    id: 'pred-rec-2',
    date: '2026-08-15',
    predictedCareer: 'Data Scientist',
    confidenceEstimate: 76,
    assessmentVersion: 'v2.0',
    skillProfileVersion: 'profile-2026.08.15',
    whatChanged: [
      'Python assessment completed (+12% proficiency increase)',
      'Statistics Foundations coursework enrolled',
      'AWS Cloud Practitioner certified'
    ],
    alternativeTracks: [
      { name: 'AI & Machine Learning Engineer', probability: 72 },
      { name: 'Data Analyst', probability: 68 },
      { name: 'Full-Stack Engineer', probability: 64 }
    ]
  },
  {
    id: 'pred-rec-1',
    date: '2026-07-01',
    predictedCareer: 'Full-Stack Software Engineer',
    confidenceEstimate: 69,
    assessmentVersion: 'v1.4',
    skillProfileVersion: 'profile-2026.07.01',
    whatChanged: [
      'Initial student profile registration completed',
      'Core web development skills recorded (React, JavaScript)',
      'First diagnostic assessment taken'
    ],
    alternativeTracks: [
      { name: 'Data Analyst', probability: 62 },
      { name: 'Frontend Engineer', probability: 60 },
      { name: 'AI & Machine Learning Engineer', probability: 55 }
    ]
  }
];
