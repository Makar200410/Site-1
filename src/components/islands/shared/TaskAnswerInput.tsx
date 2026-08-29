import { useEffect, useState } from 'react';
import type { FullTask, UserAnswer } from '@/lib/trainer-types';

interface Props {
  task: FullTask;
  value: UserAnswer;
  onChange: (v: UserAnswer) => void;
  disabled?: boolean;
}

export default function TaskAnswerInput({ task, value, onChange, disabled }: Props) {
  switch (task.answerType) {
    case 'single':
      return <SingleChoice task={task} value={value as string | null} onChange={onChange} disabled={disabled} />;
    case 'multiple':
      return <MultipleChoice task={task} value={(value as string[]) ?? []} onChange={onChange} disabled={disabled} />;
    case 'matching':
      return <Matching task={task} value={(value as string[]) ?? []} onChange={onChange} disabled={disabled} />;
    case 'numeric':
      return <Numeric value={value as number | null} onChange={onChange} disabled={disabled} />;
    case 'sequence':
      return <Sequence task={task} value={value as string[] | null} onChange={onChange} disabled={disabled} />;
    case 'extended':
      return <Extended value={(value as string) ?? ''} onChange={onChange} disabled={disabled} />;
  }
}

function SingleChoice({ task, value, onChange, disabled }: { task: FullTask; value: string | null; onChange: (v: UserAnswer) => void; disabled?: boolean }) {
  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Варианты ответа</legend>
      {task.options?.map((opt) => (
        <label
          key={opt.id}
          className={`tap-target flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-[15px] ${
            value === opt.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40' : 'border-[var(--border)]'
          } ${disabled ? 'opacity-70' : 'hover:border-brand-400'}`}
        >
          <input
            type="radio"
            name="single-answer"
            className="mt-1 h-4 w-4 shrink-0"
            checked={value === opt.id}
            disabled={disabled}
            onChange={() => onChange(opt.id)}
          />
          <span className="flex gap-1.5">
            <span className="font-semibold">{opt.id})</span>
            <span dangerouslySetInnerHTML={{ __html: opt.textHtml }} />
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function MultipleChoice({ task, value, onChange, disabled }: { task: FullTask; value: string[]; onChange: (v: UserAnswer) => void; disabled?: boolean }) {
  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-xs text-[var(--text-muted)]">Выберите все подходящие варианты</legend>
      {task.options?.map((opt) => (
        <label
          key={opt.id}
          className={`tap-target flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-[15px] ${
            value.includes(opt.id) ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40' : 'border-[var(--border)]'
          } ${disabled ? 'opacity-70' : 'hover:border-brand-400'}`}
        >
          <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={value.includes(opt.id)} disabled={disabled} onChange={() => toggle(opt.id)} />
          <span className="flex gap-1.5">
            <span className="font-semibold">{opt.id})</span>
            <span dangerouslySetInnerHTML={{ __html: opt.textHtml }} />
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function Matching({ task, value, onChange, disabled }: { task: FullTask; value: string[]; onChange: (v: UserAnswer) => void; disabled?: boolean }) {
  const pairs = new Map(value.map((p) => p.split('-') as [string, string]));
  function setPair(leftId: string, rightId: string) {
    const next = new Map(pairs);
    if (rightId) next.set(leftId, rightId);
    else next.delete(leftId);
    onChange([...next.entries()].map(([l, r]) => `${l}-${r}`));
  }
  return (
    <div className="space-y-3">
      {task.matchingLeft?.map((left) => (
        <div key={left.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] p-3">
          <span className="flex min-w-[2ch] items-center gap-1.5 text-[15px] font-semibold">{left.id})</span>
          <span className="flex-1 text-[15px]" dangerouslySetInnerHTML={{ __html: left.textHtml }} />
          <select
            value={pairs.get(left.id) ?? ''}
            disabled={disabled}
            onChange={(e) => setPair(left.id, e.target.value)}
            className="tap-target rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-sm"
          >
            <option value="">—</option>
            {task.matchingRight?.map((right) => (
              <option key={right.id} value={right.id}>
                {right.id}
              </option>
            ))}
          </select>
        </div>
      ))}
      <ul className="space-y-1 text-sm text-[var(--text-muted)]">
        {task.matchingRight?.map((right) => (
          <li key={right.id}>
            <span className="font-semibold">{right.id})</span> <span dangerouslySetInnerHTML={{ __html: right.textHtml }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Numeric({ value, onChange, disabled }: { value: number | null; onChange: (v: UserAnswer) => void; disabled?: boolean }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step="any"
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      placeholder="Введите число"
      className="tap-target w-full max-w-xs rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--text)]"
    />
  );
}

function Sequence({ task, value, onChange, disabled }: { task: FullTask; value: string[] | null; onChange: (v: UserAnswer) => void; disabled?: boolean }) {
  const [order, setOrder] = useState<string[]>(value ?? task.options?.map((o) => o.id) ?? []);

  useEffect(() => {
    onChange(order);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function move(index: number, dir: -1 | 1) {
    const next = [...order];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    onChange(next);
  }

  const byId = new Map(task.options?.map((o) => [o.id, o]));
  return (
    <ol className="space-y-2">
      {order.map((id, i) => (
        <li key={id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg-muted)] text-sm font-bold">{i + 1}</span>
          <span className="flex-1 text-[15px]" dangerouslySetInnerHTML={{ __html: byId.get(id)?.textHtml ?? '' }} />
          <div className="flex shrink-0 gap-1">
            <button type="button" disabled={disabled || i === 0} onClick={() => move(i, -1)} aria-label="Вверх" className="tap-target rounded border border-[var(--border)] px-2 disabled:opacity-30">
              ↑
            </button>
            <button type="button" disabled={disabled || i === order.length - 1} onClick={() => move(i, 1)} aria-label="Вниз" className="tap-target rounded border border-[var(--border)] px-2 disabled:opacity-30">
              ↓
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Extended({ value, onChange, disabled }: { value: string; onChange: (v: UserAnswer) => void; disabled?: boolean }) {
  return (
    <textarea
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      rows={6}
      placeholder="Запишите развёрнутое решение…"
      className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-[15px] text-[var(--text)]"
    />
  );
}
