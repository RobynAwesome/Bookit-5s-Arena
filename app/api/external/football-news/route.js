export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

// In-memory cache (10 min TTL for news)
let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 10 * 60_000;

// Parse a simple RSS XML item into a news article object
function parseRssItem(item) {
  const get = (tag) => {
    const match = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
    return match ? (match[1] || match[2] || '').trim() : '';
  };
  const getAttr = (tag, attr) => {
    const match = item.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i'));
    return match ? match[1] : '';
  };

  const title = get('title');
  const link = get('link') || getAttr('link', 'href');
  const pubDate = get('pubDate') || get('published') || get('dc:date');
  const desc = get('description') || get('summary') || get('content:encoded');
  // Strip HTML tags from description
  const summary = desc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200);
  // Try to find media image
  const img = getAttr('media:thumbnail', 'url') || getAttr('media:content', 'url') || getAttr('enclosure', 'url') || '';

  return { title, link, pubDate: pubDate ? new Date(pubDate).toISOString() : null, summary, img };
}

// Fetch and parse an RSS feed
async function fetchRss(url, source) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; 5sArena/1.0)' },
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const xml = await res.text();

  // Extract <item> or <entry> blocks
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>|<entry[\s>]([\s\S]*?)<\/entry>/gi;
  const articles = [];
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1] || match[2];
    const parsed = parseRssItem(item);
    if (parsed.title && parsed.link) {
      articles.push({ ...parsed, source });
    }
    if (articles.length >= 6) break;
  }
  return articles;
}

/**
 * GET /api/external/football-news
 * Returns football headlines from free public RSS feeds
 */
export async function GET() {
  // Return cached if fresh
  if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  const feeds = [
    { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', source: 'BBC Sport' },
    { url: 'https://www.skysports.com/rss/12040', source: 'Sky Sports' },
    { url: 'https://www.goal.com/feeds/en/news', source: 'Goal.com' },
  ];

  const results = await Promise.allSettled(feeds.map(f => fetchRss(f.url, f.source)));

  const articles = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => {
      if (!a.pubDate) return 1;
      if (!b.pubDate) return -1;
      return new Date(b.pubDate) - new Date(a.pubDate);
    })
    .slice(0, 20);

  const result = { articles, available: articles.length > 0 };
  cache = { data: result, timestamp: Date.now() };
  return NextResponse.json(result);
}
