import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const weeknotes = await getCollection('weeknotes', ({ data }) => {
    return data.draft !== true;
  });

  const sortedWeeknotes = weeknotes.sort((a, b) =>
    b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: "Pete Cohen's Weeknotes",
    description: 'Weekly reflections on work, life, and things I\'m learning',
    site: context.site || 'https://petecohen.com.au',
    items: sortedWeeknotes.map((weeknote) => ({
      title: weeknote.data.title,
      description: weeknote.data.summary || `Weeknote for week ${weeknote.data.weekNumber}, ${weeknote.data.year}`,
      link: `/weeknotes/${weeknote.data.year}/week-${String(weeknote.data.weekNumber).padStart(2, '0')}/`,
      pubDate: weeknote.data.date,
    })),
    customData: '<language>en-us</language>',
  });
}
