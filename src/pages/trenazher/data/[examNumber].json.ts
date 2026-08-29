import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderChemMarkdown } from '@/lib/markdown';
import type { FullTask, OptionHtml } from '@/lib/trainer-types';
import { EXAM_CONFIG } from '@/config/exam';

export const getStaticPaths: GetStaticPaths = () =>
  Array.from({ length: EXAM_CONFIG.totalTasks }, (_, i) => ({ params: { examNumber: String(i + 1) } }));

async function renderOptions(options?: { id: string; text: string }[]): Promise<OptionHtml[] | undefined> {
  if (!options) return undefined;
  return Promise.all(options.map(async (o) => ({ id: o.id, textHtml: await renderChemMarkdown(o.text) })));
}

export const GET: APIRoute = async ({ params }) => {
  const n = Number(params.examNumber);
  const all = await getCollection('tasks');
  const tasks = all.filter((t) => t.data.examNumber === n);

  const payload: FullTask[] = await Promise.all(
    tasks.map(async (t): Promise<FullTask> => ({
      id: t.data.id,
      examNumber: t.data.examNumber,
      topicId: t.data.topicId,
      difficulty: t.data.difficulty,
      answerType: t.data.answerType,
      statementHtml: await renderChemMarkdown(t.data.statement),
      options: await renderOptions(t.data.options),
      matchingLeft: await renderOptions(t.data.matchingLeft),
      matchingRight: await renderOptions(t.data.matchingRight),
      correctAnswer: t.data.correctAnswer,
      tolerance: t.data.tolerance,
      maxScore: t.data.maxScore,
      solutionHtml: await renderChemMarkdown(t.data.solution),
      hintHtml: t.data.hint ? await renderChemMarkdown(t.data.hint) : undefined,
      criteria: t.data.criteria,
      theoryRefs: t.data.theoryRefs,
    })),
  );

  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
