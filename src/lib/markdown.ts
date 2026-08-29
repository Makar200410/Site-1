import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex, { type Options as RehypeKatexOptions } from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import 'katex/contrib/mhchem/mhchem.js';

// throwOnError не настраивается: rehype-katex сам перехватывает ошибки формул
// и рендерит их как видимый `.katex-error`, вместо падения сборки.
const katexOptions: RehypeKatexOptions = { strict: false, output: 'htmlAndMathml' };

/**
 * Рендерит markdown-строку (с поддержкой $...$ / mhchem) в статический HTML
 * на этапе сборки. Используется для полей заданий (JSON-коллекция), которые
 * не проходят через встроенный MDX-конвейер Astro.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeKatex, katexOptions)
  .use(rehypeStringify);

const cache = new Map<string, string>();

export async function renderChemMarkdown(source: string): Promise<string> {
  if (!source) return '';
  const cached = cache.get(source);
  if (cached) return cached;
  const file = await processor.process(source);
  const html = String(file);
  cache.set(source, html);
  return html;
}
