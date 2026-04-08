import { withRuntimeCache } from "@/lib/runtimeCache";
import { getFirstEnv } from "@/lib/config/env";

const MUX_NAMESPACE = "mux";
const DEFAULT_MUX_BASE_URL = "https://api.mux.com";

export function getMuxConfig() {
  const tokenId = getFirstEnv("MUX_TOKEN_ID");
  const tokenSecret = getFirstEnv("MUX_TOKEN_SECRET");

  return {
    tokenId,
    tokenSecret,
    baseUrl: getFirstEnv("MUX_API_BASE_URL") || DEFAULT_MUX_BASE_URL,
    enabled: Boolean(tokenId && tokenSecret),
  };
}

async function fetchMux(path) {
  const config = getMuxConfig();

  if (!config.enabled) {
    throw new Error("Mux is not configured");
  }

  const basicAuth = Buffer.from(
    `${config.tokenId}:${config.tokenSecret}`,
  ).toString("base64");

  return withRuntimeCache(MUX_NAMESPACE, path, 5 * 60 * 1000, async () => {
    const response = await fetch(`${config.baseUrl}${path}`, {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Mux request failed with ${response.status}`);
    }

    return response.json();
  });
}

export async function fetchMuxAssets({ limit = 5 } = {}) {
  const payload = await fetchMux(`/video/v1/assets?limit=${limit}`);
  const assets = Array.isArray(payload?.data) ? payload.data : [];

  return assets.map((asset) => ({
    id: asset.id,
    status: asset.status,
    duration: asset.duration || 0,
    playbackIds: Array.isArray(asset.playback_ids)
      ? asset.playback_ids.map((entry) => entry.id)
      : [],
    createdAt: asset.created_at || "",
  }));
}

export async function getMuxProviderHealth() {
  const config = getMuxConfig();

  if (!config.enabled) {
    return {
      provider: "Mux",
      configured: false,
      status: "unconfigured",
      baseUrl: config.baseUrl,
    };
  }

  try {
    const assets = await fetchMuxAssets({ limit: 5 });

    return {
      provider: "Mux",
      configured: true,
      status: "ok",
      baseUrl: config.baseUrl,
      assetCount: assets.length,
      assets,
    };
  } catch (error) {
    return {
      provider: "Mux",
      configured: true,
      status: "degraded",
      baseUrl: config.baseUrl,
      error: error.message,
    };
  }
}
