import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const optionSchema = z.object({
  id: z.string(), // "A" | "Б" | "1" ...
  text: z.string(), // markdown/mhchem допускается
});

const answerTypeSchema = z.enum(['single', 'multiple', 'matching', 'numeric', 'sequence', 'extended']);

const taskSchema = z.object({
  id: z.string().regex(/^\d{2}-\d{3}$/, 'Формат id: "08-014" (номер задания-порядковый номер)'),
  examNumber: z.number().int().min(1).max(23),
  topicId: z.string(),
  difficulty: z.enum(['base', 'advanced', 'high']),
  answerType: answerTypeSchema,
  statement: z.string(),
  options: z.array(optionSchema).optional(),
  // Для answerType "matching": элементы левого/правого столбцов.
  matchingLeft: z.array(optionSchema).optional(),
  matchingRight: z.array(optionSchema).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string()), z.number()]),
  tolerance: z.number().optional(),
  maxScore: z.number().int().min(1).max(5),
  solution: z.string(),
  hint: z.string().optional(),
  criteria: z.array(z.string()).optional(),
  theoryRefs: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  source: z.string().optional(),
});

const theorySchema = z.object({
  title: z.string(),
  description: z.string().min(50).max(170),
  topicId: z.string(),
  order: z.number().int(),
  relatedTasks: z.array(z.number().int().min(1).max(23)).default([]),
  updatedAt: z.coerce.date(),
  readingTime: z.number().int().positive(),
});

const tasks = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/tasks' }),
  schema: taskSchema,
});

const theory = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/theory' }),
  schema: theorySchema,
});

const zadaniyaGuideSchema = z.object({
  examNumber: z.number().int().min(1).max(23),
  title: z.string().max(60),
  description: z.string().min(50).max(170),
  updatedAt: z.coerce.date(),
  exampleTaskIds: z.array(z.string()).default([]),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
});

const zadaniya = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/zadaniya' }),
  schema: zadaniyaGuideSchema,
});

const mockVariantSchema = z.object({
  title: z.string(),
  taskIds: z.array(z.string()).length(23, 'Полный вариант должен содержать ровно 23 задания (по одному на каждый номер ОГЭ)'),
});

const mocks = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/mocks' }),
  schema: mockVariantSchema,
});

export const collections = { tasks, theory, zadaniya, mocks };
export type MockVariantEntry = z.infer<typeof mockVariantSchema>;
export type TaskEntry = z.infer<typeof taskSchema>;
export type TheoryEntry = z.infer<typeof theorySchema>;
export type ZadaniyaGuideEntry = z.infer<typeof zadaniyaGuideSchema>;
