import { useState } from 'react';
import { ANIONS, CATIONS, SOLUBILITY_TABLE, SOLUBILITY_LABELS, type Solubility } from '@/data/solubility';

const CELL_STYLES: Record<Solubility, string> = {
  P: 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-100',
  M: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-100',
  H: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-100',
  '-': 'bg-[var(--bg-muted)] text-[var(--text-muted)]',
};

interface Props {
  compact?: boolean;
}

export default function SolubilityTable({ compact = false }: Props) {
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="border-collapse text-center text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[var(--bg-elevated)] p-2 text-left text-[var(--text-muted)]" />
              {ANIONS.map((a, col) => (
                <th
                  key={a}
                  className={`p-2 font-semibold text-[var(--text)] ${hover?.col === col ? 'bg-brand-50 dark:bg-brand-950/50' : ''}`}
                >
                  {a}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATIONS.map((c, row) => (
              <tr key={c}>
                <th
                  className={`sticky left-0 z-10 bg-[var(--bg-elevated)] p-2 text-left font-semibold text-[var(--text)] ${hover?.row === row ? 'bg-brand-50 dark:bg-brand-950/50' : ''}`}
                >
                  {c}
                </th>
                {ANIONS.map((_, col) => {
                  const value = SOLUBILITY_TABLE[row][col];
                  const isHovered = hover?.row === row || hover?.col === col;
                  return (
                    <td
                      key={col}
                      onMouseEnter={() => setHover({ row, col })}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => setHover({ row, col })}
                      className={`h-9 w-9 cursor-default font-bold ${CELL_STYLES[value]} ${isHovered ? 'ring-2 ring-inset ring-brand-500' : ''}`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!compact && (
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[var(--text-muted)]">
          {(Object.entries(SOLUBILITY_LABELS) as [Solubility, string][]).map(([key, label]) => (
            <li key={key} className="flex items-center gap-1.5">
              <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${CELL_STYLES[key]}`}>{key}</span>
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
