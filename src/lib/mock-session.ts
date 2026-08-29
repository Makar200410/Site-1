import type { UserAnswer } from './trainer-types';
import { EXAM_CONFIG } from '@/config/exam';

export interface MockSessionState {
  variantId: string;
  deadline: string; // ISO — startedAt + 180 минут, не зависит от переоткрытия вкладки
  startedAt: string;
  answers: Record<string, UserAnswer>; // taskId -> ответ
  flags: string[]; // taskId[] — отмечены флажком «вернуться»
  completed?: {
    finishedAt: string;
    totalScore: number;
    maxScore: number;
    grade: 2 | 3 | 4 | 5;
  };
}

function storageKey(variantId: string) {
  return `oge-himiya:mock:${variantId}`;
}

export function loadMockSession(variantId: string): MockSessionState | null {
  try {
    const raw = localStorage.getItem(storageKey(variantId));
    return raw ? (JSON.parse(raw) as MockSessionState) : null;
  } catch {
    return null;
  }
}

export function createMockSession(variantId: string): MockSessionState {
  const now = new Date();
  const deadline = new Date(now.getTime() + EXAM_CONFIG.durationMinutes * 60_000);
  const state: MockSessionState = {
    variantId,
    startedAt: now.toISOString(),
    deadline: deadline.toISOString(),
    answers: {},
    flags: [],
  };
  saveMockSession(state);
  return state;
}

export function saveMockSession(state: MockSessionState): void {
  try {
    localStorage.setItem(storageKey(state.variantId), JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function clearMockSession(variantId: string): void {
  try {
    localStorage.removeItem(storageKey(variantId));
  } catch {
    // ignore
  }
}
