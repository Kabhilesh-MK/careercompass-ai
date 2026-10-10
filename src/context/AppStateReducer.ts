import { StudentState, AppStateAction } from '@/types/appState';
import { RoadmapStatus, SkillStatus } from '@/types/careerCompass';
import { getInitialState } from '@/services/persistence/storage';

function calculateSkillStatus(proficiency: number): SkillStatus {
  if (proficiency >= 75) return 'Strong';
  if (proficiency >= 55) return 'Developing';
  return 'Needs Attention';
}

export function appStateReducer(state: StudentState, action: AppStateAction): StudentState {
  switch (action.type) {
    case 'SET_CAREER_INTELLIGENCE': {
      const intel = action.payload.intelligence;
      const initialProgress: Record<string, 'not_started' | 'in_progress' | 'completed'> = {
        ...(state.careerIntelligence?.roadmapProgress || {}),
      };
      const completedIds: string[] = [...(state.careerIntelligence?.completedRoadmapItemIds || [])];

      if (Array.isArray(intel.roadmap)) {
        for (const item of intel.roadmap) {
          if (!initialProgress[item.id]) {
            initialProgress[item.id] = (item.status as any) || 'not_started';
          }
          if (initialProgress[item.id] === 'completed' && !completedIds.includes(item.id)) {
            completedIds.push(item.id);
          }
        }
      }

      return {
        ...state,
        careerIntelligence: {
          activeTargetCareer: intel.target_career_track,
          targetSource: intel.target_source,
          selectedSkills: action.payload.selectedSkills,
          intelligenceResult: intel,
          roadmapProgress: initialProgress,
          completedRoadmapItemIds: completedIds,
          lastUpdated: new Date().toISOString(),
        },
      };
    }

    case 'SET_CAREER_TARGET_OVERRIDE': {
      const current = state.careerIntelligence;
      if (!current) {
        return {
          ...state,
          careerIntelligence: {
            activeTargetCareer: action.payload.targetCareer,
            targetSource: 'user_selected',
            selectedSkills: [],
            intelligenceResult: null,
            roadmapProgress: {},
            completedRoadmapItemIds: [],
            lastUpdated: new Date().toISOString(),
          },
        };
      }
      return {
        ...state,
        careerIntelligence: {
          ...current,
          activeTargetCareer: action.payload.targetCareer,
          targetSource: 'user_selected',
          lastUpdated: new Date().toISOString(),
        },
      };
    }

    case 'UPDATE_INTELLIGENCE_ROADMAP_STATUS': {
      const { itemId, status } = action.payload;
      const current = state.careerIntelligence;
      if (!current) return state;

      const updatedProgress = {
        ...current.roadmapProgress,
        [itemId]: status,
      };

      const updatedCompleted = status === 'completed'
        ? Array.from(new Set([...current.completedRoadmapItemIds, itemId]))
        : current.completedRoadmapItemIds.filter((id) => id !== itemId);

      let newAchievements = state.achievements;
      if (status === 'completed') {
        const achId = `ach-roadmap-${itemId}`;
        if (!state.achievements.some((a) => a.id === achId)) {
          newAchievements = [
            {
              id: achId,
              title: `Milestone Achieved: ${itemId}`,
              date: new Date().toISOString().split('T')[0],
              reason: 'Completed career roadmap competency milestone.',
              badgeIcon: 'Map',
              category: 'Milestone' as const,
              points: 50,
            },
            ...state.achievements,
          ];
        }
      }

      return {
        ...state,
        achievements: newAchievements,
        careerIntelligence: {
          ...current,
          roadmapProgress: updatedProgress,
          completedRoadmapItemIds: updatedCompleted,
          lastUpdated: new Date().toISOString(),
        },
      };
    }

    case 'UPDATE_CAREER_PROJECT_STATUS': {
      const { projectId, status } = action.payload;
      const currentProjects = state.careerProjects || {};
      const existing = currentProjects[projectId] || {
        projectId,
        status: 'planned',
        completedEvidence: [],
        deliverableLinks: {},
      };

      const now = new Date().toISOString();
      const updatedRecord = {
        ...existing,
        status,
        startedAt: existing.startedAt || (status !== 'planned' ? now : undefined),
        completedAt: status === 'completed' ? now : status === 'in_progress' ? undefined : existing.completedAt,
      };

      const newProjects = {
        ...currentProjects,
        [projectId]: updatedRecord,
      };

      let newAchievements = state.achievements;
      let newNotifications = state.notifications;

      if (status === 'completed') {
        const achId = `ach-proj-${projectId}`;
        if (!state.achievements.some((a) => a.id === achId)) {
          const newAch = {
            id: achId,
            title: `Project Completed: ${projectId}`,
            date: now.split('T')[0],
            reason: `Successfully built engineering deliverables and portfolio evidence.`,
            badgeIcon: 'Code2',
            category: 'Project' as const,
            points: 100,
          };
          newAchievements = [newAch, ...state.achievements];
        }

        const newNotif = {
          id: `notif-${Date.now()}`,
          title: 'Project Completed',
          message: `Project ${projectId} marked completed. Evidence added to portfolio showcase.`,
          timestamp: 'Just now',
          read: false,
          type: 'learning' as const,
          actionUrl: '/portfolio/projects',
        };
        newNotifications = [newNotif, ...state.notifications];
      }

      return {
        ...state,
        careerProjects: newProjects,
        achievements: newAchievements,
        notifications: newNotifications,
      };
    }

    case 'TOGGLE_PROJECT_EVIDENCE': {
      const { projectId, evidenceItem } = action.payload;
      const currentProjects = state.careerProjects || {};
      const existing = currentProjects[projectId] || {
        projectId,
        status: 'in_progress',
        completedEvidence: [],
        deliverableLinks: {},
      };

      const alreadyHas = existing.completedEvidence.includes(evidenceItem);
      const updatedEvidence = alreadyHas
        ? existing.completedEvidence.filter((e) => e !== evidenceItem)
        : [...existing.completedEvidence, evidenceItem];

      return {
        ...state,
        careerProjects: {
          ...currentProjects,
          [projectId]: {
            ...existing,
            completedEvidence: updatedEvidence,
          },
        },
      };
    }

    case 'UPDATE_PROJECT_DELIVERABLE_LINK': {
      const { projectId, deliverable, link } = action.payload;
      const currentProjects = state.careerProjects || {};
      const existing = currentProjects[projectId] || {
        projectId,
        status: 'in_progress',
        completedEvidence: [],
        deliverableLinks: {},
      };

      return {
        ...state,
        careerProjects: {
          ...currentProjects,
          [projectId]: {
            ...existing,
            deliverableLinks: {
              ...(existing.deliverableLinks || {}),
              [deliverable]: link,
            },
          },
        },
      };
    }

    case 'UPDATE_PROFILE': {
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
          education: {
            ...state.profile.education,
            ...(action.payload.education || {})
          },
          careerPreferences: {
            ...state.profile.careerPreferences,
            ...(action.payload.careerPreferences || {})
          }
        }
      };
    }

    case 'UPDATE_SKILL': {
      return {
        ...state,
        skills: state.skills.map((sk) => (sk.id === action.payload.id ? action.payload : sk))
      };
    }

    case 'UPDATE_SKILL_PROFICIENCY': {
      const { skillId, proficiency, evidence } = action.payload;
      const targetSkill = state.skills.find((s) => s.id === skillId || s.name.toLowerCase() === skillId.toLowerCase());
      if (!targetSkill) return state;

      const newStatus = calculateSkillStatus(proficiency);
      const updatedSkills = state.skills.map((s) => {
        if (s.id === targetSkill.id) {
          return {
            ...s,
            currentProficiency: proficiency,
            status: newStatus,
            evidence: evidence || `Updated proficiency verified (${proficiency}%)`,
            lastAssessed: new Date().toISOString().split('T')[0] + ' (Verified)',
            trend: (proficiency > s.currentProficiency ? 'up' : proficiency < s.currentProficiency ? 'down' : 'stable') as 'up' | 'down' | 'stable'
          };
        }
        return s;
      });

      // Synchronize skill gaps
      const updatedSkillGaps = state.skillGaps.map((sg) => {
        if (sg.skill.toLowerCase() === targetSkill.name.toLowerCase()) {
          const gap = Math.max(0, sg.required - proficiency);
          return {
            ...sg,
            current: proficiency,
            gap,
            status: (proficiency >= sg.required ? 'Strong' : proficiency >= sg.required - 15 ? 'Moderate' : 'Needs Development') as 'Strong' | 'Moderate' | 'Needs Development'
          };
        }
        return sg;
      });

      return {
        ...state,
        skills: updatedSkills,
        skillGaps: updatedSkillGaps
      };
    }

    case 'COMPLETE_ASSESSMENT': {
      const record = action.payload;
      // Filter out existing assessment for the same skill or append
      const filtered = state.assessments.filter((a) => a.id !== record.id);
      const newAssessments = [record, ...filtered];

      // Update the skill's proficiency based on the assessment score
      const skillName = record.skillName;
      const targetSkill = state.skills.find(
        (s) => s.id === record.skillId || s.name.toLowerCase() === skillName.toLowerCase()
      );

      let updatedSkills = state.skills;
      let updatedSkillGaps = state.skillGaps;

      if (targetSkill) {
        const proficiency = record.derivedProficiency;
        const newStatus = calculateSkillStatus(proficiency);

        updatedSkills = state.skills.map((s) => {
          if (s.id === targetSkill.id) {
            return {
              ...s,
              currentProficiency: proficiency,
              status: newStatus,
              evidence: `Diagnostic Assessment Score: ${record.score}% (${record.skillLevel})`,
              lastAssessed: new Date().toISOString().split('T')[0] + ' (Assessment)',
              trend: 'up' as const
            };
          }
          return s;
        });

        updatedSkillGaps = state.skillGaps.map((sg) => {
          if (sg.skill.toLowerCase() === skillName.toLowerCase()) {
            const gap = Math.max(0, sg.required - proficiency);
            return {
              ...sg,
              current: proficiency,
              gap,
              status: (proficiency >= sg.required ? 'Strong' : proficiency >= sg.required - 15 ? 'Moderate' : 'Needs Development') as 'Strong' | 'Moderate' | 'Needs Development'
            };
          }
          return sg;
        });
      }

      // Add a system notification
      const newNotification = {
        id: `notif-${Date.now()}`,
        title: `${record.skillName} Assessment Completed`,
        message: `You completed the diagnostic assessment with a score of ${record.score}% (${record.skillLevel}).`,
        timestamp: 'Just now',
        read: false,
        type: 'assessment' as const,
        actionUrl: '/skills'
      };

      return {
        ...state,
        assessments: newAssessments,
        skills: updatedSkills,
        skillGaps: updatedSkillGaps,
        notifications: [newNotification, ...state.notifications]
      };
    }

    case 'START_ROADMAP_ITEM': {
      const { itemId } = action.payload;
      const updatedPhases = state.roadmap.map((phase) => ({
        ...phase,
        items: phase.items.map((item) => {
          if (item.id === itemId && item.status !== 'Completed') {
            return { ...item, status: 'In Progress' as RoadmapStatus, progress: Math.max(item.progress, 25) };
          }
          return item;
        })
      }));
      return { ...state, roadmap: updatedPhases };
    }

    case 'COMPLETE_ROADMAP_ITEM': {
      const { itemId } = action.payload;
      let completedItemTitle = '';

      const updatedPhases = state.roadmap.map((phase) => {
        let allCompleted = true;
        const newItems = phase.items.map((item) => {
          if (item.id === itemId) {
            completedItemTitle = item.title;
            return { ...item, status: 'Completed' as RoadmapStatus, progress: 100 };
          }
          if (item.status !== 'Completed') {
            allCompleted = false;
          }
          return item;
        });

        // If all items in this phase are now completed, mark phase completed
        const phaseStatus = allCompleted ? ('completed' as const) : phase.status;
        return {
          ...phase,
          status: phaseStatus,
          items: newItems
        };
      });

      // Also unlock the next locked item in line
      let unlockedOne = false;
      const finalPhases = updatedPhases.map((phase) => {
        const newItems = phase.items.map((item) => {
          if (!unlockedOne && item.status === 'Locked') {
            unlockedOne = true;
            return { ...item, status: 'Available' as RoadmapStatus };
          }
          return item;
        });
        return { ...phase, items: newItems };
      });

      const newNotif = {
        id: `notif-${Date.now()}`,
        title: 'Roadmap Milestone Completed',
        message: `Milestone "${completedItemTitle || 'Roadmap Step'}" marked as completed.`,
        timestamp: 'Just now',
        read: false,
        type: 'roadmap' as const,
        actionUrl: '/roadmap'
      };

      return {
        ...state,
        roadmap: finalPhases,
        notifications: [newNotif, ...state.notifications]
      };
    }

    case 'RESET_ROADMAP_ITEM': {
      const { itemId } = action.payload;
      const updatedPhases = state.roadmap.map((phase) => ({
        ...phase,
        items: phase.items.map((item) => {
          if (item.id === itemId) {
            return { ...item, status: 'Available' as RoadmapStatus, progress: 0 };
          }
          return item;
        })
      }));
      return { ...state, roadmap: updatedPhases };
    }

    case 'UPDATE_ROADMAP_ITEM_STATUS': {
      const { itemId, status } = action.payload;
      const updatedPhases = state.roadmap.map((phase) => ({
        ...phase,
        items: phase.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              status,
              progress: status === 'Completed' ? 100 : status === 'In Progress' ? Math.max(item.progress, 50) : 0
            };
          }
          return item;
        })
      }));
      return { ...state, roadmap: updatedPhases };
    }

    case 'START_RESOURCE': {
      const { resourceId } = action.payload;
      return {
        ...state,
        learningResources: state.learningResources.map((res) => {
          if (res.id === resourceId) {
            return { ...res, enrolled: true, progress: Math.max(res.progress || 0, 15), badge: 'In Progress' };
          }
          return res;
        })
      };
    }

    case 'UPDATE_RESOURCE_PROGRESS': {
      const { resourceId, progress } = action.payload;
      return {
        ...state,
        learningResources: state.learningResources.map((res) => {
          if (res.id === resourceId) {
            const isComplete = progress >= 100;
            return {
              ...res,
              enrolled: true,
              progress: Math.min(100, Math.max(0, progress)),
              badge: isComplete ? 'Completed' : 'In Progress'
            };
          }
          return res;
        })
      };
    }

    case 'COMPLETE_RESOURCE': {
      const { resourceId } = action.payload;
      return {
        ...state,
        learningResources: state.learningResources.map((res) => {
          if (res.id === resourceId) {
            return { ...res, enrolled: true, progress: 100, badge: 'Completed' };
          }
          return res;
        })
      };
    }

    case 'START_PROJECT': {
      const { projectId } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) => {
          if (p.id === projectId) {
            return { ...p, status: 'In Progress', progress: Math.max(p.progress, 20) };
          }
          return p;
        })
      };
    }

    case 'UPDATE_PROJECT_PROGRESS': {
      const { projectId, progress, completedTaskId } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) => {
          if (p.id === projectId) {
            const updatedTasks = completedTaskId
              ? p.tasks.map((t) => (t.id === completedTaskId ? { ...t, completed: true } : t))
              : p.tasks;
            const isDone = progress >= 100;
            return {
              ...p,
              tasks: updatedTasks,
              progress: Math.min(100, Math.max(0, progress)),
              status: isDone ? 'Completed' : 'In Progress'
            };
          }
          return p;
        })
      };
    }

    case 'COMPLETE_PROJECT': {
      const { projectId } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              status: 'Completed',
              progress: 100,
              tasks: p.tasks.map((t) => ({ ...t, completed: true }))
            };
          }
          return p;
        })
      };
    }

    case 'START_SIMULATION': {
      const { simulationId } = action.payload;
      return {
        ...state,
        simulations: state.simulations.map((sim) => {
          if (sim.id === simulationId) {
            return { ...sim, status: 'In Progress', progress: Math.max(sim.progress, 20) };
          }
          return sim;
        })
      };
    }

    case 'COMPLETE_SIMULATION_TASK': {
      const { simulationId, taskId } = action.payload;
      return {
        ...state,
        simulations: state.simulations.map((sim) => {
          if (sim.id === simulationId) {
            const updatedTasks = sim.tasks.map((t) => (t.id === taskId ? { ...t, status: 'completed' as const } : t));
            const completedCount = updatedTasks.filter((t) => t.status === 'completed').length;
            const progress = Math.round((completedCount / updatedTasks.length) * 100);
            const isAllComplete = completedCount === updatedTasks.length;
            return {
              ...sim,
              tasks: updatedTasks,
              progress,
              status: isAllComplete ? 'Completed' : 'In Progress'
            };
          }
          return sim;
        })
      };
    }

    case 'COMPLETE_SIMULATION': {
      const { simulationId } = action.payload;
      return {
        ...state,
        simulations: state.simulations.map((sim) => {
          if (sim.id === simulationId) {
            return {
              ...sim,
              status: 'Completed',
              progress: 100,
              tasks: sim.tasks.map((t) => ({ ...t, status: 'completed' as const }))
            };
          }
          return sim;
        })
      };
    }

    case 'ADD_PROJECT': {
      return {
        ...state,
        projects: [action.payload, ...state.projects]
      };
    }

    case 'ADD_CERTIFICATE': {
      const cert = action.payload;
      const achId = `ach-cert-${cert.id}`;
      let newAchievements = state.achievements;
      if (!state.achievements.some((a) => a.id === achId)) {
        newAchievements = [
          {
            id: achId,
            title: `Credential Recorded: ${cert.title}`,
            date: cert.issueDate || new Date().toISOString().split('T')[0],
            reason: `Earned professional credential from ${cert.provider}.`,
            badgeIcon: 'Award',
            category: 'Milestone' as const,
            points: 75,
          },
          ...state.achievements,
        ];
      }
      return {
        ...state,
        certificates: [cert, ...state.certificates],
        achievements: newAchievements,
      };
    }

    case 'ADD_ACHIEVEMENT': {
      return {
        ...state,
        achievements: [action.payload, ...state.achievements]
      };
    }

    case 'MARK_NOTIFICATION_READ': {
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload.notificationId ? { ...n, read: true } : n
        )
      };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true }))
      };
    }

    case 'UPDATE_PREFERENCES': {
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };
    }

    case 'RECORD_PREDICTION': {
      return {
        ...state,
        predictionHistory: [action.payload, ...state.predictionHistory]
      };
    }

    case 'RESET_DEMO_DATA': {
      return getInitialState();
    }

    case 'SET_ENTIRE_STATE': {
      return action.payload;
    }

    default:
      return state;
  }
}
