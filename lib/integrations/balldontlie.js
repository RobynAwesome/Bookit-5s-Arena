import { withRuntimeCache } from "@/lib/runtimeCache";
import { getFirstEnv } from "@/lib/config/env";

const BALLDONTLIE_NAMESPACE = "balldontlie";
const DEFAULT_BALLDONTLIE_BASE_URL = "https://api.balldontlie.io/v1";

export function getBalldontlieConfig() {
  const apiKey = getFirstEnv(
    "BALLONTILE_KEY",
    "BALLDONTLIE_API_KEY",
    "BALLDONTLIE_KEY",
  );

  return {
    apiKey,
    baseUrl:
      getFirstEnv("BALLDONTLIE_API_BASE_URL") || DEFAULT_BALLDONTLIE_BASE_URL,
    enabled: Boolean(apiKey),
  };
}

async function fetchBalldontlie(path) {
  const config = getBalldontlieConfig();

  if (!config.enabled) {
    throw new Error("BallDontLie is not configured");
  }

  return withRuntimeCache(BALLDONTLIE_NAMESPACE, path, 10 * 60 * 1000, async () => {
    const response = await fetch(`${config.baseUrl}${path}`, {
      headers: {
        Authorization: config.apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`BallDontLie request failed with ${response.status}`);
    }

    return response.json();
  });
}

export async function fetchBalldontlieTeams({ limit = 6 } = {}) {
  const payload = await fetchBalldontlie("/teams");
  const teams = Array.isArray(payload?.data) ? payload.data : [];

  return teams.slice(0, limit).map((team) => ({
    id: team.id,
    name: team.full_name || team.name,
    conference: team.conference || "",
    division: team.division || "",
  }));
}

export async function getBalldontlieProviderHealth() {
  const config = getBalldontlieConfig();

  if (!config.enabled) {
    return {
      provider: "BallDontLie",
      configured: false,
      status: "unconfigured",
      baseUrl: config.baseUrl,
    };
  }

  try {
    const teams = await fetchBalldontlieTeams({ limit: 6 });

    return {
      provider: "BallDontLie",
      configured: true,
      status: "ok",
      baseUrl: config.baseUrl,
      sampleCount: teams.length,
      teams,
    };
  } catch (error) {
    return {
      provider: "BallDontLie",
      configured: true,
      status: "degraded",
      baseUrl: config.baseUrl,
      error: error.message,
    };
  }
}
