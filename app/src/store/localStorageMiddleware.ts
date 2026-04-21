import { Middleware } from '@reduxjs/toolkit';
import { AttemptProgress } from '../types/design';
import { upsertProgress, clearProgress } from './progressSlice';

const STORAGE_PREFIX = 'sdia_progress_';

export const localStorageMiddleware: Middleware = (_store) => (next) => (action) => {
  const result = next(action);

  if (upsertProgress.match(action)) {
    const progress: AttemptProgress = action.payload;
    try {
      localStorage.setItem(
        STORAGE_PREFIX + progress.designId,
        JSON.stringify(progress)
      );
    } catch {
      // localStorage unavailable — app continues in degraded mode
    }
  }

  if (clearProgress.match(action)) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + action.payload);
    } catch {
      // ignore
    }
  }

  return result;
};

/**
 * Called once at app startup to hydrate progressSlice from localStorage.
 * Reads all keys with the sdia_progress_ prefix, skipping corrupt/missing values.
 */
export function loadAllProgressFromStorage(): Record<string, AttemptProgress> {
  const records: Record<string, AttemptProgress> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        const designId = key.slice(STORAGE_PREFIX.length);
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            records[designId] = JSON.parse(raw) as AttemptProgress;
          } catch {
            // skip corrupt entries
          }
        }
      }
    }
  } catch {
    // localStorage unavailable
  }
  return records;
}
