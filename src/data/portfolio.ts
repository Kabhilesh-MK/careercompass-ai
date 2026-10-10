import { Certificate, Achievement } from '@/types/careerCompass';

export const DEMO_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    title: 'AWS Certified Cloud Practitioner (CLF-C02)',
    provider: 'Amazon Web Services',
    issueDate: '2026-06-14',
    expiryDate: '2029-06-14',
    skills: ['AWS Cloud Fundamentals', 'Cloud Architecture', 'IAM', 'S3'],
    credentialId: 'AWS-CC-89412093',
    verificationUrl: 'https://aws.amazon.com/verification/AWS-CC-89412093',
    status: 'Verified'
  },
  {
    id: 'cert-2',
    title: 'DeepLearning.AI Python for Everybody Specialization',
    provider: 'Coursera / DeepLearning.AI',
    issueDate: '2026-04-18',
    skills: ['Python', 'Data Structures', 'Web Scraping', 'SQL'],
    credentialId: 'COURSERA-DL-492109',
    verificationUrl: 'https://coursera.org/verify/COURSERA-DL-492109',
    status: 'Verified'
  },
  {
    id: 'cert-3',
    title: 'Meta Front-End Developer Professional Certificate',
    provider: 'Meta',
    issueDate: '2025-11-20',
    skills: ['React', 'JavaScript', 'HTML/CSS', 'UI/UX Design'],
    credentialId: 'META-FE-9012481',
    verificationUrl: 'https://coursera.org/verify/META-FE-9012481',
    status: 'Verified'
  },
  {
    id: 'cert-4',
    title: 'TensorFlow Developer Certificate (In Progress)',
    provider: 'Google / TensorFlow',
    issueDate: 'Estimated: 2026-11-30',
    skills: ['TensorFlow', 'Deep Learning', 'Computer Vision'],
    credentialId: 'PENDING-ASSESSMENT',
    verificationUrl: '#',
    status: 'In Review'
  }
];

export const DEMO_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Consistent Explorer',
    date: '2026-09-28',
    reason: 'Maintained a 14-day consecutive learning streak across coursework and labs',
    badgeIcon: 'Flame',
    category: 'Consistency',
    points: 250
  },
  {
    id: 'ach-2',
    title: 'Python Mastery',
    date: '2026-09-15',
    reason: 'Demonstrated 80%+ proficiency in Python algorithmic evaluation',
    badgeIcon: 'Award',
    category: 'Skill',
    points: 400
  },
  {
    id: 'ach-3',
    title: 'Capstone Finisher',
    date: '2026-08-30',
    reason: 'Successfully designed, tested, and published the Customer Churn Predictor repository',
    badgeIcon: 'CheckCircle2',
    category: 'Project',
    points: 500
  },
  {
    id: 'ach-4',
    title: 'Milestone Conqueror',
    date: '2026-08-10',
    reason: 'Completed 100% of Phase 1 Foundation competencies in Career Roadmap',
    badgeIcon: 'Trophy',
    category: 'Milestone',
    points: 350
  },
  {
    id: 'ach-5',
    title: 'Insightful Communicator',
    date: '2026-07-22',
    reason: 'Drafted full technical documentation and SHAP explainability analysis for data stakeholders',
    badgeIcon: 'Sparkles',
    category: 'Skill',
    points: 200
  }
];
