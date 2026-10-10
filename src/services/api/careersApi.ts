import { Career } from '@/types/careerCompass';
import { DEMO_CAREERS } from '@/data/careers';

/**
 * Careers API Service
 * Handles career ontology retrieval with asynchronous contract.
 */
export async function getCareers(): Promise<Career[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  return JSON.parse(JSON.stringify(DEMO_CAREERS));
}

export async function getCareerById(id: string): Promise<Career | null> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  const career = DEMO_CAREERS.find((c) => c.id === id || c.slug === id);
  return career ? JSON.parse(JSON.stringify(career)) : null;
}

export async function getCareerTracks(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 10));
  const tracks = Array.from(new Set(DEMO_CAREERS.map((c) => c.careerTrack)));
  return tracks;
}
