import { withRuntimeCache } from "@/lib/runtimeCache";
import { getFirstEnv } from "@/lib/config/env";

const AI_GATEWAY_NAMESPACE = "ai-gateway";
const DEFAULT_AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1";

export function getAIGatewayConfig() {
  const apiKey = getFirstEnv(
    "AI_GATEWAY_API_KEY",
    "VERCEL_AI_GATEWAY_API_KEY",
  );

  const baseUrl =
    getFirstEnv("AI_GATEWAY_BASE_URL", "VERCEL_AI_GATEWAY_BASE_URL") ||
    DEFAULT_AI_GATEWAY_BASE_URL;

  const defaultModel = getFirstEnv(
    "AI_GATEWAY_MODEL",
    "VERCEL_AI_GATEWAY_MODEL",
  );

  return {
    apiKey,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    defaultModel,
    enabled: Boolean(apiKey),
  };
}

async function fetchAIGateway(path) {
  const config = getAIGatewayConfig();

  if (!config.enabled) {
    throw new Error("AI Gateway is not configured");
  }

  return withRuntimeCache(AI_GATEWAY_NAMESPACE, path, 10 * 60 * 1000, async () => {
    const response = await fetch(`${config.baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`AI Gateway request failed with ${response.status}`);
    }

    return response.json();
  });
}

export async function fetchAIGatewayModels({ limit = 8 } = {}) {
  const payload = await fetchAIGateway("/models");
  const models = Array.isArray(payload?.data) ? payload.data : [];

  return models.slice(0, limit).map((model) => ({
    id: model.id,
    ownedBy: model.owned_by || "",
  }));
}

export async function getAIGatewayProviderHealth() {
  const config = getAIGatewayConfig();

  if (!config.enabled) {
    return {
      provider: "Vercel AI Gateway",
      configured: false,
      status: "unconfigured",
      baseUrl: config.baseUrl,
      defaultModel: config.defaultModel,
    };
  }

  try {
    const models = await fetchAIGatewayModels({ limit: 6 });

    return {
      provider: "Vercel AI Gateway",
      configured: true,
      status: "ok",
      baseUrl: config.baseUrl,
      defaultModel: config.defaultModel,
      modelCount: models.length,
      models,
    };
  } catch (error) {
    return {
      provider: "Vercel AI Gateway",
      configured: true,
      status: "degraded",
      baseUrl: config.baseUrl,
      defaultModel: config.defaultModel,
      error: error.message,
    };
  }
}
