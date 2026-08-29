import { useEffect, useMemo, useState } from 'react';
import type { Difficulty, TaskIndexEntry } from '@/lib/trainer-types';
import { SESSION_STORAGE_KEY } from '@/lib/trainer-types';
import { loadProgress } from '@/lib/progress';

interface ExamTaskOption {
  number: number;
  title: string;
}
interface TopicOption {
  id: string;
  title: string;
}

interface Props {
  taskIndex: TaskIndexEntry[];
  examTasks: ExamTaskOption[];
  topics: TopicOption[];
}

type Mode = 'all' | 'errors' | 'unsolved';
type CountOption = 5 | 10 | 20 | 0; // 0 = все

const DIFFICULTY_OPTIONS: { value: Difficulty | ''; label: string }[] = [
  { value: '', label: 'Любой' },
  { value: 'base', label: 'Базовый' },
  { value: 'advanced', label: 'Повышенный' },
  { value: 'high', label: 'Высокий' },
];

export default function TrainerSetup({ taskIndex, examTasks, topics }: Props) {
  const [examNumber, setExamNumber] = useState<number | ''>('');
  const [topicId, setTopicId] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [mode, setMode] = useState<Mode>('all');
  const [count, setCount] = useState<CountOption>(10);
  const [error, setError] = useState<string | null>(null);

  // Сайт статический: серверных query-параметров не существует, поэтому
  // предзаполнение (ссылки вида /trenazher/?examNumber=8 со страниц теории
  // и заданий) читаем из фактического URL браузера на клиенте.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const n = params.get('examNumber');
    const topic = params.get('topic');
    if (n && !Number.isNaN(Number(n))) setExamNumber(Number(n));
    if (topic) setTopicId(topic);
  }, []);

  const candidates = useMemo(() => {
    let list = taskIndex;
    if (examNumber !== '') list = list.filter((t) => t.examNumber === examNumber);
    if (topicId) list = list.filter((t) => t.topicId === topicId);
    if (difficulty) list = list.filter((t) => t.difficulty === difficulty);

    if (mode !== 'all') {
      const progress = loadProgress();
      list = list.filter((t) => {
        const record = progress.tasks[t.id];
        if (mode === 'unsolved') return !record;
        if (mode === 'errors') return record && record.correct < record.attempts;
        return true;
      });
    }
    return list;
  }, [taskIndex, examNumber, topicId, difficulty, mode]);

  function start() {
    if (candidates.length === 0) {
      setError('По выбранным условиям заданий не найдено. Попробуйте изменить фильтры.');
      return;
    }
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const limited = count === 0 ? shuffled : shuffled.slice(0, count);
    const queue = limited.map((t) => ({ id: t.id, examNumber: t.examNumber }));
    const labelParts: string[] = [];
    if (examNumber !== '') labelParts.push(`задание ${examNumber}`);
    if (topicId) labelParts.push(topics.find((t) => t.id === topicId)?.title ?? topicId);
    if (mode === 'errors') labelParts.push('только ошибки');
    if (mode === 'unsolved') labelParts.push('нерешённые');

    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ queue, startedAt: new Date().toISOString(), label: labelParts.join(', ') || 'Тренировка' }),
    );
    window.location.href = '/trenazher/sessiya/';
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-[var(--text)]">Номер задания ОГЭ</span>
          <select
            value={examNumber}
            onChange={(e) => setExamNumber(e.target.value ? Number(e.target.value) : '')}
            className="tap-target mt-1.5 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]"
          >
            <option value="">Любой (1–24)</option>
            {examTasks.map((t) => (
              <option key={t.number} value={t.number}>
                № {t.number} — {t.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[var(--text)]">Тема кодификатора</span>
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="tap-target mt-1.5 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]"
          >
            <option value="">Любая</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[var(--text)]">Уровень сложности</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty | '')}
            className="tap-target mt-1.5 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]"
          >
            {DIFFICULTY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[var(--text)]">Режим</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="tap-target mt-1.5 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]"
          >
            <option value="all">Все задания</option>
            <option value="errors">Только ошибки</option>
            <option value="unsolved">Не решённые ранее</option>
          </select>
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-[var(--text)]">Количество заданий</legend>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {([5, 10, 20, 0] as CountOption[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCount(c)}
              className={`tap-target rounded-md border px-4 py-2 text-sm font-medium ${
                count === c
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-[var(--border)] text-[var(--text)] hover:border-brand-400'
              }`}
            >
              {c === 0 ? 'Все' : c}
            </button>
          ))}
        </div>
      </fieldset>

      <p className="mt-4 text-sm text-[var(--text-muted)]">
        Найдено заданий: <span className="font-semibold text-[var(--text)]">{candidates.length}</span>
      </p>
      {error && <p className="mt-2 text-sm font-medium text-danger-600">{error}</p>}

      <button
        type="button"
        onClick={start}
        className="tap-target mt-5 flex w-full items-center justify-center rounded-lg bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-brand-700 sm:w-auto"
      >
        Начать тренировку
      </button>
    </div>
  );
}
