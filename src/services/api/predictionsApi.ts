import { PredictionRecord } from '@/types/careerCompass';
import { loadState, getInitialState } from '@/services/persistence/storage';
import { DEMO_PREDICTION_CURRENT } from '@/data/predictions';

export interface PredictionResponse {
  predictionId: string;
  careerTrack: string;
  probabilities: { name: string; probability: number }[];
  modelVersion: string;
  generatedAt: string;
  isDemo: boolean;
}

/**
 * Predictions API Service
 * Handles prediction history queries with async contracts.
 * IMPORTANT: Strictly decoupled from ML execution. Returns labeled demo inferences only.
 */
export async function getPredictionHistory(): Promise<PredictionRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const state = loadState() || getInitialState();
  return JSON.parse(JSON.stringify(state.predictionHistory));
}

export async function getLatestPrediction(): Promise<PredictionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const state = loadState() || getInitialState();
  const latestReal = state.predictionHistory.find((p) => p.isRealMl);

  if (latestReal) {
    return {
      predictionId: latestReal.id,
      careerTrack: latestReal.predictedCareer,
      probabilities: latestReal.alternativeTracks,
      modelVersion: latestReal.assessmentVersion,
      generatedAt: latestReal.date,
      isDemo: false
    };
  }

  return {
    predictionId: 'pred-rec-current',
    careerTrack: DEMO_PREDICTION_CURRENT.predictedCareer,
    probabilities: DEMO_PREDICTION_CURRENT.alternativeTracks,
    modelVersion: DEMO_PREDICTION_CURRENT.assessmentVersion,
    generatedAt: new Date().toISOString(),
    isDemo: true
  };
}

