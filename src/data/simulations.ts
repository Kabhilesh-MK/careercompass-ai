import { Simulation } from '@/types/careerCompass';

export const DEMO_SIMULATIONS: Simulation[] = [
  {
    id: 'sim-cognizant-ai',
    title: 'Cognizant AI & Machine Learning Consultant Simulation',
    companyContext: 'Cognizant Digital Business & Technology Practice',
    careerTrack: 'AI & Machine Learning',
    skills: ['Machine Learning', 'Python', 'Technical Communication', 'Data Modeling'],
    difficulty: 'Intermediate',
    estimatedDuration: '5-6 Hours',
    status: 'In Progress',
    progress: 60,
    tasks: [
      {
        id: 'c-task-1',
        stepNumber: 1,
        title: 'Exploratory Data Analysis for Smart Supply Chain Client',
        brief: 'An international grocery retailer client wants to predict stockouts across 45 regional fulfillment centers.',
        duration: '1.5 hours',
        status: 'completed',
        instructions: 'Load the customer transaction records and inventory snapshot tables. Identify missing values, skewness in perishable items, and determine correlation with holiday delivery schedules.',
        deliverableType: 'Executive Summary Python Notebook (.ipynb)'
      },
      {
        id: 'c-task-2',
        stepNumber: 2,
        title: 'Feature Engineering for Perishable Goods Demand',
        brief: 'Raw dates and item quantities need to be transformed into rolling time-series signals.',
        duration: '1.5 hours',
        status: 'completed',
        instructions: 'Construct 7-day and 30-day lag features, weekend binary flags, promotional discount indicators, and temperature deviation scores.',
        deliverableType: 'Engineered Features Dataset & Python Script'
      },
      {
        id: 'c-task-3',
        stepNumber: 3,
        title: 'Model Evaluation & Metric Trade-Off Analysis',
        brief: 'Compare baseline Random Forest against Gradient Boosting and assess over-prediction vs under-prediction costs.',
        duration: '1.5 hours',
        status: 'in-progress',
        instructions: 'Under-stocking results in lost revenue, while over-stocking perishables causes waste. Implement asymmetric cost-weighted RMSE evaluation metric.',
        deliverableType: 'Model Comparison Matrix & Evaluation Code'
      },
      {
        id: 'c-task-4',
        stepNumber: 4,
        title: 'Client Executive Presentation & Rollout Strategy',
        brief: 'Synthesize complex statistical findings into clear business value for the Chief Supply Chain Officer.',
        duration: '1.0 hour',
        status: 'todo',
        instructions: 'Create a concise 4-slide presentation highlighting predicted cost reductions, edge-case risks, and Phase 1 pilot rollout timeline.',
        deliverableType: 'Executive Presentation Deck (PDF/Slides)'
      }
    ]
  },
  {
    id: 'sim-jpmc-quant',
    title: 'JPMorgan Chase Quantitative Technology Simulation',
    companyContext: 'JPMorgan Chase & Co. Markets & Quantitative Research',
    careerTrack: 'Data Science & Analytics',
    skills: ['Statistics', 'Python', 'Financial Modeling', 'SQL'],
    difficulty: 'Advanced',
    estimatedDuration: '4-5 Hours',
    status: 'Available',
    progress: 0,
    tasks: [
      {
        id: 'j-task-1',
        stepNumber: 1,
        title: 'Historical Natural Gas Storage Contract Valuation',
        brief: 'Estimate the fair value of an underground natural gas storage injection contract based on seasonal forward curves.',
        duration: '1.5 hours',
        status: 'todo',
        instructions: 'Write a valuation function that models injection costs, summer-winter spread differentials, and storage capacity constraints.',
        deliverableType: 'Python Pricing Script (.py)'
      },
      {
        id: 'j-task-2',
        stepNumber: 2,
        title: 'Credit Risk Probability of Default (PD) Modeling',
        brief: 'Build a logistic regression scoring model to classify borrower default risk using FICO scores and debt-to-income metrics.',
        duration: '1.5 hours',
        status: 'todo',
        instructions: 'Calculate Weight of Evidence (WoE) and Information Value (IV) for continuous features. Fit the calibrated scorecard model.',
        deliverableType: 'Credit Scorecard Notebook'
      },
      {
        id: 'j-task-3',
        stepNumber: 3,
        title: 'Algorithmic Execution & Order Book Simulation',
        brief: 'Simulate high-frequency order matching and compute market impact for a $50M block order.',
        duration: '1.5 hours',
        status: 'todo',
        instructions: 'Implement TWAP (Time-Weighted Average Price) and VWAP strategies to minimize market slippage.',
        deliverableType: 'Execution Engine Simulation Code'
      }
    ]
  },
  {
    id: 'sim-cloud-platform',
    title: 'AWS Enterprise Cloud Architecture Simulation',
    companyContext: 'Amazon Web Services Solutions Architecture Team',
    careerTrack: 'Cloud & DevOps',
    skills: ['AWS Cloud Fundamentals', 'Docker', 'Linux', 'System Architecture'],
    difficulty: 'Intermediate',
    estimatedDuration: '4 Hours',
    status: 'Available',
    progress: 0,
    tasks: [
      {
        id: 'aws-task-1',
        stepNumber: 1,
        title: 'High-Availability Multi-AZ Architecture Diagramming',
        brief: 'Design a resilient architecture for a global healthcare records portal requiring 99.99% availability.',
        duration: '1.0 hour',
        status: 'todo',
        instructions: 'Formulate public and private subnets, Application Load Balancers, Multi-AZ RDS failover, and Auto Scaling groups.',
        deliverableType: 'Architecture Diagram & Specification'
      },
      {
        id: 'aws-task-2',
        stepNumber: 2,
        title: 'Terraform Infrastructure as Code Configuration',
        brief: 'Translate the architecture design into declarative, repeatable Terraform modules.',
        duration: '1.5 hours',
        status: 'todo',
        instructions: 'Write main.tf, variables.tf, and outputs.tf defining VPC, subnets, and security group egress/ingress rules.',
        deliverableType: 'Terraform Module Codebase'
      },
      {
        id: 'aws-task-3',
        stepNumber: 3,
        title: 'Disaster Recovery Runbook & Cost Optimization Plan',
        brief: 'Draft RTO/RPO SLA definitions and identify reserved instance savings.',
        duration: '1.5 hours',
        status: 'todo',
        instructions: 'Specify cross-region snapshot replication policies and compute estimated monthly AWS cost savings.',
        deliverableType: 'Disaster Recovery Runbook & Cost Report'
      }
    ]
  }
];
