/**
 * Typed API Client for CareerCompass Project Intelligence Engine.
 *
 * Connects to Phase 6 FastAPI endpoints:
 * - POST /api/v1/career/projects/recommendations
 * - GET  /api/v1/career/projects/catalog
 *
 * Strict policy:
 * - Never returns fake/mock project data on failure.
 * - Surfaces user-safe, informative error messages.
 * - Handles loading, empty states, 4xx, 5xx, and network errors cleanly.
 */

import { getApiBaseUrl } from './mlInference';

export interface ProjectItem {
  project_id: string;
  title: string;
  career_track: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  estimated_effort: string;
  skills_demonstrated: string[];
  skills_targeted: string[];
  prerequisites: string[];
  recommended_stage: number;
  portfolio_value: 'medium' | 'high' | 'very_high' | string;
  suggested_deliverables: string[];
  suggested_evidence: string[];
  technology_stack?: string[];
}

export interface RecommendedProject extends ProjectItem {
  matched_missing_skills: string[];
  prerequisites_met: boolean;
  relevance_score: number;
}

export interface ProjectRecommendationRequest {
  skills: string[];
  target_career_track?: string | null;
}

export interface ProjectRecommendationResponse {
  target_career_track: string;
  target_source: 'model_prediction' | 'user_selected' | string;
  projects: RecommendedProject[];
}

export class ProjectRecommendationError extends Error {
  status?: number;
  code?: string;
  isNetworkError: boolean;
  userMessage: string;

  constructor(message: string, status?: number, code?: string, isNetworkError = false) {
    super(message);
    this.name = 'ProjectRecommendationError';
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
      message: cleaned || 'Project recommendation service is initializing or temporarily unavailable.',
      code,
    };
  }

  if (status >= 500) {
    return {
      message: 'An error occurred on the Project Intelligence server. Please verify the service is running and try again.',
      code: 'server_error',
    };
  }

  return {
    message: cleaned || `Request failed with status ${status}.`,
    code,
  };
}

/**
 * Dispatches project recommendation request to FastAPI.
 * Calls POST /api/v1/career/projects/recommendations.
 */
export async function getProjectRecommendations(
  request: ProjectRecommendationRequest
): Promise<ProjectRecommendationResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1/career/projects/recommendations`;

  if (!request.skills || request.skills.length === 0) {
    throw new ProjectRecommendationError(
      'Skills list cannot be empty. Please provide at least one skill.',
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
    throw new ProjectRecommendationError(
      'Project Intelligence service is temporarily unavailable. Please make sure the backend is running at ' +
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
    throw new ProjectRecommendationError(message, response.status, code, false);
  }

  const data = await response.json();
  if (
    !data ||
    typeof data.target_career_track !== 'string' ||
    !Array.isArray(data.projects)
  ) {
    throw new ProjectRecommendationError(
      'Malformed response received from Project Intelligence service.',
      response.status,
      'malformed_response'
    );
  }

  return data as ProjectRecommendationResponse;
}

/**
 * Fetches the complete curated project catalog.
 * Calls GET /api/v1/career/projects/catalog.
 */
export async function getProjectCatalog(): Promise<ProjectItem[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1/career/projects/catalog`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch (error: any) {
    throw new ProjectRecommendationError(
      'Project catalog service is temporarily unavailable.',
      0,
      'network_error',
      true
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const { message, code } = sanitizeErrorMessage(response.status, body);
    throw new ProjectRecommendationError(message, response.status, code, false);
  }

  return response.json();
}
