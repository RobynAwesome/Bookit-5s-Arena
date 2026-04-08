import { withRuntimeCache } from "@/lib/runtimeCache";
import { getFirstEnv } from "@/lib/config/env";

const GOOGLE_SEARCH_NAMESPACE = "google-search74";
const DEFAULT_GOOGLE_SEARCH_HOST = "google-search74.p.rapidapi.com";

export function getGoogleSearchConfig() {
  const apiKey = getFirstEnv(
    "GOOGLE_SEARCH74_API_KEY",
    "GOOGLE_SEARCH_API_KEY",
    "RAPIDAPI_KEY",
    "YOUTUBE_RAPIDAPI_KEY",
  );

  const host =
    getFirstEnv("GOOGLE_SEARCH74_HOST", "GOOGLE_SEARCH_API_HOST") ||
    DEFAULT_GOOGLE_SEARCH_HOST;

  return {
    apiKey,
    host,
    baseUrl: `https://${host}`,
    enabled: Boolean(apiKey),
  };
}

function extractSearchResults(payload) {
  const results = Array.isArray(payload?.results)
    ? payload.results
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return results
    .map((entry) => ({
      title: entry?.title || entry?.headline || "",
      url: entry?.url || entry?.link || "",
      description:
        entry?.description || entry?.snippet || entry?.body || "",
      source: entry?.displayed_link || entry?.source || entry?.domain || "",
    }))
    .filter((entry) => entry.title && entry.url);
}

async function fetchGoogleSearch(query, limit = 5) {
  const config = getGoogleSearchConfig();

  if (!config.enabled) {
    throw new Error("Google Search74 is not configured");
  }

  const params = new URLSearchParams({
    query,
    limit: String(limit),
  });
  const cacheKey = `${query}:${limit}`;

  return withRuntimeCache(
    GOOGLE_SEARCH_NAMESPACE,
    cacheKey,
    15 * 60 * 1000,
    async () => {
      const response = await fetch(`${config.baseUrl}/?${params.toString()}`, {
        headers: {
          "x-rapidapi-key": config.apiKey,
          "x-rapidapi-host": config.host,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Google Search74 request failed with ${response.status}`);
      }

      return response.json();
    },
  );
}

export async function searchGoogleResults(query, { limit = 5 } = {}) {
  if (!query) {
    return [];
  }

  const payload = await fetchGoogleSearch(query, limit);
  return extractSearchResults(payload).slice(0, limit);
}

export async function getGoogleSearchProviderHealth() {
  const config = getGoogleSearchConfig();

  if (!config.enabled) {
    return {
      provider: "Google Search74",
      configured: false,
      status: "unconfigured",
      host: config.host,
    };
  }

  try {
    const results = await searchGoogleResults("5s Arena Cape Town", {
      limit: 3,
    });

    return {
      provider: "Google Search74",
      configured: true,
      status: "ok",
      host: config.host,
      sampleCount: results.length,
      sampleResults: results,
    };
  } catch (error) {
    return {
      provider: "Google Search74",
      configured: true,
      status: "degraded",
      host: config.host,
      error: error.message,
    };
  }
}
