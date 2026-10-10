import { NotificationItemData } from '@/types/careerCompass';

export const DEMO_NOTIFICATIONS: NotificationItemData[] = [
  {
    id: 'notif-1',
    title: 'SQL Assessment Ready',
    message: 'Your SQL skill assessment is ready. Complete it to update your verified proficiency badge.',
    timestamp: '15 minutes ago',
    read: false,
    type: 'assessment',
    actionUrl: '/skills/assessment'
  },
  {
    id: 'notif-2',
    title: 'New Roadmap Milestone Available',
    message: 'Your roadmap has a new available milestone: "Supervised Learning & Algorithm Optimization" is now unlocked.',
    timestamp: '2 hours ago',
    read: false,
    type: 'roadmap',
    actionUrl: '/roadmap'
  },
  {
    id: 'notif-3',
    title: 'Learning Activity Logged',
    message: 'You completed a learning activity in "Statistical Thinking & Probability Distributions". +35 XP earned.',
    timestamp: 'Yesterday',
    read: true,
    type: 'learning',
    actionUrl: '/progress'
  },
  {
    id: 'notif-4',
    title: 'Skill Profile Synchronized',
    message: 'Your skill profile was updated: Python proficiency verified at 82% following repository analysis.',
    timestamp: '3 days ago',
    read: true,
    type: 'skill',
    actionUrl: '/skills'
  },
  {
    id: 'notif-5',
    title: 'Job Simulation Progress Saved',
    message: 'Cognizant AI Simulation Task 2 deliverable recorded. Review Task 3 instructions when ready.',
    timestamp: '5 days ago',
    read: true,
    type: 'system',
    actionUrl: '/learning/experience'
  }
];
