/**
 * Хранилище прогресса пользователя. Без бэкенда и аккаунтов — только localStorage
 * этого браузера. Схема версионируется (поле `version`), чтобы будущие изменения
 * структуры не ломали данные существующих пользователей (см. ТЗ п. 7.4).
 */

export const PROGRESS_STORAGE_KEY = 'oge-himiya:progress';
export const CURRENT_VERSION = 1 as const;

export interface TaskProgress {
  attempts: number;
  correct: number;
  lastAt: string; // ISO
  lastCorrect: boolean;
}

export interface TheoryProgress {
  read: true;
  at: string; // ISO
}

export interface MockAnswerRecord {
  examNumber: number;
  taskId: string;
  answer: string | string[] | number | null;
  correct: boolean | null; // null — часть 2, самопроверка не выполнена
  score: number;
}

export interface MockResult {
  id: string;
  date: string; // ISO
  score: number;
  maxScore: number;
  grade: 2 | 3 | 4 | 5;
  answers: MockAnswerRecord[];
  durationSeconds: number;
}

export interface Streak {
  current: number;
  longest: number;
  lastActiveDate: string | null; // YYYY-MM-DD
}

export interface ProgressState {
  version: typeof CURRENT_VERSION;
  tasks: Record<string, TaskProgress>;
  theory: Record<string, TheoryProgress>;
  mocks: MockResult[];
  streak: Streak;
}

function emptyState(): ProgressState {
  return {
    version: CURRENT_VERSION,
    tasks: {},
    theory: {},
    mocks: [],
    streak: { current: 0, longest: 0, lastActiveDate: null },
  };
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** Миграция более старых версий схемы. Пока есть только v1. */
function migrate(raw: unknown): ProgressState {
  if (!raw || typeof raw !== 'object') return emptyState();
  const data = raw as Partial<ProgressState>;
  if (data.version === CURRENT_VERSION) {
    return {
      version: CURRENT_VERSION,
      tasks: data.tasks ?? {},
      theory: data.theory ?? {},
      mocks: data.mocks ?? [],
      streak: data.streak ?? { current: 0, longest: 0, lastActiveDate: null },
    };
  }
  // Неизвестная/отсутствующая версия — не рискуем интерпретировать структуру.
  return emptyState();
}

export function loadProgress(): ProgressState {
  if (!isBrowser()) return emptyState();
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return emptyState();
    return migrate(JSON.parse(raw));
  } catch {
    return emptyState();
  }
}

export function saveProgress(state: ProgressState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('oge-progress-updated'));
  } catch {
    // Тихо игнорируем (например, приватный режим без доступа к localStorage).
  }
}

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function bumpStreak(streak: Streak): Streak {
  const today = todayLocal();
  if (streak.lastActiveDate === today) return streak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  const current = streak.lastActiveDate === y ? streak.current + 1 : 1;
  return { current, longest: Math.max(streak.longest, current), lastActiveDate: today };
}

export function recordTaskAttempt(taskId: string, correct: boolean): ProgressState {
  const state = loadProgress();
  const prev = state.tasks[taskId] ?? { attempts: 0, correct: 0, lastAt: '', lastCorrect: false };
  state.tasks[taskId] = {
    attempts: prev.attempts + 1,
    correct: prev.correct + (correct ? 1 : 0),
    lastAt: new Date().toISOString(),
    lastCorrect: correct,
  };
  state.streak = bumpStreak(state.streak);
  saveProgress(state);
  return state;
}

export function markTheoryRead(articleId: string): ProgressState {
  const state = loadProgress();
  state.theory[articleId] = { read: true, at: new Date().toISOString() };
  state.streak = bumpStreak(state.streak);
  saveProgress(state);
  return state;
}

export function addMockResult(result: MockResult): ProgressState {
  const state = loadProgress();
  state.mocks.push(result);
  state.streak = bumpStreak(state.streak);
  saveProgress(state);
  return state;
}

export function resetProgress(): ProgressState {
  const state = emptyState();
  saveProgress(state);
  return state;
}

export function exportProgress(): void {
  const state = loadProgress();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = todayLocal();
  a.href = url;
  a.download = `oge-himiya-progress-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importProgress(file: File): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || parsed.version !== CURRENT_VERSION) {
      return { ok: false, error: 'Файл повреждён или создан несовместимой версией сайта.' };
    }
    saveProgress(migrate(parsed));
    return { ok: true };
  } catch {
    return { ok: false, error: 'Не удалось прочитать файл. Убедитесь, что это JSON-файл экспорта прогресса.' };
  }
}

export function getTaskAccuracy(taskId: string, state: ProgressState): number | null {
  const t = state.tasks[taskId];
  if (!t || t.attempts === 0) return null;
  return t.correct / t.attempts;
}

/** Слабые темы: точность < 60% минимум по 2 попыткам, агрегировано по examNumber. */
export function getWeakExamNumbers(
  state: ProgressState,
  taskIdToExamNumber: Record<string, number>,
  threshold = 0.6,
): number[] {
  const byExam = new Map<number, { correct: number; attempts: number }>();
  for (const [taskId, tp] of Object.entries(state.tasks)) {
    const num = taskIdToExamNumber[taskId];
    if (num === undefined) continue;
    const agg = byExam.get(num) ?? { correct: 0, attempts: 0 };
    agg.correct += tp.correct;
    agg.attempts += tp.attempts;
    byExam.set(num, agg);
  }
  const weak: number[] = [];
  for (const [num, agg] of byExam) {
    if (agg.attempts >= 2 && agg.correct / agg.attempts < threshold) weak.push(num);
  }
  return weak.sort((a, b) => a - b);
}
