export const currentUser = {
  id: 'u-template',
  name: 'Student User',
  firstName: 'Student',
  lastName: 'User',
  email: 'student@example.edu',
  role: 'Student',
  avatar: '',
  phone: '',
  location: '',
  bio: '',
  education: [],
  interests: [],
  social: {
    github: '',
    linkedin: '',
    portfolio: '',
  },
  joinedAt: '',
  streak: 0,
  rank: 0,
};

export const stats = {
  skillsTracked: 42,
  coursesCompleted: 8,
  certificationsEarned: 3,
  projectsBuilt: 6,
  hoursLearned: 128,
  placementReadiness: 74,
  careerMatchScore: 86,
  weeklyGoalProgress: 68,
};

export const careerMatchScores = [
  { name: 'ML Engineer', score: 86 },
  { name: 'Full-Stack Dev', score: 78 },
  { name: 'Data Scientist', score: 71 },
  { name: 'Cloud Engineer', score: 64 },
  { name: 'DevOps Engineer', score: 58 },
  { name: 'Mobile Dev', score: 52 },
];

export const skillGapOverview = [
  { name: 'Programming', current: 88, required: 90 },
  { name: 'Web Dev', current: 76, required: 85 },
  { name: 'Database', current: 70, required: 80 },
  { name: 'AI / ML', current: 62, required: 88 },
  { name: 'Cloud', current: 48, required: 75 },
  { name: 'Soft Skills', current: 80, required: 82 },
];

export const placementBreakdown = [
  { subject: 'Aptitude', score: 82 },
  { subject: 'Technical', score: 76 },
  { subject: 'Communication', score: 88 },
  { subject: 'Problem Solving', score: 79 },
  { subject: 'System Design', score: 61 },
  { subject: 'Projects', score: 84 },
];

export const weeklyActivity = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3.2 },
  { day: 'Wed', hours: 1.8 },
  { day: 'Thu', hours: 4.1 },
  { day: 'Fri', hours: 2.9 },
  { day: 'Sat', hours: 5.2 },
  { day: 'Sun', hours: 3.6 },
];

export const skillTrend = [
  { month: 'Jan', level: 45 },
  { month: 'Feb', level: 52 },
  { month: 'Mar', level: 58 },
  { month: 'Apr', level: 64 },
  { month: 'May', level: 71 },
  { month: 'Jun', level: 78 },
  { month: 'Jul', level: 82 },
];

export const roadmapTimeline = [
  {
    id: 'w1',
    week: 'Week 1-2',
    title: 'Python for Data Science',
    status: 'completed' as const,
    progress: 100,
    description: 'NumPy, Pandas, Matplotlib fundamentals for data manipulation and visualization.',
  },
  {
    id: 'w2',
    week: 'Week 3-4',
    title: 'Machine Learning Foundations',
    status: 'completed' as const,
    progress: 100,
    description: 'Supervised & unsupervised learning, scikit-learn, model evaluation.',
  },
  {
    id: 'w3',
    week: 'Week 5-6',
    title: 'Deep Learning with TensorFlow',
    status: 'in-progress' as const,
    progress: 65,
    description: 'Neural networks, CNNs, RNNs, and transfer learning techniques.',
  },
  {
    id: 'w4',
    week: 'Week 7-8',
    title: 'MLOps & Model Deployment',
    status: 'upcoming' as const,
    progress: 0,
    description: 'Docker, MLflow, CI/CD for ML, and cloud deployment patterns.',
  },
  {
    id: 'w5',
    week: 'Week 9-10',
    title: 'Capstone: End-to-End ML System',
    status: 'upcoming' as const,
    progress: 0,
    description: 'Build and deploy a production-grade recommendation system.',
  },
];

export const recentActivity = [
  { id: 'a1', type: 'course', title: 'Completed "Advanced React Patterns"', time: '2 hours ago', icon: 'BookOpen' },
  { id: 'a2', type: 'skill', title: 'Added skill: TensorFlow', time: '5 hours ago', icon: 'Sparkles' },
  { id: 'a3', type: 'project', title: 'Published project: Sentiment Analyzer', time: '1 day ago', icon: 'FolderGit2' },
  { id: 'a4', type: 'cert', title: 'Earned AWS Cloud Practitioner cert', time: '3 days ago', icon: 'Award' },
  { id: 'a5', type: 'assessment', title: 'Scored 82% in Technical Aptitude', time: '5 days ago', icon: 'ClipboardCheck' },
];

export const quickActions = [
  { id: 'q1', label: 'Upload Resume', icon: 'FileUp', color: 'primary' },
  { id: 'q2', label: 'Take Assessment', icon: 'ClipboardList', color: 'secondary' },
  { id: 'q3', label: 'Ask AI Mentor', icon: 'MessageSquare', color: 'success' },
  { id: 'q4', label: 'View Roadmap', icon: 'Map', color: 'warning' },
];

export const notifications = [
  { id: 'n1', title: 'New career match available', desc: 'ML Engineer role matches 86% of your skills', time: '10 min ago', read: false, type: 'career' },
  { id: 'n2', title: 'Roadmap milestone completed', desc: 'You finished "Machine Learning Foundations"', time: '2 hours ago', read: false, type: 'roadmap' },
  { id: 'n3', title: 'Certification deadline approaching', desc: 'TensorFlow Developer cert in 5 days', time: '1 day ago', read: true, type: 'cert' },
  { id: 'n4', title: 'Weekly progress report ready', desc: 'You learned 18.3 hours this week', time: '2 days ago', read: true, type: 'report' },
];

export const suggestedProject = {
  id: 'sp1',
  title: 'Resume Parser with NLP',
  difficulty: 'Intermediate',
  technologies: ['Python', 'spaCy', 'FastAPI', 'React'],
  duration: '2-3 weeks',
  matchScore: 92,
  description: 'Build an end-to-end resume parser that extracts skills, experience, and education from PDF resumes using NLP, with a clean dashboard to visualize results.',
  skillsGained: ['NLP', 'Information Extraction', 'API Design'],
};

export const nextStep = {
  title: 'Complete "Deep Learning with TensorFlow"',
  reason: 'This is the highest-impact skill for your top career match (ML Engineer) and closes a 26-point gap.',
  eta: '2 weeks',
  module: 'Week 5-6 of your roadmap',
};

export const topCareer = {
  title: 'Machine Learning Engineer',
  match: 86,
  salary: '₹12-28 LPA',
  growth: 'High',
  description: 'Design, build, and deploy ML systems at scale. Strong demand across product, finance, and healthcare sectors.',
  keySkills: ['Python', 'TensorFlow', 'MLOps', 'Statistics', 'Cloud'],
};
