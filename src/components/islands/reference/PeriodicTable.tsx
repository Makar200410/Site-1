import { useId, useState } from 'react';
import { ELEMENTS, CATEGORY_LABELS, CATEGORY_COLORS, type ChemElement } from '@/data/elements';

interface Props {
  compact?: boolean;
}

export default function PeriodicTable({ compact = false }: Props) {
  const [selected, setSelected] = useState<ChemElement | null>(null);
  const titleId = useId();

  const mainRows = [1, 2, 3, 4, 5, 6, 7];
  const cellSize = compact ? 'h-9 w-9 text-[9px]' : 'h-11 w-11 text-[10px] sm:h-14 sm:w-14 sm:text-xs';
  // Фиксированная ширина колонок (а не minmax(0,1fr)) — иначе grid сжимает
  // ячейки до нечитаемого размера вместо горизонтальной прокрутки на узком экране.
  const colPx = compact ? 38 : 46;

  function cellFor(period: number, group: number) {
    const el = ELEMENTS.find((e) => e.period === period && e.group === group && !e.fBlockIndex);
    if (!el) return <div key={`${period}-${group}`} style={{ width: colPx, height: colPx }} />;
    return <ElementCell key={el.number} el={el} size={cellSize} onSelect={setSelected} />;
  }

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(18, ${colPx}px)` }}>
          {mainRows.flatMap((period) =>
            Array.from({ length: 18 }, (_, i) => i + 1).map((group) => cellFor(period, group)),
          )}
        </div>
        <div className="mt-3 inline-grid gap-1" style={{ gridTemplateColumns: `repeat(15, ${colPx}px)` }}>
          {ELEMENTS.filter((e) => e.category === 'lanthanide')
            .sort((a, b) => (a.fBlockIndex ?? 0) - (b.fBlockIndex ?? 0))
            .map((el) => (
              <ElementCell key={el.number} el={el} size={cellSize} onSelect={setSelected} />
            ))}
        </div>
        <div className="mt-1 inline-grid gap-1" style={{ gridTemplateColumns: `repeat(15, ${colPx}px)` }}>
          {ELEMENTS.filter((e) => e.category === 'actinide')
            .sort((a, b) => (a.fBlockIndex ?? 0) - (b.fBlockIndex ?? 0))
            .map((el) => (
              <ElementCell key={el.number} el={el} size={cellSize} onSelect={setSelected} />
            ))}
        </div>
      </div>

      {!compact && (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[var(--text-muted)]">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <li key={key} className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] }} />
              {label}
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-sm rounded-t-xl bg-[var(--bg-elevated)] p-5 shadow-xl sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p id={titleId} className="text-2xl font-extrabold text-[var(--text)]">{selected.symbol}</p>
                <p className="text-base text-[var(--text)]">{selected.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Закрыть"
                className="tap-target flex items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
              >
                ✕
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[var(--text-muted)]">Номер</dt>
                <dd className="font-medium text-[var(--text)]">{selected.number}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Атомная масса</dt>
                <dd className="font-medium text-[var(--text)]">{selected.mass}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Период</dt>
                <dd className="font-medium text-[var(--text)]">{selected.period}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Группа</dt>
                <dd className="font-medium text-[var(--text)]">{selected.group || '—'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[var(--text-muted)]">Категория</dt>
                <dd className="font-medium text-[var(--text)]">{CATEGORY_LABELS[selected.category]}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

function ElementCell({ el, size, onSelect }: { el: ChemElement; size: string; onSelect: (el: ChemElement) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(el)}
      className={`tap-target flex ${size} flex-col items-center justify-center rounded border border-black/10 font-semibold text-black/80 transition-transform hover:z-10 hover:scale-110 hover:shadow-md`}
      style={{ background: CATEGORY_COLORS[el.category] }}
      aria-label={`${el.name}, элемент №${el.number}`}
    >
      <span className="leading-none opacity-70">{el.number}</span>
      <span className="leading-none">{el.symbol}</span>
    </button>
  );
}
