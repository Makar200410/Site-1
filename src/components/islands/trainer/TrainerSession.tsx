import { useEffect, useMemo, useState } from 'react';
import type { FullTask, UserAnswer, AnsweredRecord, SessionConfig } from '@/lib/trainer-types';
import { SESSION_STORAGE_KEY, checkAnswer } from '@/lib/trainer-types';
import { fetchTasksByIds } from '@/lib/fetch-tasks';
import { recordTaskAttempt } from '@/lib/progress';
import { DIFFICULTY_LABELS, getCodifierTopic } from '@/config/exam';
import TaskAnswerInput from '@/components/islands/shared/TaskAnswerInput';
import ReferencePanel from '@/components/islands/reference/ReferencePanel';

type Stage = 'loading' | 'not-found' | 'running' | 'summary';

export default function TrainerSession() {
  const [stage, setStage] = useState<Stage>('loading');
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [tasksById, setTasksById] = useState<Map<string, FullTask>>(new Map());
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnsweredRecord>>({});
  const [draft, setDraft] = useState<UserAnswer>(null);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      setStage('not-found');
      return;
    }
    const parsed: SessionConfig = JSON.parse(raw);
    setConfig(parsed);
    fetchTasksByIds(parsed.queue)
      .then((map) => {
        setTasksById(map);
        setStage('running');
      })
      .catch(() => setStage('not-found'));
  }, []);

  const queue = config?.queue ?? [];
  const currentItem = queue[index];
  const task = currentItem ? tasksById.get(currentItem.id) : undefined;

  useEffect(() => {
    setDraft(null);
    setChecked(false);
    setShowHint(false);
  }, [index]);

  function submitCheck() {
    if (!task) return;
    const correct = checkAnswer(task, draft);
    const record: AnsweredRecord = {
      taskId: task.id,
      examNumber: task.examNumber,
      topicId: task.topicId,
      answer: draft,
      correct,
      score: correct ? task.maxScore : 0,
      maxScore: task.maxScore,
      revealed: true,
    };
    setAnswers((prev) => ({ ...prev, [task.id]: record }));
    recordTaskAttempt(task.id, correct);
    setChecked(true);
  }

  function revealExtended() {
    setChecked(true);
  }

  function selfScore(score: number) {
    if (!task) return;
    const correct = score === task.maxScore;
    const record: AnsweredRecord = {
      taskId: task.id,
      examNumber: task.examNumber,
      topicId: task.topicId,
      answer: draft,
      correct,
      score,
      maxScore: task.maxScore,
      revealed: true,
    };
    setAnswers((prev) => ({ ...prev, [task.id]: record }));
    recordTaskAttempt(task.id, correct);
  }

  function next() {
    if (index + 1 >= queue.length) {
      setStage('summary');
    } else {
      setIndex((i) => i + 1);
    }
  }

  function finishNow() {
    setStage('summary');
  }

  function retryErrors() {
    const wrongIds = Object.values(answers)
      .filter((a) => !a.correct)
      .map((a) => ({ id: a.taskId, examNumber: a.examNumber }));
    if (wrongIds.length === 0) return;
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ queue: wrongIds, startedAt: new Date().toISOString(), label: 'Работа над ошибками' }),
    );
    window.location.reload();
  }

  const summary = useMemo(() => {
    const list = Object.values(answers);
    const totalScore = list.reduce((s, a) => s + a.score, 0);
    const maxScore = list.reduce((s, a) => s + a.maxScore, 0);
    const correctCount = list.filter((a) => a.correct).length;
    const byExam = new Map<number, { correct: number; total: number }>();
    for (const a of list) {
      const agg = byExam.get(a.examNumber) ?? { correct: 0, total: 0 };
      agg.total += 1;
      if (a.correct) agg.correct += 1;
      byExam.set(a.examNumber, agg);
    }
    const wrong = list.filter((a) => !a.correct);
    return { list, totalScore, maxScore, correctCount, byExam, wrong };
  }, [answers]);

  if (stage === 'loading') {
    return <p className="text-[var(--text-muted)]">Загружаем задания…</p>;
  }

  if (stage === 'not-found') {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 text-center">
        <p className="text-[var(--text)]">Сессия тренажёра не найдена или устарела.</p>
        <a href="/trenazher/" className="tap-target mt-4 inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          Настроить тренировку
        </a>
      </div>
    );
  }

  if (stage === 'summary') {
    const elapsedMin = Math.round((Date.now() - startedAt) / 60000);
    return (
      <div>
        <h2 className="text-2xl font-extrabold text-[var(--text)]">Итоги тренировки</h2>
        <p className="mt-1 text-[var(--text-muted)]">{config?.label}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Верно" value={`${summary.correctCount} / ${summary.list.length}`} />
          <Stat label="Баллы" value={`${summary.totalScore} / ${summary.maxScore}`} />
          <Stat label="Время" value={`${elapsedMin} мин`} />
          <Stat label="Ошибок" value={String(summary.wrong.length)} />
        </div>

        {summary.byExam.size > 0 && (
          <div className="mt-6">
            <p className="font-semibold text-[var(--text)]">По заданиям</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {[...summary.byExam.entries()].map(([n, agg]) => (
                <li key={n} className={`rounded-full border px-3 py-1 text-sm ${agg.correct === agg.total ? 'border-brand-400 text-brand-700 dark:text-brand-300' : 'border-danger-500/40 text-danger-600'}`}>
                  № {n}: {agg.correct}/{agg.total}
                </li>
              ))}
            </ul>
          </div>
        )}

        {summary.wrong.length > 0 && (
          <div className="mt-6">
            <p className="font-semibold text-[var(--text)]">Задания с ошибками</p>
            <ul className="mt-2 space-y-2">
              {summary.wrong.map((a) => (
                <li key={a.taskId} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3 text-sm">
                  <span>Задание {a.examNumber} ({a.taskId})</span>
                  <a href={`/zadaniya/${a.examNumber}/`} className="tap-target font-medium text-brand-600 hover:underline">
                    К теории →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {summary.wrong.length > 0 && (
            <button type="button" onClick={retryErrors} className="tap-target rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
              Проработать ошибки ещё раз
            </button>
          )}
          <a href="/trenazher/" className="tap-target rounded-lg border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:border-brand-400">
            Новая тренировка
          </a>
        </div>
      </div>
    );
  }

  if (!task) return <p className="text-[var(--text-muted)]">Загрузка задания…</p>;

  const answeredRecord = answers[task.id];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-[var(--text-muted)]">
          Задание {index + 1} из {queue.length}
        </p>
        <div className="flex gap-2">
          <ReferencePanel />
          <button type="button" onClick={finishNow} className="tap-target rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:border-danger-500 hover:text-danger-600">
            Завершить
          </button>
        </div>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={queue.length}>
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${((index + 1) / queue.length) * 100}%` }} />
      </div>

      <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Задание {task.examNumber} ОГЭ · {DIFFICULTY_LABELS[task.difficulty]}</span>
          <span>{task.maxScore} {task.maxScore === 1 ? 'балл' : 'балла'}</span>
        </div>

        <div className="prose-chem mt-3 text-[var(--text)]" dangerouslySetInnerHTML={{ __html: task.statementHtml }} />

        {task.answerType === 'extended' && (
          <p className="mt-3 rounded-md border-l-4 border-accent-500/50 bg-accent-500/10 p-3 text-sm text-[var(--text)]">
            Развёрнутый ответ проверяется самостоятельно: сверьте свой ответ с решением и критериями и честно выставьте себе балл.
          </p>
        )}

        <div className="mt-4">
          <TaskAnswerInput task={task} value={draft} onChange={setDraft} disabled={checked && task.answerType !== 'extended'} />
        </div>

        {!checked && task.hintHtml && (
          <button type="button" onClick={() => setShowHint((s) => !s)} className="tap-target mt-3 text-sm font-medium text-brand-600 hover:underline">
            {showHint ? 'Скрыть подсказку' : 'Показать подсказку'}
          </button>
        )}
        {showHint && task.hintHtml && (
          <div className="prose-chem mt-2 rounded-md bg-[var(--bg-muted)] p-3 text-sm" dangerouslySetInnerHTML={{ __html: task.hintHtml }} />
        )}

        {!checked && task.answerType !== 'extended' && (
          <button
            type="button"
            onClick={submitCheck}
            disabled={draft === null || (Array.isArray(draft) && draft.length === 0)}
            className="tap-target mt-4 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        )}
        {!checked && task.answerType === 'extended' && (
          <button type="button" onClick={revealExtended} className="tap-target mt-4 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">
            Показать решение и критерии
          </button>
        )}

        {checked && (
          <div className="mt-5 border-t border-[var(--border)] pt-4">
            {task.answerType !== 'extended' && (
              <p className={`font-bold ${answeredRecord?.correct ? 'text-brand-600' : 'text-danger-600'}`}>
                {answeredRecord?.correct ? '✓ Верно' : '✕ Неверно'}
              </p>
            )}
            <p className="mt-3 text-sm font-semibold text-[var(--text-muted)]">Разбор решения</p>
            <div className="prose-chem mt-1 text-[var(--text)]" dangerouslySetInnerHTML={{ __html: task.solutionHtml }} />

            {task.criteria && task.criteria.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-[var(--text-muted)]">Критерии оценивания</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[15px] text-[var(--text)]">
                  {task.criteria.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {task.answerType === 'extended' && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-[var(--text)]">Сколько баллов вы себе поставите?</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.from({ length: task.maxScore + 1 }, (_, s) => s).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => selfScore(s)}
                      className={`tap-target rounded-md border px-4 py-2 text-sm font-medium ${
                        answeredRecord?.score === s ? 'border-brand-600 bg-brand-600 text-white' : 'border-[var(--border)] text-[var(--text)] hover:border-brand-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {task.theoryRefs.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {task.theoryRefs.map((ref) => {
                  const topic = getCodifierTopic(ref.split('/')[0]);
                  return (
                    <a key={ref} href={`/teoriya/${ref}/`} className="tap-target inline-flex items-center rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text)] hover:border-brand-400">
                      {topic ? topic.title : 'Теория'} →
                    </a>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={next}
              disabled={task.answerType === 'extended' && !answeredRecord}
              className="tap-target mt-5 flex w-full items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              {index + 1 >= queue.length ? 'Завершить тренировку' : 'Следующее задание'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3 text-center">
      <p className="text-xl font-extrabold text-[var(--text)]">{value}</p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
