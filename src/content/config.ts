import { defineCollection, z } from 'astro:content';

const weeknotes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    weekNumber: z.number(),
    year: z.number(),
    summary: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    summary: z.string(),
    externalUrl: z.string().optional(), // For posts published elsewhere
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  weeknotes,
  blog,
};
