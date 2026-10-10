/**
 * Typed API Client for CareerCompass Career Intelligence Engine.
 *
 * Connects to Phase 5 FastAPI endpoints:
 * - POST /api/v1/career/intelligence
 * - GET  /api/v1/career/ontology
 *
 * Strict policy:
 * - Never returns fake/mock prediction or gap data on failure.
 * - Surfaces user-safe, informative error messages.
 * - Accurately distinguishes between ML model predictions and user-selected planning targets.
 */

import { getApiBaseUrl } from './mlInference';

export interface CareerIntelligenceRequest {
  skills: string[];
  target_career_track?: string | null;
}

export interface RequiredSkillCoverage {
  decimal: number;
  percentage: number;
  present_count: number;
  required_count: number;
}

export interface PrioritizedGap {
  skill: string;
  priority: 'core' | 'supporting' | 'advanced' | string;
  category: string;
  reason: string;
  prerequisites: string[];
  prerequisites_met: boolean;
  recommended_order: number;
}

export interface RoadmapItem {
  id: string;
  stage: number;
  stage_title: string;
  title: string;
  skill: string;
  status: 'not_started' | 'in_progress' | 'completed' | string;
  prerequisites: string[];
  prerequisites_met: boolean;
  priority: string;
  description: string;
}

export interface LearningRecommendation {
  resource_id: string;
  title: string;
  provider: string;
  skill: string;
  resource_type: string;
  difficulty: string;
  estimated_effort: string;
  roadmap_stage: number;
  url?: string | null;
  prerequisites?: string[];
  prerequisites_met?: boolean;
}

export interface AlternativeTrack {
  career_track: string;
  probability: number;
}

export interface PredictionPayload {
  career_track: string;
  probability: number;
  alternatives: AlternativeTrack[];
  probabilities: AlternativeTrack[];
}

export interface CareerIntelligenceResponse {
  target_career_track: string;
  target_source: 'model_prediction' | 'user_selected' | string;
  prediction?: PredictionPayload | null;
  recognized_skills: string[];
  unknown_skills: string[];
  required_skills: string[];
  present_required_skills: string[];
  missing_required_skills: string[];
  required_skill_coverage: RequiredSkillCoverage;
  prioritized_gaps: PrioritizedGap[];
  roadmap: RoadmapItem[];
  learning_recommendations: LearningRecommendation[];
  model: {
    version: string;
    model_type: string;
    feature_configuration: string;
  };
}

export class CareerIntelligenceError extends Error {
  status?: number;
  code?: string;
  isNetworkError: boolean;
  userMessage: string;

  constructor(message: string, status?: number, code?: string, isNetworkError = false) {
    super(message);
    this.name = 'CareerIntelligenceError';
    this.status = status;
    this.code = code;
    this.isNetworkError = isNetworkError;
    this.userMessage = message;
  }
}

function sanitizeErrorMessage(status: number, body: any): { message: string; code?: string } {
  const code = body?.code || (status === 422 ? 'validation_error' : status === 503 ? 'service_unavailable' : 'server_error');

  let rawMsg = '';
  if (typeof body?.message === 'string' && body.message.trim()) {
    rawMsg = body.message;
  } else if (typeof body?.detail === 'string' && body.detail.trim()) {
    rawMsg = body.detail;
  } else if (Array.isArray(body?.detail) && body.detail.length > 0) {
    const first = body.detail[0];
    rawMsg = typeof first === 'string' ? first : first?.msg || JSON.stringify(first);
  } else if (Array.isArray(body?.errors) && body.errors.length > 0) {
    const first = body.errors[0];
    rawMsg = typeof first === 'string' ? first : first?.msg || JSON.stringify(first);
  }

  let cleaned = rawMsg.replace(/^Value error,\s*/i, '').trim();
  cleaned = cleaned.replace(/[A-Za-z]:\\[^\s"']+/g, '[internal path]');
  cleaned = cleaned.replace(/\/[a-zA-Z0-9_\-\/]+\.py/g, '[internal module]');

  if (status === 422) {
    return {
      message: cleaned || 'Validation failed. Please verify that at least one valid skill is provided.',
      code,
    };
  }

  if (status === 503) {
    return {
      message: cleaned || 'Career Intelligence service is initializing or temporarily unavailable.',
      code,
    };
  }

  if (status >= 500) {
    return {
      message: 'An error occurred on the Career Intelligence server. Please verify the service is running and try again.',
      code: 'server_error',
    };
  }

  return {
    message: cleaned || `Request failed with status ${status}.`,
    code,
  };
}

/**
 * Dispatches Career Intelligence evaluation to FastAPI.
 * Calls POST /api/v1/career/intelligence.
 */
export async function evaluateCareerIntelligence(
  request: CareerIntelligenceRequest
): Promise<CareerIntelligenceResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1/career/intelligence`;

  if (!request.skills || request.skills.length === 0) {
    throw new CareerIntelligenceError(
      'Skills list cannot be empty. Please select or input at least one skill.',
      422,
      'validation_error'
    );
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        skills: request.skills,
        target_career_track: request.target_career_track || null,
      }),
    });
  } catch (error: any) {
    throw new CareerIntelligenceError(
      'Career Intelligence service is temporarily unavailable. Please make sure the service is running at ' +
        baseUrl +
        ' and try again.',
      0,
      'network_error',
      true
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const { message, code } = sanitizeErrorMessage(response.status, body);
    throw new CareerIntelligenceError(message, response.status, code, false);
  }

  const data = await response.json();
  if (
    !data ||
    typeof data.target_career_track !== 'string' ||
    !Array.isArray(data.required_skills) ||
    !data.required_skill_coverage
  ) {
    throw new CareerIntelligenceError(
      'Malformed response received from Career Intelligence service.',
      response.status,
      'malformed_response'
    );
  }

  return data as CareerIntelligenceResponse;
}

/**
 * Fetches the curated competency ontology metadata.
 * Calls GET /api/v1/career/ontology.
 */
export async function getCareerOntology(): Promise<any> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1/career/ontology`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch (error: any) {
    throw new CareerIntelligenceError(
      'Career ontology service is temporarily unavailable.',
      0,
      'network_error',
      true
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const { message, code } = sanitizeErrorMessage(response.status, body);
    throw new CareerIntelligenceError(message, response.status, code, false);
  }

  return response.json();
}
