import { ACTIVITY_SERIES } from '@/data/activity-series';

interface Props {
  compact?: boolean;
}

export default function ActivitySeries({ compact = false }: Props) {
  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-1 whitespace-nowrap">
          {ACTIVITY_SERIES.map((m, i) => (
            <div key={m.symbol} className="flex items-center gap-1">
              <div
                className={`flex flex-col items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 ${compact ? 'h-11 w-11 text-[10px]' : 'h-14 w-14 text-xs'} ${m.symbol === 'H' ? 'border-2 border-accent-500' : ''}`}
                title={m.name}
              >
                <span className="font-bold text-[var(--text)]">{m.symbol}</span>
                {!compact && <span className="text-[9px] text-[var(--text-muted)]">{m.name}</span>}
              </div>
              {i < ACTIVITY_SERIES.length - 1 && <span aria-hidden="true" className="text-[var(--text-muted)]">→</span>}
            </div>
          ))}
        </div>
      </div>
      {!compact && (
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Металлы левее водорода вытесняют его из кислот-неокислителей; металл вытесняет из соли менее активный металл,
          расположенный правее него в ряду.
        </p>
      )}
    </div>
  );
}
