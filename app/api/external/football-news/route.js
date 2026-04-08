export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getFootballNewsFeed } from '@/lib/media/news';

/**
 * GET /api/external/football-news
 * Returns football headlines from free public RSS feeds
 */
export async function GET() {
  const feed = await getFootballNewsFeed({ articleLimit: 20, videoLimit: 0 });
  return NextResponse.json({
    articles: feed.articles.map((article) => ({
      title: article.title,
      link: article.url,
      pubDate: article.publishedAt,
      summary: article.summary,
      img: article.image,
      source: article.source,
    })),
    available: feed.articles.length > 0,
  });
}
