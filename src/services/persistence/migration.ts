import { StudentState } from '@/types/appState';
import { STORAGE_VERSION } from './storageKeys';

export interface StoredPayload {
  version: number;
  updatedAt: string;
  state: StudentState;
}

/**
 * Validates and migrates stored state payloads across schema versions.
 * Safely falls back if payload is corrupt or incompatible.
 */
export function migrateState(rawPayload: unknown): StudentState | null {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return null;
  }

  const payload = rawPayload as Record<string, any>;

  // Check if payload has versioned envelope
  if ('version' in payload && 'state' in payload) {
    const version = payload.version;
    const state = payload.state;

    if (!state || typeof state !== 'object') {
      return null;
    }

    if (version === STORAGE_VERSION) {
      // Validate that essential keys exist in state
      if (
        state.profile &&
        Array.isArray(state.skills) &&
        Array.isArray(state.roadmap) &&
        Array.isArray(state.learningResources)
      ) {
        return state as StudentState;
      }
      return null;
    }

    // Future version migrations can be handled here:
    // if (version === 0) { ... migrate to 1 ... }
  }

  // Fallback check: if raw unversioned state was stored
  if (
    payload.profile &&
    Array.isArray(payload.skills) &&
    Array.isArray(payload.roadmap)
  ) {
    return payload as StudentState;
  }

  return null;
}
