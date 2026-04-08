import { withRuntimeCache } from "@/lib/runtimeCache";
import { getCuratedReactorVideos } from "@/lib/media/reactors";

const NEWS_NAMESPACE = "football-news";
const FEEDS = [
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC Sport" },
  { url: "https://www.skysports.com/rss/12040", source: "Sky Sports" },
  { url: "https://www.goal.com/feeds/en/news", source: "Goal" },
  { url: "https://www.espn.com/espn/rss/soccer/news", source: "ESPN FC" },
];

function stripHtml(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getTagValue(item, tagName) {
  const match = item.match(
    new RegExp(
      `<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>|<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`,
      "i",
    ),
  );

  return (match?.[1] || match?.[2] || "").trim();
}

function getAttrValue(item, tagName, attributeName) {
  const match = item.match(
    new RegExp(`<${tagName}[^>]*${attributeName}="([^"]*)"`, "i"),
  );

  return match?.[1] || "";
}

function normalizeArticleUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((key) =>
      parsed.searchParams.delete(key),
    );
    return parsed.toString();
  } catch {
    return url;
  }
}

function parseRssItem(item, source) {
  const title = getTagValue(item, "title");
  const link = normalizeArticleUrl(
    getTagValue(item, "link") || getAttrValue(item, "link", "href"),
  );
  const publishedAt =
    getTagValue(item, "pubDate") ||
    getTagValue(item, "published") ||
    getTagValue(item, "dc:date");
  const description =
    getTagValue(item, "description") ||
    getTagValue(item, "summary") ||
    getTagValue(item, "content:encoded");

  const image =
    getAttrValue(item, "media:thumbnail", "url") ||
    getAttrValue(item, "media:content", "url") ||
    getAttrValue(item, "enclosure", "url") ||
    "";

  return {
    title,
    url: link,
    source,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
    summary: stripHtml(description).slice(0, 220),
    image,
  };
}

async function fetchFeed(feed) {
  const response = await fetch(feed.url, {
    headers: {
      "User-Agent": "5sArena/1.0",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Feed request failed with ${response.status}`);
  }

  const xml = await response.text();
  const itemRegex = /<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi;
  const items = xml.match(itemRegex) || [];

  return items
    .slice(0, 8)
    .map((item) => parseRssItem(item, feed.source))
    .filter((article) => article.title && article.url);
}

async function enrichArticle(article) {
  const cacheKey = `article:${article.url}`;

  return withRuntimeCache(NEWS_NAMESPACE, cacheKey, 60 * 60 * 1000, async () => {
    try {
      const response = await fetch(article.url, {
        headers: {
          "User-Agent": "5sArena/1.0",
          Accept: "text/html,application/xhtml+xml",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return article;
      }

      const html = await response.text();
      const ogImage =
        html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1] ||
        html.match(/<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i)?.[1] ||
        article.image;
      const ogDescription =
        html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)?.[1] ||
        html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1] ||
        article.summary;
      const canonical =
        html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] ||
        article.url;

      return {
        ...article,
        url: normalizeArticleUrl(canonical),
        image: ogImage || article.image,
        summary: stripHtml(ogDescription || article.summary).slice(0, 220),
      };
    } catch {
      return article;
    }
  });
}

export async function getFootballNewsFeed({
  seasonLabel,
  articleLimit = 12,
  videoLimit = 6,
} = {}) {
  const results = await Promise.allSettled(FEEDS.map((feed) => fetchFeed(feed)));

  const articles = results
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .sort((left, right) => {
      if (!left.publishedAt) {
        return 1;
      }
      if (!right.publishedAt) {
        return -1;
      }
      return new Date(right.publishedAt) - new Date(left.publishedAt);
    });

  const deduped = new Map();
  for (const article of articles) {
    if (!deduped.has(article.url)) {
      deduped.set(article.url, article);
    }
  }

  const enrichedArticles = await Promise.all(
    [...deduped.values()].slice(0, articleLimit).map(enrichArticle),
  );

  const videos = await getCuratedReactorVideos(
    `Premier League ${seasonLabel || ""} reaction`,
    { limit: videoLimit },
  );

  return {
    articles: enrichedArticles,
    videos,
    providers: {
      articles: "rss-og-enrichment",
      videos: videos.length ? "youtube-rapidapi" : "youtube-unavailable",
    },
  };
}
