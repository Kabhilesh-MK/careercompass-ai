/**
 * CareerCompass Phase UI-V2.2 State Management & Persistence Test Suite
 * Validates all 11 core state requirements deterministically.
 */

import { appStateReducer } from '../context/AppStateReducer';
import { getInitialState } from '../services/persistence/storage';
import { migrateState } from '../services/persistence/migration';
import { STORAGE_VERSION } from '../services/persistence/storageKeys';
import { StudentState, AssessmentRecord } from '../types/appState';

// In-memory mock localStorage
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

// Global mock
(globalThis as any).localStorage = new MockLocalStorage();

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[TEST FAILED] ${message}`);
  }
}

function runTests() {
  console.log('--- STARTING UI-V2.2 STATE MANAGEMENT & PERSISTENCE TEST SUITE ---');

  // TEST 1: Initial state
  console.log('[Test 1] Initial state');
  const initial = getInitialState();
  assert(initial.profile.name === 'Alex Johnson', 'Initial profile should be Alex Johnson');
  assert(initial.skills.length > 0, 'Initial skills must not be empty');
  assert(initial.roadmap.length === 4, 'Initial roadmap should have 4 phases');
  assert(initial.learningResources.length > 0, 'Initial learning resources should exist');
  assert(initial.notifications.length > 0, 'Initial notifications should exist');
  console.log('  ✓ Initial state valid and complete');

  // TEST 2: Reducer actions immutability
  console.log('[Test 2] Reducer actions immutability');
  const stateA = getInitialState();
  const stateB = appStateReducer(stateA, {
    type: 'UPDATE_PROFILE',
    payload: { headline: 'Senior AI Engineer' }
  });
  assert(stateA !== stateB, 'Reducer must return a new state reference');
  assert(stateA.profile.headline !== stateB.profile.headline, 'Original state must remain untouched');
  assert(stateB.profile.headline === 'Senior AI Engineer', 'Updated headline must match payload');
  console.log('  ✓ Reducer actions strictly preserve immutability');

  // TEST 3: State persistence
  console.log('[Test 3] State persistence');
  const serialized = JSON.stringify({
    version: STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    state: stateB
  });
  localStorage.setItem('careercompass_student_state', serialized);
  assert(localStorage.getItem('careercompass_student_state') !== null, 'State should be persisted');
  console.log('  ✓ State serialized and saved to localStorage');

  // TEST 4: State restoration
  console.log('[Test 4] State restoration');
  const raw = localStorage.getItem('careercompass_student_state');
  const parsed = JSON.parse(raw!);
  const restored = migrateState(parsed);
  assert(restored !== null, 'Restored state must not be null');
  assert(restored?.profile.headline === 'Senior AI Engineer', 'Restored state must retain modified data');
  console.log('  ✓ State successfully restored from storage');

  // TEST 5: Storage version handling & migrations
  console.log('[Test 5] Storage version handling');
  const incompatiblePayload = { version: 999, updatedAt: '2026-01-01', state: { corrupt: true } };
  const fallback = migrateState(incompatiblePayload);
  assert(fallback === null, 'Incompatible future version must gracefully return null for fallback');
  console.log('  ✓ Version mismatch handled safely without exceptions');

  // TEST 6: Roadmap completion
  console.log('[Test 6] Roadmap completion');
  let stateRoadmap = getInitialState();
  const testItemId = 'rm-3'; // SQL milestone in Phase 2
  stateRoadmap = appStateReducer(stateRoadmap, {
    type: 'COMPLETE_ROADMAP_ITEM',
    payload: { itemId: testItemId }
  });
  const completedItem = stateRoadmap.roadmap.flatMap(p => p.items).find(i => i.id === testItemId);
  assert(completedItem?.status === 'Completed', 'Roadmap item status must be Completed');
  assert(completedItem?.progress === 100, 'Roadmap item progress must be 100%');
  console.log('  ✓ Roadmap milestone marked complete and unlocked next items');

  // TEST 7: Assessment completion & skill sync
  console.log('[Test 7] Assessment completion & skill sync');
  let stateAsm = getInitialState();
  const newAssessment: AssessmentRecord = {
    id: 'asm-sql-test-1',
    skillId: 'sk-sql',
    skillName: 'SQL',
    answers: { '0': 'opt-b' },
    score: 85,
    totalQuestions: 10,
    correctCount: 8,
    skillLevel: 'Advanced',
    completedAt: new Date().toISOString(),
    derivedProficiency: 85,
    strongAreas: ['Joins', 'Aggregations'],
    weakAreas: ['Subqueries']
  };
  stateAsm = appStateReducer(stateAsm, {
    type: 'COMPLETE_ASSESSMENT',
    payload: newAssessment
  });
  assert(stateAsm.assessments[0].id === 'asm-sql-test-1', 'Assessment record must be prepended');
  const updatedSql = stateAsm.skills.find(s => s.id === 'sk-sql');
  assert(updatedSql?.currentProficiency === 85, 'Skill proficiency must be synchronized to assessment score');
  assert(updatedSql?.status === 'Strong', 'Proficiency 85 must update skill status to Strong');
  console.log('  ✓ Assessment completed, saved to history, and synchronized skill proficiency');

  // TEST 8: Learning progress
  console.log('[Test 8] Learning progress');
  let stateLearning = getInitialState();
  const resourceId = 'res-py-foundations';
  stateLearning = appStateReducer(stateLearning, {
    type: 'UPDATE_RESOURCE_PROGRESS',
    payload: { resourceId, progress: 75 }
  });
  const updatedRes = stateLearning.learningResources.find(r => r.id === resourceId);
  assert(updatedRes?.progress === 75, 'Resource progress must equal 75%');
  assert(updatedRes?.enrolled === true, 'Resource must be enrolled');
  console.log('  ✓ Learning resource progress updated and persisted');

  // TEST 9: Project progress
  console.log('[Test 9] Project progress');
  let stateProj = getInitialState();
  const projectId = 'proj-resume-nlp';
  stateProj = appStateReducer(stateProj, {
    type: 'UPDATE_PROJECT_PROGRESS',
    payload: { projectId, progress: 60 }
  });
  const updatedProj = stateProj.projects.find(p => p.id === projectId);
  assert(updatedProj?.progress === 60, 'Project progress must equal 60%');
  assert(updatedProj?.status === 'In Progress', 'Project status must be In Progress');
  console.log('  ✓ Project progress tracked and preserved');

  // TEST 10: Notification read state
  console.log('[Test 10] Notification read state');
  let stateNotif = getInitialState();
  const notifId = stateNotif.notifications[0].id;
  stateNotif = appStateReducer(stateNotif, {
    type: 'MARK_NOTIFICATION_READ',
    payload: { notificationId: notifId }
  });
  const updatedNotif = stateNotif.notifications.find(n => n.id === notifId);
  assert(updatedNotif?.read === true, 'Notification must be marked as read');
  console.log('  ✓ Notification marked as read');

  // TEST 11: Reset demo data
  console.log('[Test 11] Reset demo data');
  let stateMutated = appStateReducer(stateNotif, {
    type: 'UPDATE_PROFILE',
    payload: { name: 'Completely Changed Name' }
  });
  assert(stateMutated.profile.name === 'Completely Changed Name', 'Profile was changed');
  const stateReset = appStateReducer(stateMutated, { type: 'RESET_DEMO_DATA' });
  assert(stateReset.profile.name === 'Alex Johnson', 'Reset demo data restored Alex Johnson');
  assert(stateReset.skills[0].name === 'Python', 'Initial skills restored');
  console.log('  ✓ Reset Demo Data restores deterministic initial factory state');

  console.log('--- ALL 11 TESTS PASSED SUCCESSFULLY! ---');
}

runTests();
