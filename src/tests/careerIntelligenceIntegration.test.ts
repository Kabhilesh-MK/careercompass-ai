/**
 * CareerCompass Phase 5 Career Intelligence Frontend Integration Test Suite
 *
 * Validates:
 * [Test 1] API Client URL & payload construction
 * [Test 2] Successful response parsing against CareerIntelligenceResponse
 * [Test 3] Predicted target flow parsing
 * [Test 4] User-selected target override flow parsing
 * [Test 5] Required skill coverage calculation & schema
 * [Test 6] Prioritized gaps ordering & prerequisite metadata
 * [Test 7] 5-Stage Roadmap items structure & statuses
 * [Test 8] Curated learning recommendations parsing
 * [Test 9] HTTP 503 service unavailable error handling (no fake fallback)
 * [Test 10] Network failure error handling
 * [Test 11] Empty skill validation before dispatch
 * [Test 12] Unknown skills handling & reporting
 * [Test 13] AppState reducer SET_CAREER_INTELLIGENCE immutability & persistence
 * [Test 14] AppState reducer SET_CAREER_TARGET_OVERRIDE
 * [Test 15] AppState reducer UPDATE_INTELLIGENCE_ROADMAP_STATUS & completion tracking
 */

import {
  evaluateCareerIntelligence,
  CareerIntelligenceError,
  CareerIntelligenceResponse,
} from '../services/api/careerIntelligence';
import { appStateReducer } from '../context/AppStateReducer';
import { getInitialState } from '../services/persistence/storage';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[TEST FAILED] ${message}`);
  }
}

// Mock global fetch
let originalFetch: typeof globalThis.fetch;
let lastFetchUrl = '';
let lastFetchOptions: any = null;

function mockFetchResponse(status: number, data: any, ok = true) {
  (globalThis as any).fetch = async (url: string, options: any) => {
    lastFetchUrl = url;
    lastFetchOptions = options;
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
    };
  };
}

function mockFetchNetworkError() {
  (globalThis as any).fetch = async (url: string, options: any) => {
    lastFetchUrl = url;
    lastFetchOptions = options;
    throw new TypeError('Failed to fetch');
  };
}

const SAMPLE_INTELLIGENCE_RESPONSE: CareerIntelligenceResponse = {
  target_career_track: 'AI & Machine Learning Engineering',
  target_source: 'model_prediction',
  prediction: {
    career_track: 'AI & Machine Learning Engineering',
    probability: 0.88,
    alternatives: [
      { career_track: 'Software Development & Engineering', probability: 0.08 },
      { career_track: 'Data Analytics & Business Intelligence', probability: 0.03 },
      { career_track: 'Cloud, DevOps & Systems Engineering', probability: 0.01 },
    ],
    probabilities: [
      { career_track: 'AI & Machine Learning Engineering', probability: 0.88 },
      { career_track: 'Software Development & Engineering', probability: 0.08 },
      { career_track: 'Data Analytics & Business Intelligence', probability: 0.03 },
      { career_track: 'Cloud, DevOps & Systems Engineering', probability: 0.01 },
    ],
  },
  recognized_skills: ['python', 'ai', 'programming'],
  unknown_skills: ['unknown_xyz'],
  required_skills: [
    'programming',
    'python',
    'data_analysis',
    'database_systems',
    'machine_learning',
    'ai',
    'critical_thinking',
    'cloud',
    'research',
    'experimentation',
    'simulation',
    'design_optimization',
  ],
  present_required_skills: ['programming', 'python', 'ai'],
  missing_required_skills: [
    'data_analysis',
    'database_systems',
    'machine_learning',
    'critical_thinking',
    'cloud',
    'research',
    'experimentation',
    'simulation',
    'design_optimization',
  ],
  required_skill_coverage: {
    decimal: 0.25,
    percentage: 25.0,
    present_count: 3,
    required_count: 12,
  },
  prioritized_gaps: [
    {
      skill: 'data_analysis',
      priority: 'core',
      category: 'core',
      reason: 'Feature engineering and dataset preprocessing foundation.',
      prerequisites: ['python'],
      prerequisites_met: true,
      recommended_order: 1,
    },
    {
      skill: 'machine_learning',
      priority: 'core',
      category: 'core',
      reason: 'Core predictive algorithms for supervised and unsupervised tasks.',
      prerequisites: ['python', 'data_analysis'],
      prerequisites_met: false,
      recommended_order: 2,
    },
  ],
  roadmap: [
    {
      id: 'rm-ai-s1-programming',
      stage: 1,
      stage_title: 'Stage 1 — Foundations',
      title: 'Algorithmic Programming Foundations',
      skill: 'programming',
      status: 'completed',
      prerequisites: [],
      prerequisites_met: true,
      priority: 'core',
      description: 'Foundational algorithmic logic and structured programming.',
    },
    {
      id: 'rm-ai-s2-data_analysis',
      stage: 2,
      stage_title: 'Stage 2 — Core Competencies',
      title: 'Exploratory Data Analysis & Feature Extraction',
      skill: 'data_analysis',
      status: 'not_started',
      prerequisites: ['python'],
      prerequisites_met: true,
      priority: 'core',
      description: 'Data wrangling and exploratory feature extraction.',
    },
  ],
  learning_recommendations: [
    {
      resource_id: 'res-eda-pandas',
      title: 'Exploratory Data Analysis with Pandas & NumPy',
      provider: 'DataCamp',
      skill: 'data_analysis',
      resource_type: 'Course',
      difficulty: 'Intermediate',
      estimated_effort: '16 hours',
      roadmap_stage: 2,
      url: null,
      prerequisites: ['python'],
      prerequisites_met: true,
    },
  ],
  model: {
    version: 'phase3.4',
    model_type: 'RandomForestClassifier',
    feature_configuration: 'skills-only',
  },
};

async function runTests() {
  console.log('--- STARTING PHASE 5 FRONTEND ↔ FASTAPI CAREER INTELLIGENCE TEST SUITE ---\n');
  originalFetch = (globalThis as any).fetch;

  try {
    // TEST 1: API Client constructs correct POST request
    console.log('[Test 1] API client URL & payload construction');
    mockFetchResponse(200, SAMPLE_INTELLIGENCE_RESPONSE);
    await evaluateCareerIntelligence({
      skills: ['python', 'ai', 'programming'],
      target_career_track: null,
    });
    assert(lastFetchUrl.endsWith('/api/v1/career/intelligence'), 'Must call /api/v1/career/intelligence');
    const parsedBody = JSON.parse(lastFetchOptions.body);
    assert(Array.isArray(parsedBody.skills), 'Payload must contain skills array');
    assert(parsedBody.skills.length === 3, 'Payload must pass all 3 skills');
    assert(parsedBody.target_career_track === null, 'Target track must be null when omitted');
    console.log('  ✓ Correct POST URL and JSON payload constructed');

    // TEST 2: Valid response parsing against CareerIntelligenceResponse
    console.log('[Test 2] Response parsing against CareerIntelligenceResponse');
    mockFetchResponse(200, SAMPLE_INTELLIGENCE_RESPONSE);
    const result = await evaluateCareerIntelligence({ skills: ['python'] });
    assert(result.target_career_track === 'AI & Machine Learning Engineering', 'Must parse target career track');
    assert(result.required_skills.length === 12, 'Must parse required skills');
    assert(result.prioritized_gaps.length === 2, 'Must parse prioritized gaps');
    assert(result.roadmap.length === 2, 'Must parse roadmap items');
    console.log('  ✓ Response parsed successfully into strongly-typed structure');

    // TEST 3: Predicted target flow parsing
    console.log('[Test 3] Predicted target flow parsing');
    assert(result.target_source === 'model_prediction', 'Must reflect model_prediction source');
    assert(result.prediction?.career_track === 'AI & Machine Learning Engineering', 'Must contain prediction object');
    assert(result.prediction?.probability === 0.88, 'Must contain prediction probability');
    console.log('  ✓ Model-predicted flow verified with distinct prediction object');

    // TEST 4: User-selected target override flow parsing
    console.log('[Test 4] User-selected target override flow parsing');
    const userSelectedResponse = {
      ...SAMPLE_INTELLIGENCE_RESPONSE,
      target_career_track: 'Software Development & Engineering',
      target_source: 'user_selected',
    };
    mockFetchResponse(200, userSelectedResponse);
    const overrideResult = await evaluateCareerIntelligence({
      skills: ['python'],
      target_career_track: 'Software Development & Engineering',
    });
    assert(overrideResult.target_source === 'user_selected', 'Must reflect user_selected source');
    assert(overrideResult.target_career_track === 'Software Development & Engineering', 'Must adopt override target');
    assert(overrideResult.prediction?.career_track === 'AI & Machine Learning Engineering', 'ML prediction remains visible separately');
    console.log('  ✓ User-selected target override preserves separate ML prediction');

    // TEST 5: Required skill coverage calculation & schema
    console.log('[Test 5] Required skill coverage calculation & schema');
    assert(result.required_skill_coverage.decimal === 0.25, 'Decimal coverage must be 0.25');
    assert(result.required_skill_coverage.percentage === 25.0, 'Percentage coverage must be 25.0');
    assert(result.required_skill_coverage.present_count === 3, 'Present count must be 3');
    assert(result.required_skill_coverage.required_count === 12, 'Required count must be 12');
    console.log('  ✓ Required skill coverage transparently validated');

    // TEST 6: Prioritized gaps ordering & prerequisite metadata
    console.log('[Test 6] Prioritized gaps ordering & prerequisite metadata');
    const firstGap = result.prioritized_gaps[0];
    assert(firstGap.skill === 'data_analysis', 'First gap must be data_analysis');
    assert(firstGap.prerequisites_met === true, 'Prerequisites for data_analysis must be met');
    assert(firstGap.recommended_order === 1, 'Recommended order must be 1');
    const secondGap = result.prioritized_gaps[1];
    assert(secondGap.prerequisites_met === false, 'Prerequisites for machine_learning not yet met');
    console.log('  ✓ Gap prioritization and prerequisite status validated');

    // TEST 7: 5-Stage Roadmap items structure & statuses
    console.log('[Test 7] 5-Stage Roadmap items structure & statuses');
    const stage1Item = result.roadmap.find((i) => i.stage === 1);
    assert(stage1Item !== undefined, 'Stage 1 milestone must exist');
    assert(stage1Item?.status === 'completed', 'Present skill milestone marked completed');
    const stage2Item = result.roadmap.find((i) => i.stage === 2);
    assert(stage2Item?.status === 'not_started', 'Missing skill milestone marked not_started');
    console.log('  ✓ Staged roadmap items accurately parsed');

    // TEST 8: Curated learning recommendations parsing
    console.log('[Test 8] Curated learning recommendations parsing');
    assert(result.learning_recommendations.length > 0, 'Must contain recommendations');
    const rec = result.learning_recommendations[0];
    assert(rec.resource_id === 'res-eda-pandas', 'Resource ID matched');
    assert(rec.provider === 'DataCamp', 'Provider matched');
    assert(rec.difficulty === 'Intermediate', 'Difficulty matched');
    console.log('  ✓ Curated learning recommendations accurately parsed');

    // TEST 9: HTTP 503 service unavailable error handling
    console.log('[Test 9] HTTP 503 service unavailable error handling');
    mockFetchResponse(503, { detail: 'Model service not ready.' }, false);
    let caught503 = false;
    try {
      await evaluateCareerIntelligence({ skills: ['python'] });
    } catch (err: any) {
      caught503 = true;
      assert(err instanceof CareerIntelligenceError, 'Must throw CareerIntelligenceError');
      assert(err.status === 503, 'Status must be 503');
    }
    assert(caught503, 'Must throw on HTTP 503');
    console.log('  ✓ HTTP 503 surfaced cleanly without mock fallback');

    // TEST 10: Network failure error handling
    console.log('[Test 10] Network failure error handling');
    mockFetchNetworkError();
    let caughtNetwork = false;
    try {
      await evaluateCareerIntelligence({ skills: ['python'] });
    } catch (err: any) {
      caughtNetwork = true;
      assert(err instanceof CareerIntelligenceError, 'Must throw CareerIntelligenceError');
      assert(err.isNetworkError === true, 'isNetworkError must be true');
    }
    assert(caughtNetwork, 'Must throw on network error');
    console.log('  ✓ Network disconnection handled with explicit error');

    // TEST 11: Empty skill validation before network request
    console.log('[Test 11] Empty skill validation before network request');
    let caughtEmpty = false;
    try {
      await evaluateCareerIntelligence({ skills: [] });
    } catch (err: any) {
      caughtEmpty = true;
      assert(err.status === 422, 'Must validate before network request');
    }
    assert(caughtEmpty, 'Empty skills must reject immediately');
    console.log('  ✓ Empty skill submission rejected before network request');

    // TEST 12: Unknown skills handling & reporting
    console.log('[Test 12] Unknown skills handling');
    assert(result.unknown_skills.includes('unknown_xyz'), 'Unknown skills reported in response');
    assert(result.recognized_skills.length === 3, 'Recognized skills preserved');
    console.log('  ✓ Unknown skills cleanly reported in payload');

    // TEST 13: AppState reducer SET_CAREER_INTELLIGENCE immutability & persistence
    console.log('[Test 13] AppState reducer SET_CAREER_INTELLIGENCE');
    const initialState = getInitialState();
    const updatedState = appStateReducer(initialState, {
      type: 'SET_CAREER_INTELLIGENCE',
      payload: {
        intelligence: SAMPLE_INTELLIGENCE_RESPONSE,
        selectedSkills: ['python', 'ai', 'programming'],
      },
    });
    assert(initialState !== updatedState, 'Reducer must return new state reference');
    assert(
      updatedState.careerIntelligence?.activeTargetCareer === 'AI & Machine Learning Engineering',
      'Target career saved in state'
    );
    assert(
      Boolean(updatedState.careerIntelligence?.completedRoadmapItemIds.includes('rm-ai-s1-programming')),
      'Completed item id registered'
    );
    console.log('  ✓ Career Intelligence saved immutably to centralized state');

    // TEST 14: AppState reducer SET_CAREER_TARGET_OVERRIDE
    console.log('[Test 14] AppState reducer SET_CAREER_TARGET_OVERRIDE');
    const overrideState = appStateReducer(updatedState, {
      type: 'SET_CAREER_TARGET_OVERRIDE',
      payload: { targetCareer: 'Software Development & Engineering' },
    });
    assert(
      overrideState.careerIntelligence?.activeTargetCareer === 'Software Development & Engineering',
      'Target career override updated'
    );
    assert(
      overrideState.careerIntelligence?.targetSource === 'user_selected',
      'Target source changed to user_selected'
    );
    console.log('  ✓ Target career override updated in state');

    // TEST 15: AppState reducer UPDATE_INTELLIGENCE_ROADMAP_STATUS
    console.log('[Test 15] AppState reducer UPDATE_INTELLIGENCE_ROADMAP_STATUS');
    const milestoneState = appStateReducer(updatedState, {
      type: 'UPDATE_INTELLIGENCE_ROADMAP_STATUS',
      payload: { itemId: 'rm-ai-s2-data_analysis', status: 'completed' },
    });
    assert(
      milestoneState.careerIntelligence?.roadmapProgress['rm-ai-s2-data_analysis'] === 'completed',
      'Roadmap item status updated to completed'
    );
    assert(
      Boolean(milestoneState.careerIntelligence?.completedRoadmapItemIds.includes('rm-ai-s2-data_analysis')),
      'Completed item id added to completed list'
    );

    // Test undoing status
    const undoState = appStateReducer(milestoneState, {
      type: 'UPDATE_INTELLIGENCE_ROADMAP_STATUS',
      payload: { itemId: 'rm-ai-s2-data_analysis', status: 'not_started' },
    });
    assert(
      !undoState.careerIntelligence?.completedRoadmapItemIds.includes('rm-ai-s2-data_analysis'),
      'Completed item id removed on undo'
    );
    console.log('  ✓ Milestone status toggling and completion tracking validated');

    console.log('\n--- ALL 15 PHASE 5 CAREER INTELLIGENCE TESTS PASSED SUCCESSFULLY! ---');
  } finally {
    (globalThis as any).fetch = originalFetch;
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
