import type { FullTask } from './trainer-types';

const cache = new Map<number, Promise<FullTask[]>>();

/** Загружает и кеширует пререндеренные задания по номеру ОГЭ (см. /trenazher/data/[n].json.ts). */
export function fetchTasksByExamNumber(examNumber: number): Promise<FullTask[]> {
  let promise = cache.get(examNumber);
  if (!promise) {
    promise = fetch(`/trenazher/data/${examNumber}.json`).then((r) => {
      if (!r.ok) throw new Error(`Не удалось загрузить задания №${examNumber}`);
      return r.json() as Promise<FullTask[]>;
    });
    cache.set(examNumber, promise);
  }
  return promise;
}

export async function fetchTasksByIds(items: { id: string; examNumber: number }[]): Promise<Map<string, FullTask>> {
  const examNumbers = [...new Set(items.map((i) => i.examNumber))];
  const chunks = await Promise.all(examNumbers.map((n) => fetchTasksByExamNumber(n)));
  const byId = new Map<string, FullTask>();
  for (const chunk of chunks) for (const t of chunk) byId.set(t.id, t);
  return byId;
}
