import { useEffect, useState } from 'react';
import PeriodicTable from './PeriodicTable';
import SolubilityTable from './SolubilityTable';
import ActivitySeries from './ActivitySeries';

type Tab = 'periodic' | 'solubility' | 'activity';

const TABS: { id: Tab; label: string }[] = [
  { id: 'periodic', label: 'Таблица Менделеева' },
  { id: 'solubility', label: 'Растворимость' },
  { id: 'activity', label: 'Ряд активности' },
];

export default function ReferencePanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('periodic');

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="tap-target inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:border-brand-400"
      >
        <span aria-hidden="true">📋</span> Справочник
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Справочные таблицы"
            className="flex h-full w-full max-w-xl flex-col bg-[var(--bg-elevated)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
              <p className="font-bold text-[var(--text)]">Справочные таблицы</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
                className="tap-target flex items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)] p-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`tap-target shrink-0 rounded-md px-3 py-2 text-sm font-medium ${
                    tab === t.id ? 'bg-brand-600 text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-4">
              {tab === 'periodic' && <PeriodicTable compact />}
              {tab === 'solubility' && <SolubilityTable compact />}
              {tab === 'activity' && <ActivitySeries compact />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
