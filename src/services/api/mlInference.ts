/**
 * Typed API Client for CareerCompass FastAPI ML Inference Service.
 *
 * Connects directly to the Phase 3.4.1 Random Forest model endpoints:
 * - GET  /api/v1/predictions/career/skills
 * - POST /api/v1/predictions/career
 * - GET  /api/v1/model/info
 *
 * Strict policy:
 * - Never returns fake/mock prediction data on failure.
 * - Always surfaces user-safe, informative error messages.
 * - Never leaks internal Python filesystem paths or tracebacks.
 */

export interface CareerPredictionRequest {
  skills: string[];
}

export interface CareerProbability {
  career_track: string;
  probability: number;
}

export interface CareerPredictionResponse {
  prediction: {
    career_track: string;
    probability: number;
  };
  alternatives: CareerProbability[];
  probabilities: CareerProbability[];
  input: {
    recognized_skills: string[];
    unknown_skills: string[];
  };
  model: {
    version: string;
    model_type: string;
    feature_configuration: string;
  };
  explanation?: unknown;
}

export type FeatureContributionDirection = 'supports' | 'opposes' | 'neutral';

export interface FeatureContribution {
  skill: string;
  present: boolean;
  direction: FeatureContributionDirection;
  contribution: number;
}

export interface CareerExplanationResponse {
  prediction: {
    career_track: string;
    probability: number;
  };
  explanation_method: string;
  features: FeatureContribution[];
  input: {
    recognized_skills: string[];
    unknown_skills: string[];
  };
  model: {
    version: string;
    model_type: string;
    feature_configuration: string;
  };
}

export interface SkillVocabularyResponse {
  skills: string[];
  count: number;
  model_version?: string;
}

export interface ExplainabilityInfo {
  available: boolean;
  method: string;
}

export interface CalibrationInfo {
  status: string;
  method: string;
}

export interface ModelInfoResponse {
  model_version: string;
  model_type: string;
  feature_configuration: string;
  feature_count: number;
  classes: string[];
  training_samples: number;
  taxonomy_version?: string;
  calibration?: string;
  threshold_policy: string;
  explainability?: ExplainabilityInfo;
  calibration_info?: CalibrationInfo;
}

export class MlInferenceError extends Error {
  status?: number;
  code?: string;
  isNetworkError: boolean;
  userMessage: string;

  constructor(message: string, status?: number, code?: string, isNetworkError = false) {
    super(message);
    this.name = 'MlInferenceError';
    this.status = status;
    this.code = code;
    this.isNetworkError = isNetworkError;
    this.userMessage = message;
  }
}

/**
 * Resolves the backend base URL using Vite environment configuration.
 * Defaults to http://127.0.0.1:8000 for local development.
 */
export function getApiBaseUrl(): string {
  const envUrl =
    (import.meta as any).env?.VITE_API_BASE_URL ||
    (import.meta as any).env?.VITE_API_URL;
  return (envUrl || 'http://127.0.0.1:8000').replace(/\/+$/, '');
}

/**
 * Sanitizes and extracts user-safe error messages from HTTP error responses.
 */
function sanitizeErrorMessage(status: number, body: any): { message: string; code?: string } {
  const code = body?.code || (status === 422 ? 'validation_error' : status === 503 ? 'service_unavailable' : 'inference_error');

  // Check common error response shapes
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

  // Clean python validator prefixes
  let cleaned = rawMsg.replace(/^Value error,\s*/i, '').trim();

  // Strip any file system paths (e.g. C:\... or /home/...)
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
      message: cleaned || 'Career prediction is temporarily unavailable. The ML model service is initializing or not ready.',
      code,
    };
  }

  if (status >= 500) {
    return {
      message: 'An error occurred on the prediction server. Please make sure the ML service is running and try again.',
      code: 'server_error',
    };
  }

  return {
    message: cleaned || `Prediction request failed with status ${status}.`,
    code,
  };
}

/**
 * Fetches the canonical 29-skill vocabulary recognized by the Phase 3.4.1 model.
 * Calls GET /api/v1/predictions/career/skills.
 */
export async function getCareerSkillVocabulary(): Promise<SkillVocabularyResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1/predictions/career/skills`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (error: any) {
    throw new MlInferenceError(
      'Career prediction service is temporarily unavailable. Please make sure the ML service is running at ' +
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
    throw new MlInferenceError(message, response.status, code, false);
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.skills)) {
    throw new MlInferenceError(
      'Malformed response received from skill vocabulary endpoint.',
      response.status,
      'malformed_response'
    );
  }

  return data as SkillVocabularyResponse;
}

/**
 * Runs dynamic career track inference via FastAPI using Candidate H Random Forest model.
 * Calls POST /api/v1/predictions/career.
 */
export async function predictCareer(skills: string[]): Promise<CareerPredictionResponse> {
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    throw new MlInferenceError(
      'Please select or enter at least one skill before requesting a prediction.',
      422,
      'empty_skills'
    );
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1/predictions/career`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ skills }),
    });
  } catch (error: any) {
    throw new MlInferenceError(
      'Career prediction is temporarily unavailable. Please make sure the ML service is running at ' +
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
    throw new MlInferenceError(message, response.status, code, false);
  }

  const data = await response.json();

  // Validate critical response structure
  if (
    !data ||
    !data.prediction ||
    typeof data.prediction.career_track !== 'string' ||
    typeof data.prediction.probability !== 'number' ||
    !Array.isArray(data.probabilities) ||
    !data.input ||
    !Array.isArray(data.input.recognized_skills) ||
    !Array.isArray(data.input.unknown_skills)
  ) {
    throw new MlInferenceError(
      'Malformed prediction response structure received from ML service.',
      response.status,
      'malformed_response'
    );
  }

  return data as CareerPredictionResponse;
}

/**
 * Retrieves active model metadata and governance information.
 * Calls GET /api/v1/model/info.
 */
export async function getModelInfo(): Promise<ModelInfoResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1/model/info`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch (error: any) {
    throw new MlInferenceError(
      'Model metadata service is unavailable at ' + baseUrl,
      0,
      'network_error',
      true
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const { message, code } = sanitizeErrorMessage(response.status, body);
    throw new MlInferenceError(message, response.status, code, false);
  }

  return (await response.json()) as ModelInfoResponse;
}

/**
 * Requests local feature-level explainability for Candidate H Random Forest prediction.
 * Calls POST /api/v1/predictions/career/explain.
 * Strict policy: Returns typed feature attributions without mock fallback.
 */
export async function explainCareerPrediction(skills: string[]): Promise<CareerExplanationResponse> {
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    throw new MlInferenceError(
      'Please select or enter at least one skill before requesting an explanation.',
      422,
      'empty_skills'
    );
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1/predictions/career/explain`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ skills }),
    });
  } catch (error: unknown) {
    throw new MlInferenceError(
      'Career explanation service is temporarily unavailable. Please make sure the ML service is running at ' +
        baseUrl +
        ' and try again.',
      0,
      'network_error',
      true
    );
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => ({}));
    const { message, code } = sanitizeErrorMessage(response.status, body);
    throw new MlInferenceError(message, response.status, code, false);
  }

  const data = (await response.json()) as CareerExplanationResponse;

  if (
    !data ||
    !data.prediction ||
    typeof data.prediction.career_track !== 'string' ||
    typeof data.prediction.probability !== 'number' ||
    typeof data.explanation_method !== 'string' ||
    !Array.isArray(data.features) ||
    !data.input ||
    !Array.isArray(data.input.recognized_skills)
  ) {
    throw new MlInferenceError(
      'Malformed explanation response structure received from ML service.',
      response.status,
      'malformed_response'
    );
  }

  return data;
}
