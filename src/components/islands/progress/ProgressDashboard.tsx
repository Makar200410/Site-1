import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  loadProgress,
  exportProgress,
  importProgress,
  resetProgress,
  getWeakExamNumbers,
  type ProgressState,
} from '@/lib/progress';
import { EXAM_CONFIG } from '@/config/exam';
interface ExamMeta {
  number: number;
  title: string;
}

interface Props {
  examTasksMeta: ExamMeta[];
  taskIdToExamNumber: Record<string, number>;
}

export default function ProgressDashboard({ examTasksMeta, taskIdToExamNumber }: Props) {
  const [state, setState] = useState<ProgressState | null>(null);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState(loadProgress());
  }, []);

  if (!state) return <p className="text-[var(--text-muted)]">Загрузка…</p>;

  const byExam = new Map<number, { attempts: number; correct: number }>();
  for (const [taskId, tp] of Object.entries(state.tasks)) {
    const num = taskIdToExamNumber[taskId];
    if (num === undefined) continue;
    const agg = byExam.get(num) ?? { attempts: 0, correct: 0 };
    agg.attempts += tp.attempts;
    agg.correct += tp.correct;
    byExam.set(num, agg);
  }
  const solvedNumbers = [...byExam.keys()].filter((n) => (byExam.get(n)?.correct ?? 0) > 0).length;
  const weak = getWeakExamNumbers(state, taskIdToExamNumber);
  const theoryReadCount = Object.keys(state.theory).length;

  const hasAnyData = Object.keys(state.tasks).length > 0 || state.mocks.length > 0 || theoryReadCount > 0;

  async function onImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importProgress(file);
    if (result.ok) {
      setImportMsg({ ok: true, text: 'Прогресс успешно импортирован.' });
      setState(loadProgress());
    } else {
      setImportMsg({ ok: false, text: result.error });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function doReset() {
    resetProgress();
    setState(loadProgress());
    setConfirmReset(false);
  }

  return (
    <div>
      <div className="rounded-lg border-l-4 border-accent-500/60 bg-accent-500/10 p-4 text-sm text-[var(--text)]">
        Прогресс хранится только в этом браузере (localStorage) и пропадёт при очистке данных сайта или смене
        устройства. Экспортируйте его в файл, чтобы не потерять.
      </div>

      {!hasAnyData ? (
        <p className="mt-6 text-[var(--text-muted)]">
          Пока нет данных — начните с <a href="/trenazher/" className="text-brand-600 hover:underline">тренажёра</a>, и здесь появится статистика.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Заданий решено" value={`${solvedNumbers} / ${EXAM_CONFIG.totalTasks}`} />
            <Stat label="Статей прочитано" value={String(theoryReadCount)} />
            <Stat label="Пробников пройдено" value={String(state.mocks.length)} />
            <Stat label="Серия дней" value={`${state.streak.current} (макс. ${state.streak.longest})`} />
          </div>

          {weak.length > 0 && (
            <div className="mt-8">
              <p className="font-semibold text-[var(--text)]">Слабые темы (точность ниже 60%)</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {weak.map((n) => {
                  const meta = examTasksMeta.find((m) => m.number === n);
                  return (
                    <li key={n}>
                      <a href={`/trenazher/?examNumber=${n}`} className="tap-target inline-flex items-center rounded-full border border-danger-500/40 px-3 py-1.5 text-sm text-danger-600 hover:bg-danger-500/10">
                        № {n}{meta ? `: ${meta.title}` : ''}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <p className="font-semibold text-[var(--text)]">Прогресс по заданиям</p>
            <div className="mt-3 space-y-1.5">
              {examTasksMeta.map((meta) => {
                const agg = byExam.get(meta.number);
                const pct = agg && agg.attempts > 0 ? Math.round((agg.correct / agg.attempts) * 100) : 0;
                return (
                  <div key={meta.number} className="flex items-center gap-3 text-sm">
                    <span className="w-8 shrink-0 font-mono text-[var(--text-muted)]">№{meta.number}</span>
                    <span className="w-40 shrink-0 truncate text-[var(--text)]">{meta.title}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                      <div
                        className={`h-full rounded-full ${pct >= 60 ? 'bg-brand-500' : agg ? 'bg-danger-500' : 'bg-transparent'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-[var(--text-muted)]">{agg ? `${pct}%` : '—'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {state.mocks.length > 0 && (
            <div className="mt-8">
              <p className="font-semibold text-[var(--text)]">История пробников</p>
              <MocksChart mocks={state.mocks} />
              <ul className="mt-3 space-y-2">
                {[...state.mocks].reverse().map((m) => (
                  <li key={m.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3 text-sm">
                    <span>{new Date(m.date).toLocaleDateString('ru-RU')}</span>
                    <span>
                      {m.score} / {m.maxScore} · оценка «{m.grade}»
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="mt-10 border-t border-[var(--border)] pt-6">
        <p className="font-semibold text-[var(--text)]">Управление данными</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" onClick={exportProgress} className="tap-target rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Экспортировать прогресс (.json)
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="tap-target rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] hover:border-brand-400">
            Импортировать из файла
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={onImportFile} />
        </div>
        {importMsg && (
          <p className={`mt-2 text-sm ${importMsg.ok ? 'text-brand-600' : 'text-danger-600'}`}>{importMsg.text}</p>
        )}

        <div className="mt-5">
          {!confirmReset ? (
            <button type="button" onClick={() => setConfirmReset(true)} className="tap-target text-sm font-medium text-danger-600 hover:underline">
              Сбросить весь прогресс
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-[var(--text)]">Все данные будут удалены безвозвратно. Точно сбросить?</p>
              <button type="button" onClick={doReset} className="tap-target rounded-md bg-danger-600 px-4 py-2 text-sm font-semibold text-white">
                Да, сбросить
              </button>
              <button type="button" onClick={() => setConfirmReset(false)} className="tap-target rounded-md border border-[var(--border)] px-4 py-2 text-sm">
                Отмена
              </button>
            </div>
          )}
        </div>
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

function MocksChart({ mocks }: { mocks: ProgressState['mocks'] }) {
  const w = 100;
  const h = 32;
  const points = mocks.map((m, i) => {
    const x = mocks.length === 1 ? w : (i / (mocks.length - 1)) * w;
    const pct = m.maxScore > 0 ? m.score / m.maxScore : 0;
    const y = h - pct * h;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-16 w-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points.join(' ')} fill="none" stroke="#2f9682" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
