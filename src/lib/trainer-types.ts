export type AnswerType = 'single' | 'multiple' | 'matching' | 'numeric' | 'sequence' | 'extended';
export type Difficulty = 'base' | 'advanced' | 'high';

export interface TaskIndexEntry {
  id: string;
  examNumber: number;
  topicId: string;
  difficulty: Difficulty;
  answerType: AnswerType;
  maxScore: number;
}

export interface OptionHtml {
  id: string;
  textHtml: string;
}

/** Полные данные задания с полями, уже отрендеренными в HTML на этапе сборки. */
export interface FullTask {
  id: string;
  examNumber: number;
  topicId: string;
  difficulty: Difficulty;
  answerType: AnswerType;
  statementHtml: string;
  options?: OptionHtml[];
  matchingLeft?: OptionHtml[];
  matchingRight?: OptionHtml[];
  correctAnswer: string | string[] | number;
  tolerance?: number;
  maxScore: number;
  solutionHtml: string;
  hintHtml?: string;
  criteria?: string[];
  theoryRefs: string[];
}

export type UserAnswer = string | string[] | number | null;

export interface AnsweredRecord {
  taskId: string;
  examNumber: number;
  topicId: string;
  answer: UserAnswer;
  correct: boolean | null; // null для развёрнутых до самопроверки
  score: number;
  maxScore: number;
  revealed: boolean;
}

export interface SessionQueueItem {
  id: string;
  examNumber: number;
}

export interface SessionConfig {
  queue: SessionQueueItem[];
  startedAt: string;
  label: string;
}

export const SESSION_STORAGE_KEY = 'oge-himiya:trainer-session';

/** Сравнивает ответ пользователя с эталонным для автоматически проверяемых типов. */
export function checkAnswer(task: FullTask, answer: UserAnswer): boolean {
  switch (task.answerType) {
    case 'single': {
      return answer === task.correctAnswer;
    }
    case 'multiple': {
      const given = new Set(Array.isArray(answer) ? answer : []);
      const correct = new Set(Array.isArray(task.correctAnswer) ? task.correctAnswer : []);
      if (given.size !== correct.size) return false;
      for (const v of given) if (!correct.has(v)) return false;
      return true;
    }
    case 'sequence': {
      const given = Array.isArray(answer) ? answer : [];
      const correct = Array.isArray(task.correctAnswer) ? task.correctAnswer : [];
      if (given.length !== correct.length) return false;
      return given.every((v, i) => v === correct[i]);
    }
    case 'matching': {
      const given = Array.isArray(answer) ? answer : [];
      const correctStr = typeof task.correctAnswer === 'string' ? task.correctAnswer : '';
      const correctPairs = correctStr.split(',').map((p) => p.trim()).filter(Boolean);
      if (given.length !== correctPairs.length) return false;
      const givenSet = new Set(given);
      return correctPairs.every((p) => givenSet.has(p));
    }
    case 'numeric': {
      const num = typeof answer === 'number' ? answer : Number(answer);
      if (Number.isNaN(num)) return false;
      const target = typeof task.correctAnswer === 'number' ? task.correctAnswer : Number(task.correctAnswer);
      const tol = task.tolerance ?? 0.01;
      return Math.abs(num - target) <= tol;
    }
    case 'extended':
      return false; // самопроверка
  }
}
