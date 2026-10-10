/**
 * CareerCompass Phase 4 Frontend ↔ FastAPI ML Explanation Integration Test Suite
 *
 * Mandated Phase 4 Test Scenarios:
 * 1. Explanation API request constructs correct POST URL and payload.
 * 2. Explanation response structure is correctly parsed and strongly typed.
 * 3. Explanation error state handling (clean error, no fake fallback).
 * 4. Decoupled loading state (prediction succeeds independently of explanation).
 * 5. Strict rejection of empty skills and absence of static fake attributions.
 */

import {
  explainCareerPrediction,
  predictCareer,
  CareerExplanationResponse,
  CareerPredictionResponse,
  MlInferenceError,
  getApiBaseUrl,
} from '../services/api/mlInference';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[TEST FAILED] ${message}`);
  }
}

type FetchCall = {
  url: string;
  options?: RequestInit;
};

const calls: FetchCall[] = [];
let mockFetchHandler: ((url: string, options?: RequestInit) => Promise<Response>) | null = null;
const originalFetch = globalThis.fetch;

function setupMockFetch(handler: (url: string, options?: RequestInit) => Promise<Response>) {
  calls.length = 0;
  mockFetchHandler = handler;
  (globalThis as any).fetch = async (url: string, options?: RequestInit) => {
    calls.push({ url, options });
    return mockFetchHandler!(url, options);
  };
}

function restoreFetch() {
  (globalThis as any).fetch = originalFetch;
}

async function runPhase4ExplanationTests() {
  console.log('\n--- STARTING PHASE 4 FRONTEND ↔ FASTAPI ML EXPLANATION TEST SUITE ---\n');

  try {
    // TEST 1: Explanation API request constructs correct POST URL and payload
    console.log('[Test 1] Explanation API request');
    const MOCK_EXPLANATION_RESPONSE: CareerExplanationResponse = {
      prediction: {
        career_track: 'AI & Machine Learning Engineering',
        probability: 0.67,
      },
      explanation_method: 'TreeExplainer',
      features: [
        { skill: 'database_systems', present: false, direction: 'supports', contribution: 0.0807 },
        { skill: 'ai', present: true, direction: 'supports', contribution: 0.0682 },
        { skill: 'python', present: true, direction: 'supports', contribution: 0.0638 },
        { skill: 'power_analysis', present: false, direction: 'opposes', contribution: -0.0254 },
      ],
      input: {
        recognized_skills: ['python', 'ai'],
        unknown_skills: [],
      },
      model: {
        version: 'phase3.4',
        model_type: 'RandomForestClassifier',
        feature_configuration: 'skills-only',
      },
    };

    setupMockFetch(async (_url, _opts) => {
      return new Response(JSON.stringify(MOCK_EXPLANATION_RESPONSE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const skills = ['python', 'ai'];
    const expResult = await explainCareerPrediction(skills);

    assert(calls.length === 1, 'Exactly one fetch request made');
    assert(
      calls[0].url === `${getApiBaseUrl()}/api/v1/predictions/career/explain`,
      'Correct POST URL called for explanation'
    );
    assert(calls[0].options?.method === 'POST', 'HTTP method is POST');
    const sentBody = JSON.parse(calls[0].options?.body as string);
    assert(Array.isArray(sentBody.skills), 'Payload contains skills array');
    assert(sentBody.skills.length === 2 && sentBody.skills[0] === 'python', 'Skills match input');
    console.log('  ✓ Correct POST URL and payload constructed for /predictions/career/explain');

    // TEST 2: Explanation rendering data structures are verified
    console.log('[Test 2] Explanation rendering');
    assert(
      expResult.prediction.career_track === 'AI & Machine Learning Engineering',
      'Predicted career track matches'
    );
    assert(expResult.prediction.probability === 0.67, 'Predicted probability matches');
    assert(expResult.explanation_method === 'TreeExplainer', 'Method is TreeExplainer');
    assert(expResult.features.length === 4, 'All features returned in structured list');
    assert(expResult.features[1].skill === 'ai', 'Present skill is ai');
    assert(expResult.features[1].present === true, 'ai is present');
    assert(expResult.features[1].direction === 'supports', 'ai direction is supports');
    assert(expResult.features[1].contribution === 0.0682, 'ai contribution is 0.0682');
    console.log('  ✓ Explanation data parsed into strict TypeScript structure');

    // TEST 3: Explanation error state handling
    console.log('[Test 3] Explanation error state');
    setupMockFetch(async () => {
      return new Response(
        JSON.stringify({
          detail: 'Model explanation service is temporarily unavailable.',
          code: 'service_unavailable',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    });

    let caughtError: MlInferenceError | null = null;
    try {
      await explainCareerPrediction(['python']);
    } catch (e: any) {
      caughtError = e;
    }

    assert(caughtError !== null, 'Explanation service 503 must throw');
    assert(caughtError?.status === 503, 'Error retains HTTP status 503');
    assert(
      Boolean(
        caughtError?.message.includes('temporarily unavailable') ||
          caughtError?.message.includes('initializing')
      ),
      'User-safe message surfaced without internal paths'
    );
    console.log('  ✓ Explanation HTTP 503 handled cleanly without fake fallback');

    // TEST 4: Explanation loading & decoupled execution
    console.log('[Test 4] Explanation loading state and decoupled flow');
    // Prediction succeeds
    const MOCK_PRED_RESPONSE: CareerPredictionResponse = {
      prediction: { career_track: 'Software Development & Engineering', probability: 0.72 },
      alternatives: [
        { career_track: 'AI & Machine Learning Engineering', probability: 0.15 },
        { career_track: 'Data Analytics & Business Intelligence', probability: 0.08 },
        { career_track: 'Cloud, DevOps & Systems Engineering', probability: 0.05 },
      ],
      probabilities: [
        { career_track: 'Software Development & Engineering', probability: 0.72 },
        { career_track: 'AI & Machine Learning Engineering', probability: 0.15 },
        { career_track: 'Data Analytics & Business Intelligence', probability: 0.08 },
        { career_track: 'Cloud, DevOps & Systems Engineering', probability: 0.05 },
      ],
      input: {
        recognized_skills: ['python', 'programming'],
        unknown_skills: [],
      },
      model: {
        version: 'phase3.4',
        model_type: 'RandomForestClassifier',
        feature_configuration: 'skills-only',
      },
    };

    let fetchCount = 0;
    setupMockFetch(async (url) => {
      fetchCount++;
      if (url.includes('/explain')) {
        // Simulate explanation network latency or separate async execution
        return new Response(JSON.stringify(MOCK_EXPLANATION_RESPONSE), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(MOCK_PRED_RESPONSE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    // 1. Run prediction first
    const pred = await predictCareer(['python', 'programming']);
    assert(pred.prediction.career_track === 'Software Development & Engineering', 'Prediction received first');
    assert(fetchCount === 1, 'Only prediction fetch initiated initially');

    // 2. Run explanation independently
    const exp = await explainCareerPrediction(['python', 'programming']);
    assert(exp.explanation_method === 'TreeExplainer', 'Explanation received second');
    assert(fetchCount === 2, 'Decoupled calls executed separately');
    console.log('  ✓ Prediction and explanation operate as separate decoupled steps');

    // TEST 5: No fake explanation fallback
    console.log('[Test 5] No fake explanation fallback');
    let emptySkillErr: MlInferenceError | null = null;
    try {
      await explainCareerPrediction([]);
    } catch (e: any) {
      emptySkillErr = e;
    }
    assert(emptySkillErr !== null, 'Empty skills must reject immediately');
    assert(emptySkillErr?.status === 422, 'Empty skills returns status 422');

    // Verify explanation never falls back to hardcoded dictionary on failure
    setupMockFetch(async () => {
      throw new TypeError('Network disconnected');
    });

    let networkErr: MlInferenceError | null = null;
    try {
      await explainCareerPrediction(['python']);
    } catch (e: any) {
      networkErr = e;
    }

    assert(networkErr !== null, 'Network disconnection must throw MlInferenceError');
    assert(networkErr?.isNetworkError === true, 'Error flagged as isNetworkError');
    assert(
      Boolean(networkErr?.message.includes('temporarily unavailable')),
      'Surfaces network failure without fabricating fake explanations'
    );
    console.log('  ✓ Strict no-fake-explanation policy verified');

    console.log('\n--- ALL 5 PHASE 4 FRONTEND EXPLANATION TESTS PASSED SUCCESSFULLY! ---\n');
  } finally {
    restoreFetch();
  }
}

runPhase4ExplanationTests().catch((err) => {
  console.error('\nFAILED PHASE 4 EXPLANATION TEST RUN:', err);
  process.exit(1);
});
