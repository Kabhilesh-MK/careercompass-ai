import { RoadmapPhase } from '@/types/careerCompass';

export const DEMO_ROADMAP_PHASES: RoadmapPhase[] = [
  {
    id: 'phase-1',
    phaseNumber: 1,
    phaseTitle: 'FOUNDATION',
    subtitle: 'Core programming language, algorithmic syntax, and version control discipline.',
    status: 'completed',
    items: [
      {
        id: 'rm-1',
        phaseId: 'phase-1',
        phaseNumber: 1,
        phaseTitle: 'FOUNDATION',
        title: 'Python for Data Structures & Computing',
        description: 'Master list comprehensions, object-oriented principles, generators, and vectorized NumPy array operations.',
        skill: 'Python',
        currentLevel: 82,
        requiredLevel: 85,
        progress: 100,
        prerequisite: 'None',
        resource: 'Python for Applied Data Science & AI (Coursera)',
        status: 'Completed'
      },
      {
        id: 'rm-2',
        phaseId: 'phase-1',
        phaseNumber: 1,
        phaseTitle: 'FOUNDATION',
        title: 'Git Version Control & Collaborative Hygiene',
        description: 'Maintain clean commit trees, branch PR conventions, semantic tags, and rebase strategies on GitHub.',
        skill: 'Git',
        currentLevel: 75,
        requiredLevel: 70,
        progress: 100,
        prerequisite: 'None',
        resource: 'Version Control with Git (Coursera)',
        status: 'Completed'
      }
    ]
  },
  {
    id: 'phase-2',
    phaseNumber: 2,
    phaseTitle: 'DATA FOUNDATION',
    subtitle: 'Relational data architectures, advanced SQL aggregations, and probability foundations.',
    status: 'current',
    items: [
      {
        id: 'rm-3',
        phaseId: 'phase-2',
        phaseNumber: 2,
        phaseTitle: 'DATA FOUNDATION',
        title: 'Relational Querying & Window Functions',
        description: 'Construct multi-table joins, subqueries, CTEs, and partition window functions for analytical feature extraction.',
        skill: 'SQL',
        currentLevel: 61,
        requiredLevel: 75,
        progress: 60,
        prerequisite: 'Python Foundations',
        resource: 'Advanced SQL for Data Engineers (DataCamp)',
        status: 'In Progress'
      },
      {
        id: 'rm-4',
        phaseId: 'phase-2',
        phaseNumber: 2,
        phaseTitle: 'DATA FOUNDATION',
        title: 'Inferential Statistics & Probability Theory',
        description: 'Calculate confidence intervals, formulate null and alternative hypotheses, and calculate p-values for A/B testing.',
        skill: 'Statistics',
        currentLevel: 48,
        requiredLevel: 70,
        progress: 45,
        prerequisite: 'Python Foundations',
        resource: 'Statistical Thinking in Python (DataCamp)',
        status: 'In Progress'
      }
    ]
  },
  {
    id: 'phase-3',
    phaseNumber: 3,
    phaseTitle: 'MACHINE LEARNING',
    subtitle: 'Predictive modeling, cross-validation, hyperparameter tuning, and neural networks.',
    status: 'locked',
    items: [
      {
        id: 'rm-5',
        phaseId: 'phase-3',
        phaseNumber: 3,
        phaseTitle: 'MACHINE LEARNING',
        title: 'Supervised Learning & Algorithm Optimization',
        description: 'Train logistic regressions, random forests, and gradient boosting trees with scikit-learn and XGBoost.',
        skill: 'Machine Learning',
        currentLevel: 42,
        requiredLevel: 75,
        progress: 25,
        prerequisite: 'Inferential Statistics & SQL',
        resource: 'Machine Learning Specialization (Coursera)',
        status: 'Available'
      },
      {
        id: 'rm-6',
        phaseId: 'phase-3',
        phaseNumber: 3,
        phaseTitle: 'MACHINE LEARNING',
        title: 'Model Evaluation, Bias-Variance, & Drift',
        description: 'Diagnose overfitting, calculate PR-AUC curves, configure stratified k-fold splits, and monitor data drift.',
        skill: 'Machine Learning',
        currentLevel: 42,
        requiredLevel: 75,
        progress: 0,
        prerequisite: 'Supervised Learning',
        resource: 'ML Model Evaluation & Validation (Coursera)',
        status: 'Locked'
      }
    ]
  },
  {
    id: 'phase-4',
    phaseNumber: 4,
    phaseTitle: 'EXPERIENCE & PRODUCTION',
    subtitle: 'Containerized deployment, cloud infrastructure, real-world portfolio capstone, and job simulations.',
    status: 'locked',
    items: [
      {
        id: 'rm-7',
        phaseId: 'phase-4',
        phaseNumber: 4,
        phaseTitle: 'EXPERIENCE & PRODUCTION',
        title: 'Containerized ML Microservice with Docker & FastAPI',
        description: 'Wrap trained models in high-throughput asynchronous REST APIs with Swagger docs and containerized builds.',
        skill: 'Docker',
        currentLevel: 35,
        requiredLevel: 70,
        progress: 0,
        prerequisite: 'Model Evaluation',
        resource: 'Containerizing ML Services with Docker (Pluralsight)',
        status: 'Locked'
      },
      {
        id: 'rm-8',
        phaseId: 'phase-4',
        phaseNumber: 4,
        phaseTitle: 'EXPERIENCE & PRODUCTION',
        title: 'Cognizant AI Practitioner Job Simulation',
        description: 'Execute end-to-end consulting simulation: exploratory analysis, lag feature engineering, and executive briefings.',
        skill: 'Technical Communication',
        currentLevel: 85,
        requiredLevel: 80,
        progress: 0,
        prerequisite: 'Supervised Learning & Docker',
        resource: 'Cognizant Job Simulation (Forage)',
        status: 'Locked'
      }
    ]
  }
];
