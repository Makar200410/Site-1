import { useEffect, useMemo, useRef, useState } from 'react';
import type { FullTask, UserAnswer } from '@/lib/trainer-types';
import { checkAnswer } from '@/lib/trainer-types';
import { fetchTasksByIds } from '@/lib/fetch-tasks';
import { loadMockSession, createMockSession, saveMockSession, type MockSessionState } from '@/lib/mock-session';
import { addMockResult, type MockAnswerRecord } from '@/lib/progress';
import { EXAM_CONFIG, scoreToGrade } from '@/config/exam';
import TaskAnswerInput from '@/components/islands/shared/TaskAnswerInput';
import ReferencePanel from '@/components/islands/reference/ReferencePanel';

interface Props {
  variantId: string;
  title: string;
  taskRefs: { id: string; examNumber: number }[];
}

type Stage = 'loading' | 'intro' | 'taking' | 'review-part2' | 'results' | 'results-existing';

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function MockExam({ variantId, title, taskRefs }: Props) {
  const [stage, setStage] = useState<Stage>('loading');
  const [tasksById, setTasksById] = useState<Map<string, FullTask>>(new Map());
  const [session, setSession] = useState<MockSessionState | null>(null);
  const [index, setIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [warned30, setWarned30] = useState(false);
  const [warned5, setWarned5] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewRevealed, setReviewRevealed] = useState(false);
  const [reviewScores, setReviewScores] = useState<Record<string, number>>({});
  const sessionRef = useRef<MockSessionState | null>(null);

  useEffect(() => {
    fetchTasksByIds(taskRefs).then((map) => {
      setTasksById(map);
      const existing = loadMockSession(variantId);
      if (existing?.completed) {
        setSession(existing);
        setStage('results-existing');
      } else if (existing) {
        setSession(existing);
        sessionRef.current = existing;
        setStage('taking');
      } else {
        setStage('intro');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function begin() {
    const s = createMockSession(variantId);
    setSession(s);
    sessionRef.current = s;
    setStage('taking');
  }

  function restart() {
    const s = createMockSession(variantId);
    setSession(s);
    sessionRef.current = s;
    setIndex(0);
    setConfirmRestart(false);
    setStage('taking');
  }

  // Таймер + автосохранение каждые 15 секунд
  useEffect(() => {
    if (stage !== 'taking' || !session) return;
    const deadline = new Date(session.deadline).getTime();

    function tick() {
      const left = deadline - Date.now();
      setRemainingMs(left);
      if (left <= 30 * 60_000 && left > 0) setWarned30(true);
      if (left <= 5 * 60_000 && left > 0) setWarned5(true);
      if (left <= 0) finish();
    }
    tick();
    const timerId = setInterval(tick, 1000);
    const autosaveId = setInterval(() => {
      if (sessionRef.current) saveMockSession(sessionRef.current);
    }, EXAM_CONFIG.autosaveIntervalSeconds * 1000);
    return () => {
      clearInterval(timerId);
      clearInterval(autosaveId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, session?.deadline]);

  function updateAnswer(taskId: string, answer: UserAnswer) {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, answers: { ...prev.answers, [taskId]: answer } };
      sessionRef.current = next;
      return next;
    });
  }

  function toggleFlag(taskId: string) {
    setSession((prev) => {
      if (!prev) return prev;
      const flags = prev.flags.includes(taskId) ? prev.flags.filter((f) => f !== taskId) : [...prev.flags, taskId];
      const next = { ...prev, flags };
      sessionRef.current = next;
      saveMockSession(next);
      return next;
    });
  }

  const part2Tasks = useMemo(
    () => taskRefs.map((r) => tasksById.get(r.id)).filter((t): t is FullTask => !!t && t.answerType === 'extended'),
    [taskRefs, tasksById],
  );

  function finish() {
    if (!sessionRef.current) return;
    saveMockSession(sessionRef.current);
    if (part2Tasks.length > 0) {
      setReviewIndex(0);
      setReviewRevealed(false);
      setStage('review-part2');
    } else {
      finalizeResults({});
    }
  }

  function submitReviewScore(score: number) {
    const task = part2Tasks[reviewIndex];
    const nextScores = { ...reviewScores, [task.id]: score };
    setReviewScores(nextScores);
    if (reviewIndex + 1 >= part2Tasks.length) {
      finalizeResults(nextScores);
    } else {
      setReviewIndex((i) => i + 1);
      setReviewRevealed(false);
    }
  }

  function finalizeResults(part2Scores: Record<string, number>) {
    if (!sessionRef.current) return;
    const s = sessionRef.current;
    const answersOut: MockAnswerRecord[] = taskRefs.map((ref) => {
      const task = tasksById.get(ref.id)!;
      const answer = s.answers[ref.id] ?? null;
      if (task.answerType === 'extended') {
        const score = part2Scores[ref.id] ?? 0;
        return { examNumber: ref.examNumber, taskId: ref.id, answer, correct: score === task.maxScore, score };
      }
      const correct = checkAnswer(task, answer);
      return { examNumber: ref.examNumber, taskId: ref.id, answer, correct, score: correct ? task.maxScore : 0 };
    });
    const totalScore = answersOut.reduce((sum, a) => sum + a.score, 0);
    const maxScore = answersOut.reduce((sum, a) => sum + (tasksById.get(a.taskId)?.maxScore ?? 0), 0);
    const grade = scoreToGrade(totalScore).grade;
    const durationSeconds = Math.round((Date.now() - new Date(s.startedAt).getTime()) / 1000);

    addMockResult({
      id: `${variantId}-${Date.now()}`,
      date: new Date().toISOString(),
      score: totalScore,
      maxScore,
      grade,
      answers: answersOut,
      durationSeconds,
    });

    const completed = { finishedAt: new Date().toISOString(), totalScore, maxScore, grade };
    const finishedSession = { ...s, completed };
    saveMockSession(finishedSession);
    setSession(finishedSession);
    sessionRef.current = finishedSession;
    setStage('results');
  }

  if (stage === 'loading') return <p className="text-[var(--text-muted)]">Загружаем вариант…</p>;

  if (stage === 'intro') {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
        <h2 className="text-xl font-bold text-[var(--text)]">{title}</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[var(--text-muted)]">
          <li>24 задания в порядке настоящего экзамена</li>
          <li>{EXAM_CONFIG.durationMinutes} минут на выполнение, таймер не останавливается</li>
          <li>Ответы сохраняются автоматически каждые {EXAM_CONFIG.autosaveIntervalSeconds} секунд — прогресс не потеряется при закрытии вкладки</li>
          <li>Часть 2 (развёрнутые ответы) проверяется вами самостоятельно после завершения</li>
        </ul>
        <button type="button" onClick={begin} className="tap-target mt-5 rounded-lg bg-brand-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-brand-700">
          Начать пробник
        </button>
      </div>
    );
  }

  if (stage === 'results-existing' && session?.completed) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
        <p className="text-[var(--text)]">
          Вы уже проходили этот вариант: <strong>{session.completed.totalScore} из {session.completed.maxScore}</strong> баллов, оценка «{session.completed.grade}».
        </p>
        {!confirmRestart ? (
          <button type="button" onClick={() => setConfirmRestart(true)} className="tap-target mt-4 rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] hover:border-brand-400">
            Пройти заново
          </button>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <p className="text-sm text-[var(--text)]">Текущий результат будет заменён. Точно начать заново?</p>
            <button type="button" onClick={restart} className="tap-target rounded-md bg-danger-600 px-4 py-2 text-sm font-semibold text-white">
              Да, начать заново
            </button>
            <button type="button" onClick={() => setConfirmRestart(false)} className="tap-target rounded-md border border-[var(--border)] px-4 py-2 text-sm">
              Отмена
            </button>
          </div>
        )}
      </div>
    );
  }

  if (stage === 'taking' && session) {
    const ref = taskRefs[index];
    const task = tasksById.get(ref.id);
    if (!task) return <p className="text-[var(--text-muted)]">Загрузка…</p>;
    const answeredCount = taskRefs.filter((r) => session.answers[r.id] != null).length;

    return (
      <div>
        <div className="sticky top-16 z-20 -mx-4 border-b border-[var(--border)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-lg font-bold text-[var(--text)]">{formatTime(remainingMs)}</p>
              <p className="text-xs text-[var(--text-muted)]">Отвечено: {answeredCount} / {taskRefs.length}</p>
            </div>
            <div className="flex gap-2">
              <ReferencePanel />
              <button type="button" onClick={() => setConfirmFinish(true)} className="tap-target rounded-md border border-danger-500/50 px-3 py-2 text-sm font-medium text-danger-600 hover:bg-danger-500/10">
                Завершить
              </button>
            </div>
          </div>
          {warned30 && remainingMs > 5 * 60_000 && (
            <p className="mt-2 rounded-md bg-accent-500/15 px-3 py-1.5 text-sm text-accent-600">Осталось меньше 30 минут</p>
          )}
          {warned5 && remainingMs > 0 && (
            <p className="mt-2 rounded-md bg-danger-500/15 px-3 py-1.5 text-sm font-semibold text-danger-600">Осталось меньше 5 минут!</p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-8 gap-1.5 sm:grid-cols-12">
          {taskRefs.map((r, i) => {
            const answered = session.answers[r.id] != null;
            const flagged = session.flags.includes(r.id);
            const isCurrent = i === index;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`tap-target relative flex h-9 items-center justify-center rounded text-xs font-semibold ${
                  isCurrent
                    ? 'border-2 border-brand-600 text-[var(--text)]'
                    : answered
                      ? 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-100'
                      : 'border border-[var(--border)] text-[var(--text-muted)]'
                }`}
              >
                {r.examNumber}
                {flagged && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent-500" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {confirmFinish && (
          <div className="mt-4 rounded-lg border border-danger-500/40 bg-danger-500/10 p-4">
            <p className="text-sm text-[var(--text)]">
              Отвечено на {answeredCount} из {taskRefs.length}. Завершить пробник и перейти к проверке?
            </p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={finish} className="tap-target rounded-md bg-danger-600 px-4 py-2 text-sm font-semibold text-white">
                Завершить
              </button>
              <button type="button" onClick={() => setConfirmFinish(false)} className="tap-target rounded-md border border-[var(--border)] px-4 py-2 text-sm">
                Вернуться к заданиям
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--text-muted)]">Задание {task.examNumber} · до {task.maxScore} {task.maxScore === 1 ? 'балла' : 'баллов'}</p>
            <button
              type="button"
              onClick={() => toggleFlag(ref.id)}
              className={`tap-target rounded-md border px-3 py-1.5 text-xs font-medium ${
                session.flags.includes(ref.id) ? 'border-accent-500 bg-accent-500/10 text-accent-600' : 'border-[var(--border)] text-[var(--text-muted)]'
              }`}
            >
              🚩 Вернуться
            </button>
          </div>
          <div className="prose-chem mt-3 text-[var(--text)]" dangerouslySetInnerHTML={{ __html: task.statementHtml }} />
          <div className="mt-4">
            <TaskAnswerInput task={task} value={session.answers[ref.id] ?? null} onChange={(v) => updateAnswer(ref.id, v)} />
          </div>

          <div className="mt-5 flex justify-between gap-3">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="tap-target rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text)] disabled:opacity-30"
            >
              ← Назад
            </button>
            <button
              type="button"
              disabled={index === taskRefs.length - 1}
              onClick={() => setIndex((i) => Math.min(taskRefs.length - 1, i + 1))}
              className="tap-target rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-30"
            >
              Дальше →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'review-part2') {
    const task = part2Tasks[reviewIndex];
    const answer = session?.answers[task.id];
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        <p className="text-sm font-semibold text-brand-600">Самопроверка части 2 · {reviewIndex + 1} из {part2Tasks.length}</p>
        <div className="prose-chem mt-3 text-[var(--text)]" dangerouslySetInnerHTML={{ __html: task.statementHtml }} />
        <div className="mt-3">
          <p className="text-xs font-semibold text-[var(--text-muted)]">Ваш ответ</p>
          <div className="mt-1 whitespace-pre-wrap rounded-md bg-[var(--bg-muted)] p-3 text-[15px] text-[var(--text)]">
            {typeof answer === 'string' && answer.trim() ? answer : <em className="text-[var(--text-muted)]">Ответ не записан</em>}
          </div>
        </div>

        {!reviewRevealed ? (
          <button type="button" onClick={() => setReviewRevealed(true)} className="tap-target mt-4 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Показать решение и критерии
          </button>
        ) : (
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <p className="text-sm font-semibold text-[var(--text-muted)]">Разбор решения</p>
            <div className="prose-chem mt-1 text-[var(--text)]" dangerouslySetInnerHTML={{ __html: task.solutionHtml }} />
            {task.criteria && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px] text-[var(--text)]">
                {task.criteria.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-sm font-semibold text-[var(--text)]">Сколько баллов вы себе поставите?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from({ length: task.maxScore + 1 }, (_, s) => s).map((s) => (
                <button key={s} type="button" onClick={() => submitReviewScore(s)} className="tap-target rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:border-brand-500">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (stage === 'results' && session?.completed) {
    const { totalScore, maxScore, grade } = session.completed;
    return (
      <div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 text-center">
          <p className="text-sm text-[var(--text-muted)]">Результат пробника «{title}»</p>
          <p className="mt-2 text-4xl font-extrabold text-[var(--text)]">{totalScore} / {maxScore}</p>
          <p className="mt-1 text-lg text-brand-600">Оценка «{grade}»</p>
        </div>
        <a href="/probniki/" className="tap-target mt-5 inline-flex items-center rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] hover:border-brand-400">
          К списку вариантов
        </a>
        <a href="/moy-progress/" className="tap-target mt-5 ml-3 inline-flex items-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Мой прогресс
        </a>
      </div>
    );
  }

  return null;
}
