import { randomUUID } from "node:crypto";
import { getFirstEnv } from "@/lib/config/env";

const DEFAULT_BRAINTRUST_BASE_URL = "https://api.braintrust.dev";

export function getBraintrustConfig() {
  const apiKey = getFirstEnv(
    "OBSEVERTION_BRAINTRUST_API_KEY",
    "BRAINTRUST_API_KEY",
  );

  const projectId = getFirstEnv(
    "OBSEVERTION_BRAINTRUST_PROJECT_ID",
    "BRAINTRUST_PROJECT_ID",
  );

  const baseUrl =
    getFirstEnv("BRAINTRUST_API_URL", "OBSEVERTION_BRAINTRUST_API_URL") ||
    DEFAULT_BRAINTRUST_BASE_URL;

  return {
    apiKey,
    projectId,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    enabled: Boolean(apiKey && projectId),
  };
}

async function fetchBraintrust(path, init = {}) {
  const config = getBraintrustConfig();

  if (!config.apiKey) {
    throw new Error("Braintrust is not configured");
  }

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Braintrust request failed with ${response.status}`);
  }

  return response.json();
}

export async function getBraintrustProviderHealth() {
  const config = getBraintrustConfig();

  if (!config.apiKey) {
    return {
      provider: "Braintrust",
      configured: false,
      status: "unconfigured",
      baseUrl: config.baseUrl,
      projectId: config.projectId,
    };
  }

  try {
    const payload = await fetchBraintrust("/v1/project");
    const projects = Array.isArray(payload?.objects) ? payload.objects : [];
    const configuredProject = projects.find(
      (project) => project.id === config.projectId,
    );

    return {
      provider: "Braintrust",
      configured: true,
      status: configuredProject || !config.projectId ? "ok" : "degraded",
      baseUrl: config.baseUrl,
      projectId: config.projectId,
      projectCount: projects.length,
      projectName: configuredProject?.name || "",
      error:
        configuredProject || !config.projectId
          ? ""
          : "Configured project ID was not found in the account response.",
    };
  } catch (error) {
    return {
      provider: "Braintrust",
      configured: true,
      status: "degraded",
      baseUrl: config.baseUrl,
      projectId: config.projectId,
      error: error.message,
    };
  }
}

export async function logBraintrustEvent({
  id = randomUUID(),
  input = {},
  output = {},
  metadata = {},
  scores = {},
} = {}) {
  const config = getBraintrustConfig();

  if (!config.enabled) {
    return false;
  }

  try {
    await fetchBraintrust(`/v1/project_logs/${config.projectId}/insert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        events: [
          {
            id,
            input,
            output,
            metadata,
            scores,
          },
        ],
      }),
      signal: AbortSignal.timeout(1500),
    });

    return true;
  } catch {
    return false;
  }
}
