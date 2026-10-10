import { Project } from '@/types/careerCompass';

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-resume-nlp',
    title: 'Intelligent Resume Parser & Skill Extractor',
    difficulty: 'Intermediate',
    skills: ['Python', 'NLP', 'FastAPI', 'Machine Learning'],
    estimatedDuration: '3 Weeks',
    careerTracks: ['AI & Machine Learning', 'Data Science & Analytics'],
    status: 'In Progress',
    problemStatement: 'Recruiters spend up to 75% of their screening time manually parsing resumes formatted in inconsistent PDFs and DOCX files. An automated natural language entity extraction pipeline is needed to parse unstructured text into standardized JSON skill taxonomies.',
    objectives: [
      'Extract text, contact metadata, and work experience from arbitrary PDF resumes',
      'Train a Named Entity Recognition (NER) pipeline to classify technical and soft skills',
      'Compute semantic similarity scores between candidate profiles and job descriptions',
      'Expose a containerized FastAPI endpoint for synchronous scoring'
    ],
    prerequisites: ['Python intermediate proficiency', 'Basic Regex and text tokenization', 'Familiarity with REST APIs'],
    tasks: [
      { id: 't1', title: 'Implement PDF text extraction with PyPDF2 and pdfplumber', completed: true },
      { id: 't2', title: 'Clean and tokenize text, stripping special formatting and headers', completed: true },
      { id: 't3', title: 'Extract skills against standard taxonomy and spaCy entity matcher', completed: true },
      { id: 't4', title: 'Implement cosine similarity scoring using TF-IDF and word embeddings', completed: false },
      { id: 't5', title: 'Build interactive FastAPI endpoint with Swagger documentation', completed: false }
    ],
    deliverables: [
      'Clean modular Python repository with tests and requirements.txt',
      'FastAPI server script with /parse and /score endpoints',
      'Evaluation benchmark report detailing precision and recall metrics'
    ],
    progress: 60,
    githubUrl: 'https://github.com/alex-johnson/resume-nlp-extractor',
    liveDemoUrl: 'https://resume-parser-demo.internal'
  },
  {
    id: 'proj-fraud-ml',
    title: 'Real-Time Financial Transaction Fraud Classifier',
    difficulty: 'Advanced',
    skills: ['Machine Learning', 'Python', 'Docker', 'Statistics'],
    estimatedDuration: '4 Weeks',
    careerTracks: ['AI & Machine Learning'],
    status: 'Not Started',
    problemStatement: 'Credit card transaction fraud manifests as a heavily imbalanced classification challenge (<0.2% positive fraud cases). Conventional classifiers collapse to predicting the majority negative class, demanding advanced resampling and cost-sensitive loss modeling.',
    objectives: [
      'Address severe class imbalance using SMOTE and focal loss techniques',
      'Train ensemble models (XGBoost, LightGBM) and evaluate PR-AUC curves',
      'Implement real-time threshold calibration to optimize financial loss vs false positive friction',
      'Package model artifact into Docker container with sub-50ms latency'
    ],
    prerequisites: ['Supervised Machine Learning', 'scikit-learn and pandas mastery', 'Basic Docker command line'],
    tasks: [
      { id: 't1', title: 'Exploratory data analysis on 280,000 anonymized transaction vectors', completed: false },
      { id: 't2', title: 'Feature scaling and SMOTE synthetic sample generation', completed: false },
      { id: 't3', title: 'Hyperparameter tuning with Bayesian optimization', completed: false },
      { id: 't4', title: 'Containerization and stress testing with simulated request bursts', completed: false }
    ],
    deliverables: [
      'Jupyter research notebook with ROC-AUC & PR-AUC analysis',
      'Serialized model weights (.joblib / ONNX format)',
      'Dockerfile and docker-compose.yml configuration'
    ],
    progress: 0,
    githubUrl: 'https://github.com/alex-johnson/fraud-detection-system'
  },
  {
    id: 'proj-ecommerce-churn',
    title: 'Customer Churn Predictor & Retention Strategy',
    difficulty: 'Beginner',
    skills: ['Python', 'SQL', 'Data Visualization', 'Statistics'],
    estimatedDuration: '2 Weeks',
    careerTracks: ['Data Science & Analytics'],
    status: 'Completed',
    problemStatement: 'A subscription SaaS platform experienced a 12% quarterly churn rate. Leadership required predictive flags on at-risk accounts 30 days prior to contract renewal alongside actionable churn feature attributions.',
    objectives: [
      'Extract behavioral logs across 50,000 customers from PostgreSQL',
      'Engineer cohort recency, frequency, and monetary (RFM) metrics',
      'Train logistic regression and random forest classification models',
      'Deliver SHAP value summary plots to customer success teams'
    ],
    prerequisites: ['Basic SQL queries', 'Python pandas and matplotlib fundamentals'],
    tasks: [
      { id: 't1', title: 'Aggregate telemetry events in PostgreSQL into user-month tables', completed: true },
      { id: 't2', title: 'Perform missing value imputation and one-hot encoding', completed: true },
      { id: 't3', title: 'Fit Random Forest classifier and extract feature importances', completed: true },
      { id: 't4', title: 'Generate executive summary slides with recommended retention incentives', completed: true }
    ],
    deliverables: [
      'Reproducible Python scripts and processed dataset',
      'SHAP interpretability graphs highlighting top churn indicators',
      'Executive 5-slide PDF deck with strategic recommendations'
    ],
    progress: 100,
    githubUrl: 'https://github.com/alex-johnson/customer-churn-analytics',
    liveDemoUrl: 'https://churn-analytics.internal'
  },
  {
    id: 'proj-k8s-mlops',
    title: 'Automated MLOps Pipeline on Kubernetes & MLflow',
    difficulty: 'Advanced',
    skills: ['MLOps', 'Docker', 'Kubernetes', 'CI/CD'],
    estimatedDuration: '4 Weeks',
    careerTracks: ['AI & Machine Learning', 'Cloud & DevOps'],
    status: 'Not Started',
    problemStatement: 'Data scientists frequently manually copy model binaries to cloud virtual machines with zero version tracking or automated rollback mechanisms, causing production discrepancies and downtime.',
    objectives: [
      'Set up local Kubernetes cluster (Minikube / Kind) with Helm charts',
      'Configure centralized MLflow tracking server with S3 artifact backend',
      'Build GitHub Actions workflow to run unit tests and trigger model training upon push',
      'Deploy model using blue-green deployment strategy behind an NGINX ingress'
    ],
    prerequisites: ['Docker containerization', 'Basic Kubernetes concepts (Pods, Services, Deployments)', 'Git'],
    tasks: [
      { id: 't1', title: 'Deploy MLflow tracking server on Kubernetes using Helm', completed: false },
      { id: 't2', title: 'Instrument training script to log hyperparameters and metrics to MLflow', completed: false },
      { id: 't3', title: 'Create GitHub Actions CI/CD workflow for automated container build', completed: false },
      { id: 't4', title: 'Implement Kubernetes RollingUpdate with health checks', completed: false }
    ],
    deliverables: [
      'Declarative Kubernetes YAML manifests and Helm values',
      'CI/CD pipeline configuration file (.github/workflows/deploy.yml)',
      'Architecture documentation diagram and runbook'
    ],
    progress: 0,
    githubUrl: 'https://github.com/alex-johnson/k8s-mlops-pipeline'
  }
];
