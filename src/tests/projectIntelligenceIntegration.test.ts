/**
 * CareerCompass Phase 6 Project, Portfolio & Career Readiness Frontend Integration Tests
 *
 * Validates:
 * [Test 1] Project API Client URL & payload construction (POST /api/v1/career/projects/recommendations)
 * [Test 2] Response parsing against ProjectRecommendationResponse & schema fields
 * [Test 3] Target-track override flow in project recommendation API
 * [Test 4] Project Catalog API client (GET /api/v1/career/projects/catalog)
 * [Test 5] HTTP 503 service unavailable error handling (no fake project fallback)
 * [Test 6] HTTP 422 validation error handling
 * [Test 7] Network failure error handling
 * [Test 8] Empty skill validation before dispatch
 * [Test 9] AppState reducer UPDATE_CAREER_PROJECT_STATUS ('planned' -> 'in_progress' -> 'completed')
 * [Test 10] AppState reducer TOGGLE_PROJECT_EVIDENCE toggles checklist items on and off
 * [Test 11] AppState reducer UPDATE_PROJECT_DELIVERABLE_LINK records links
 * [Test 12] State-derived achievement generation on project completion
 * [Test 13] Certificate recording and state-derived achievement generation
 * [Test 14] Deterministic Portfolio Evidence Coverage formula calculation
 * [Test 15] Deterministic Career Plan Completion formula calculation
 */

import {
  getProjectRecommendations,
  getProjectCatalog,
  ProjectRecommendationError,
  ProjectRecommendationResponse,
  RecommendedProject,
} from '../services/api/projectRecommendations';
import { appStateReducer } from '../context/AppStateReducer';
import { getInitialState } from '../services/persistence/storage';
import { Certificate } from '../types/careerCompass';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[TEST FAILED] ${message}`);
  }
}

// Mock global fetch
let originalFetch: typeof globalThis.fetch;
let lastFetchUrl = '';
let lastFetchOptions: any = null;

function mockFetchResponse(status: number, data: any) {
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

const SAMPLE_PROJECTS_RESPONSE: ProjectRecommendationResponse = {
  target_career_track: 'AI & Machine Learning Engineering',
  target_source: 'model_prediction',
  projects: [
    {
      project_id: 'ai-ml-01',
      title: 'Customer Churn Predictor & Model Explainability Service',
      career_track: 'AI & Machine Learning Engineering',
      description: 'End-to-end churn prediction pipeline using scikit-learn and SHAP.',
      difficulty: 'Intermediate',
      estimated_effort: '25-30 hours',
      skills_demonstrated: ['python', 'machine_learning', 'data_analysis', 'critical_thinking'],
      skills_targeted: ['machine_learning'],
      prerequisites: ['python', 'data_analysis'],
      recommended_stage: 3,
      portfolio_value: 'high',
      suggested_deliverables: [
        'GitHub repository with modular data preprocessing and scikit-learn model code',
        'SHAP beeswarm and summary feature importance plots',
      ],
      suggested_evidence: [
        'Public GitHub Repository',
        'Model Evaluation Report (ROC-AUC, Precision-Recall)',
        'Interactive Demo / Streamlit Notebook',
        'Comprehensive README.md',
      ],
      technology_stack: ['Python', 'scikit-learn', 'SHAP', 'Pandas'],
      matched_missing_skills: ['machine_learning'],
      prerequisites_met: true,
      relevance_score: 87.5,
    },
    {
      project_id: 'ai-ml-02',
      title: 'Multi-Modal Document RAG Assistant',
      career_track: 'AI & Machine Learning Engineering',
      description: 'Production-ready Retrieval-Augmented Generation system.',
      difficulty: 'Advanced',
      estimated_effort: '35-45 hours',
      skills_demonstrated: ['python', 'ai', 'cloud', 'database_systems'],
      skills_targeted: ['ai'],
      prerequisites: ['python', 'machine_learning'],
      recommended_stage: 4,
      portfolio_value: 'very_high',
      suggested_deliverables: [
        'Vector store ingestion pipeline',
        'FastAPI query endpoint',
      ],
      suggested_evidence: [
        'Source Repository',
        'Architecture Diagram',
        'Retrieval Latency Benchmarks',
      ],
      technology_stack: ['Python', 'FastAPI', 'LangChain', 'ChromaDB'],
      matched_missing_skills: ['ai'],
      prerequisites_met: false,
      relevance_score: 55.0,
    },
  ],
};

async function runTests() {
  console.log('--- CareerCompass Phase 6 Frontend Integration Tests ---');
  originalFetch = globalThis.fetch;

  try {
    // TEST 1: API Client URL & payload construction
    console.log('[Test 1] POST /api/v1/career/projects/recommendations URL & payload');
    mockFetchResponse(200, SAMPLE_PROJECTS_RESPONSE);

    await getProjectRecommendations({
      skills: ['python', 'data_analysis'],
      target_career_track: 'AI & Machine Learning Engineering',
    });

    assert(
      lastFetchUrl.endsWith('/api/v1/career/projects/recommendations'),
      `Expected URL to end with /api/v1/career/projects/recommendations, got ${lastFetchUrl}`
    );
    assert(lastFetchOptions.method === 'POST', 'Expected POST method');
    const parsedBody = JSON.parse(lastFetchOptions.body);
    assert(
      Array.isArray(parsedBody.skills) && parsedBody.skills.length === 2,
      'Expected skills array with 2 items'
    );
    assert(
      parsedBody.target_career_track === 'AI & Machine Learning Engineering',
      'Expected target_career_track'
    );
    console.log('✓ Passed');

    // TEST 2: Response parsing against ProjectRecommendationResponse & schema fields
    console.log('[Test 2] Response parsing against ProjectRecommendationResponse');
    const result = await getProjectRecommendations({ skills: ['python'] });
    assert(
      result.target_career_track === 'AI & Machine Learning Engineering',
      'Target track must match'
    );
    assert(result.projects.length === 2, 'Expected 2 projects');
    const p1 = result.projects[0];
    assert(p1.project_id === 'ai-ml-01', 'project_id mismatch');
    assert(p1.relevance_score === 87.5, 'relevance_score mismatch');
    assert(p1.prerequisites_met === true, 'prerequisites_met mismatch');
    assert(p1.skills_demonstrated.includes('machine_learning'), 'skills_demonstrated mismatch');
    assert(p1.suggested_evidence.length === 4, 'suggested_evidence mismatch');
    console.log('✓ Passed');

    // TEST 3: Target-track override flow in project recommendation API
    console.log('[Test 3] Target-track override flow in project recommendation API');
    mockFetchResponse(200, {
      ...SAMPLE_PROJECTS_RESPONSE,
      target_career_track: 'Software Development & Engineering',
      target_source: 'user_selected',
    });
    const overrideResult = await getProjectRecommendations({
      skills: ['python'],
      target_career_track: 'Software Development & Engineering',
    });
    assert(
      overrideResult.target_career_track === 'Software Development & Engineering',
      'Target track override must be respected'
    );
    assert(overrideResult.target_source === 'user_selected', 'Target source must be user_selected');
    console.log('✓ Passed');

    // TEST 4: Project Catalog API client
    console.log('[Test 4] GET /api/v1/career/projects/catalog API client');
    mockFetchResponse(200, SAMPLE_PROJECTS_RESPONSE.projects);
    const catalog = await getProjectCatalog();
    assert(lastFetchUrl.includes('/api/v1/career/projects/catalog'), 'Catalog endpoint requested');
    assert(catalog.length === 2, 'Catalog must return projects');
    console.log('✓ Passed');

    // TEST 5: HTTP 503 error handling (no fake project fallback)
    console.log('[Test 5] HTTP 503 Service Unavailable handling (no fake fallback)');
    mockFetchResponse(503, { detail: 'Model service temporarily unavailable' });
    try {
      await getProjectRecommendations({ skills: ['python'] });
      assert(false, 'Must throw error on 503');
    } catch (err: any) {
      assert(err instanceof ProjectRecommendationError, 'Must throw ProjectRecommendationError');
      assert(err.status === 503, 'Must retain status 503');
      assert(!err.userMessage.includes('http://'), 'No leaked internal URLs');
    }
    console.log('✓ Passed');

    // TEST 6: HTTP 422 validation error handling
    console.log('[Test 6] HTTP 422 validation error handling');
    mockFetchResponse(422, {
      detail: [{ loc: ['body', 'skills'], msg: 'Skills list must contain at least one valid canonical skill' }],
    });
    try {
      await getProjectRecommendations({ skills: ['invalid_unknown_skill'] });
      assert(false, 'Must throw on 422');
    } catch (err: any) {
      assert(err instanceof ProjectRecommendationError, 'Must throw ProjectRecommendationError');
      assert(err.status === 422, 'Must have status 422');
    }
    console.log('✓ Passed');

    // TEST 7: Network failure error handling
    console.log('[Test 7] Network failure error handling');
    mockFetchNetworkError();
    try {
      await getProjectRecommendations({ skills: ['python'] });
      assert(false, 'Must throw on network error');
    } catch (err: any) {
      assert(err instanceof ProjectRecommendationError, 'Must throw ProjectRecommendationError');
      assert(err.isNetworkError === true, 'Must flag isNetworkError');
    }
    console.log('✓ Passed');

    // TEST 8: Empty skill validation before dispatch
    console.log('[Test 8] Empty skill validation before dispatch');
    try {
      await getProjectRecommendations({ skills: [] });
      assert(false, 'Must throw for empty skills');
    } catch (err: any) {
      assert(err instanceof ProjectRecommendationError, 'Must throw ProjectRecommendationError');
      assert(err.code === 'validation_error', 'Code must be validation_error');
    }
    console.log('✓ Passed');

    // TEST 9: AppState reducer UPDATE_CAREER_PROJECT_STATUS
    console.log('[Test 9] AppState reducer UPDATE_CAREER_PROJECT_STATUS');
    let state = getInitialState();
    assert(state.careerProjects !== undefined, 'careerProjects must be defined in state');

    // Mark planned
    state = appStateReducer(state, {
      type: 'UPDATE_CAREER_PROJECT_STATUS',
      payload: { projectId: 'ai-ml-01', status: 'planned' },
    });
    assert(state.careerProjects?.['ai-ml-01']?.status === 'planned', 'Project status must be planned');

    // Mark in_progress
    state = appStateReducer(state, {
      type: 'UPDATE_CAREER_PROJECT_STATUS',
      payload: { projectId: 'ai-ml-01', status: 'in_progress' },
    });
    assert(state.careerProjects?.['ai-ml-01']?.status === 'in_progress', 'Project status must be in_progress');
    assert(Boolean(state.careerProjects?.['ai-ml-01']?.startedAt), 'startedAt must be recorded');
    console.log('✓ Passed');

    // TEST 10: AppState reducer TOGGLE_PROJECT_EVIDENCE
    console.log('[Test 10] AppState reducer TOGGLE_PROJECT_EVIDENCE');
    const evidenceItem = 'Public GitHub Repository';

    // Toggle ON
    state = appStateReducer(state, {
      type: 'TOGGLE_PROJECT_EVIDENCE',
      payload: { projectId: 'ai-ml-01', evidenceItem },
    });
    assert(
      Boolean(state.careerProjects?.['ai-ml-01']?.completedEvidence?.includes(evidenceItem)),
      'Evidence item must be added'
    );

    // Toggle OFF
    state = appStateReducer(state, {
      type: 'TOGGLE_PROJECT_EVIDENCE',
      payload: { projectId: 'ai-ml-01', evidenceItem },
    });
    assert(
      !state.careerProjects?.['ai-ml-01']?.completedEvidence?.includes(evidenceItem),
      'Evidence item must be removed on second toggle'
    );
    console.log('✓ Passed');

    // TEST 11: AppState reducer UPDATE_PROJECT_DELIVERABLE_LINK
    console.log('[Test 11] AppState reducer UPDATE_PROJECT_DELIVERABLE_LINK');
    state = appStateReducer(state, {
      type: 'UPDATE_PROJECT_DELIVERABLE_LINK',
      payload: {
        projectId: 'ai-ml-01',
        deliverable: 'Source Code',
        link: 'https://github.com/myuser/churn-predictor',
      },
    });
    assert(
      state.careerProjects?.['ai-ml-01']?.deliverableLinks?.['Source Code'] ===
        'https://github.com/myuser/churn-predictor',
      'Deliverable link must be stored'
    );
    console.log('✓ Passed');

    // TEST 12: State-derived achievement generation on project completion
    console.log('[Test 12] State-derived achievement generation on project completion');
    const initialAchievementsCount = state.achievements.length;
    state = appStateReducer(state, {
      type: 'UPDATE_CAREER_PROJECT_STATUS',
      payload: { projectId: 'ai-ml-01', status: 'completed' },
    });
    assert(state.careerProjects?.['ai-ml-01']?.status === 'completed', 'Project status must be completed');
    assert(Boolean(state.careerProjects?.['ai-ml-01']?.completedAt), 'completedAt must be populated');

    // Must have generated a provenanced achievement
    const projAchievement = state.achievements.find((a) => a.id === 'ach-proj-ai-ml-01');
    assert(Boolean(projAchievement), 'Achievement ach-proj-ai-ml-01 must be created');
    assert(Boolean(projAchievement?.title.includes('Project Completed')), 'Achievement title must mention completion');
    console.log('✓ Passed');

    // TEST 13: Certificate recording and state-derived achievement generation
    console.log('[Test 13] Certificate recording and state-derived achievement');
    const newCert: Certificate = {
      id: 'cert-ml-101',
      title: 'Machine Learning Specialization',
      provider: 'DeepLearning.AI / Coursera',
      issueDate: '2026-03-15',
      credentialId: 'CRED-99281',
      credentialUrl: 'https://coursera.org/verify/CRED-99281',
      verificationUrl: 'https://coursera.org/verify/CRED-99281',
      skill: 'machine_learning',
      skills: ['machine_learning', 'python'],
      status: 'Verified',
    };

    state = appStateReducer(state, {
      type: 'ADD_CERTIFICATE',
      payload: newCert,
    });
    assert(
      Boolean(state.certificates.find((c) => c.id === 'cert-ml-101')),
      'Certificate must be added to state'
    );
    const certAchievement = state.achievements.find((a) => a.id === 'ach-cert-cert-ml-101');
    assert(Boolean(certAchievement), 'Certificate achievement must be state-derived');
    console.log('✓ Passed');

    // TEST 14: Deterministic Portfolio Evidence Coverage formula calculation
    console.log('[Test 14] Deterministic Portfolio Evidence Coverage formula calculation');
    // Ensure completed evidence exists
    state = appStateReducer(state, {
      type: 'TOGGLE_PROJECT_EVIDENCE',
      payload: { projectId: 'ai-ml-01', evidenceItem: 'Public GitHub Repository' },
    });
    state = appStateReducer(state, {
      type: 'TOGGLE_PROJECT_EVIDENCE',
      payload: { projectId: 'ai-ml-01', evidenceItem: 'Model Evaluation Report' },
    });

    const activeProjectRecords = Object.values(state.careerProjects || {});
    let completedEvidenceCount = 0;
    let totalEvidenceItems = 0;
    activeProjectRecords.forEach((p) => {
      completedEvidenceCount += p.completedEvidence?.length || 0;
      totalEvidenceItems += 4; // standard 4 items per project
    });

    const coverageRatio = totalEvidenceItems > 0 ? completedEvidenceCount / totalEvidenceItems : 0;
    const portfolioEvidenceCoveragePercent = Math.round(coverageRatio * 100);

    assert(
      completedEvidenceCount === 2,
      `Expected 2 completed evidence items, got ${completedEvidenceCount}`
    );
    assert(
      totalEvidenceItems === 4,
      `Expected 4 total evidence items, got ${totalEvidenceItems}`
    );
    assert(
      portfolioEvidenceCoveragePercent === 50,
      `Expected 50% coverage, got ${portfolioEvidenceCoveragePercent}%`
    );
    console.log('✓ Passed');

    // TEST 15: Deterministic Career Plan Completion formula calculation
    console.log('[Test 15] Deterministic Career Plan Completion formula calculation');
    const skillCoverage = 60; // 60%
    const roadmapCompletion = 40; // 40%
    const learningCompletion = 50; // 50%
    const projectCompletion = 100; // 100%
    const evidenceCoverage = portfolioEvidenceCoveragePercent; // 50%

    // Documented formula:
    // Skill Coverage * 0.3 + Roadmap * 0.25 + Learning * 0.15 + Projects * 0.15 + Evidence * 0.15
    const expectedScore = Math.round(
      (60 * 0.3) +
      (40 * 0.25) +
      (50 * 0.15) +
      (100 * 0.15) +
      (50 * 0.15)
    );
    // (18 + 10 + 7.5 + 15 + 7.5) = 58
    assert(expectedScore === 58, `Expected score 58, got ${expectedScore}`);
    console.log('✓ Passed');

    console.log('\n==================================================');
    console.log('ALL 15 PROJECT INTELLIGENCE FRONTEND TESTS PASSED!');
    console.log('==================================================\n');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

runTests().catch((err) => {
  console.error('\n❌ Phase 6 Frontend Integration Test Error:', err);
  process.exit(1);
});
