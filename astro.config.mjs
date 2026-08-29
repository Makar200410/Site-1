// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { unified as astroMarkdownProcessor } from '@astrojs/markdown-remark';

// Регистрирует расширение mhchem (\ce{...}, \pu{...}) в общем экземпляре KaTeX
// до того, как rehype-katex начнёт рендерить формулы на этапе сборки.
import 'katex/contrib/mhchem/mhchem.js';

const SITE_URL = 'https://oge-himia.ru';

// Служебные разделы, закрытые от индексации (см. src/lib/seo.ts -> isNoindexPath).
const NOINDEX_PATTERNS = [/\/trenazher\/sessiya\//, /\/probniki\/[^/]+\//, /\/moy-progress\//, /\/poisk\//];

/** @param {string} url */
function isNoindexUrl(url) {
  return NOINDEX_PATTERNS.some((re) => re.test(url));
}

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  // Prefetch намеренно выключен (по умолчанию): даже небольшой раннер
  // добавляет JS на страницы теории, а цель — 0 КБ JS там (см. ТЗ п. 8.6).
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !isNoindexUrl(page),
    }),
  ],
  markdown: {
    processor: astroMarkdownProcessor({
      remarkPlugins: [remarkMath, remarkGfm],
      // throwOnError не настраивается: rehype-katex сам перехватывает ошибки формул
      // и рендерит их как видимый `.katex-error`, вместо падения сборки.
      rehypePlugins: [[rehypeKatex, { strict: false, output: 'htmlAndMathml' }]],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
