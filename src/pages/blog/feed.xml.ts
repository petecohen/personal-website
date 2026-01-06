import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blogPosts = await getCollection('blog', ({ data }) => {
    return data.draft !== true;
  });

  const sortedPosts = blogPosts.sort((a, b) =>
    b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: "Pete Cohen's Blog",
    description: 'Longer-form writing and links to published work',
    site: context.site || 'https://petecohen.com.au',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      link: post.data.externalUrl || `/blog/${post.slug}/`,
      pubDate: post.data.date,
    })),
    customData: '<language>en-us</language>',
  });
}
