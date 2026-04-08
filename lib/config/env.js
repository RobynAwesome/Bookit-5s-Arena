const RAW_NEWLINE_ESCAPE_PATTERN = /\\r\\n|\\n|\\r/g;

function stripOuterQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

export function normalizeEnvValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = stripOuterQuotes(
    value.trim().replace(RAW_NEWLINE_ESCAPE_PATTERN, "").replace(/\r|\n/g, ""),
  ).trim();

  return normalized;
}

export function getFirstEnv(...names) {
  for (const name of names) {
    const value = normalizeEnvValue(process.env[name]);
    if (value) {
      return value;
    }
  }

  return "";
}

export function parseUrlLikeEnv(value) {
  const normalized = normalizeEnvValue(value);
  if (!normalized) {
    return { baseUrl: "", apiKey: "" };
  }

  const candidate = /^https?:\/\//i.test(normalized)
    ? normalized
    : `https://${normalized.replace(/^\/+/, "")}`;

  try {
    const url = new URL(candidate);
    return {
      baseUrl: `${url.protocol}//${url.host}`,
      apiKey:
        normalizeEnvValue(url.searchParams.get("api_key")) ||
        normalizeEnvValue(url.searchParams.get("apikey")) ||
        normalizeEnvValue(url.searchParams.get("key")),
    };
  } catch {
    return { baseUrl: "", apiKey: "" };
  }
}

export function getAuthEnv() {
  return {
    secret: getFirstEnv("NEXTAUTH_SECRET"),
    url: getFirstEnv("NEXTAUTH_URL"),
  };
}

export function getSiteUrl() {
  return (
    getFirstEnv("NEXTAUTH_URL") ||
    (process.env.NODE_ENV === "production"
      ? "https://fivesarena.com"
      : "http://localhost:3002")
  );
}

export function getRecaptchaEnv() {
  return {
    siteKey: getFirstEnv(
      "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
      "RECAPTCHA_SITE_KEY",
    ),
    secretKey: getFirstEnv("RECAPTCHA_SECRET_KEY"),
  };
}
