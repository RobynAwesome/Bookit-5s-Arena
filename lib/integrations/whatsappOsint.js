import { createHash } from "node:crypto";
import { getFirstEnv } from "@/lib/config/env";

const DEFAULT_WHATSAPP_OSINT_HOST = "whatsapp-osint.p.rapidapi.com";

export function getWhatsAppOsintConfig() {
  const apiKey = getFirstEnv(
    "WHATSAPP_OSINT_API_KEY",
    "RAPIDAPI_KEY",
    "YOUTUBE_RAPIDAPI_KEY",
  );

  const host =
    getFirstEnv("WHATSAPP_OSINT_HOST", "WHATSAPP_OSINT_API_HOST") ||
    DEFAULT_WHATSAPP_OSINT_HOST;

  return {
    apiKey,
    host,
    baseUrl: `https://${host}`,
    enabled: Boolean(apiKey),
  };
}

export function normalizePhoneNumber(value) {
  const cleaned = String(value || "").replace(/[^\d+]/g, "");

  if (!cleaned) {
    return "";
  }

  if (cleaned.startsWith("+")) {
    return `+${cleaned.slice(1).replace(/\+/g, "")}`;
  }

  return `+${cleaned.replace(/\+/g, "")}`;
}

function fingerprintPhoneNumber(phoneNumber) {
  return createHash("sha256")
    .update(phoneNumber)
    .digest("hex")
    .slice(0, 12);
}

function extractField(payload, candidates) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  for (const [key, value] of Object.entries(payload)) {
    if (candidates.includes(key) && value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  for (const value of Object.values(payload)) {
    if (value && typeof value === "object") {
      const nested = extractField(value, candidates);
      if (nested) {
        return nested;
      }
    }
  }

  return "";
}

function sanitizeLookupPayload(payload, normalizedPhoneNumber) {
  return {
    phoneNumber: normalizedPhoneNumber,
    fingerprint: fingerprintPhoneNumber(normalizedPhoneNumber),
    displayName: String(
      extractField(payload, ["displayName", "pushname", "name", "fullName"]),
    ),
    about: String(extractField(payload, ["about", "bio", "description"])),
    countryCode: String(extractField(payload, ["countryCode", "country_code"])),
    imageUrl: String(
      extractField(payload, ["profilePicture", "profilePictureUrl", "avatar", "image"]),
    ),
    isBusiness: Boolean(
      extractField(payload, ["isBusiness", "business", "businessAccount"]),
    ),
    isRegistered: Boolean(
      extractField(payload, ["exists", "isRegistered", "registered", "valid"]),
    ),
  };
}

async function performLookupRequest(url, init) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`WhatsApp OSINT request failed with ${response.status}`);
  }

  return response.json();
}

export async function lookupWhatsAppProfile(phoneNumber) {
  const config = getWhatsAppOsintConfig();

  if (!config.enabled) {
    throw new Error("WhatsApp OSINT is not configured");
  }

  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  if (!normalizedPhoneNumber || normalizedPhoneNumber.length < 8) {
    throw new Error("Enter a valid phone number in international format.");
  }

  const commonHeaders = {
    "x-rapidapi-key": config.apiKey,
    "x-rapidapi-host": config.host,
  };

  const attempts = [
    () =>
      performLookupRequest(
        `${config.baseUrl}/?${new URLSearchParams({
          number: normalizedPhoneNumber,
          phone: normalizedPhoneNumber,
          query: normalizedPhoneNumber,
        }).toString()}`,
        {
          method: "GET",
          headers: commonHeaders,
        },
      ),
    () =>
      performLookupRequest(`${config.baseUrl}/`, {
        method: "POST",
        headers: {
          ...commonHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: normalizedPhoneNumber,
          phone: normalizedPhoneNumber,
          query: normalizedPhoneNumber,
        }),
      }),
  ];

  let lastError = null;

  for (const attempt of attempts) {
    try {
      const payload = await attempt();
      return sanitizeLookupPayload(payload, normalizedPhoneNumber);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("WhatsApp OSINT lookup failed");
}

export async function getWhatsAppOsintProviderHealth() {
  const config = getWhatsAppOsintConfig();

  if (!config.enabled) {
    return {
      provider: "WhatsApp OSINT",
      configured: false,
      status: "unconfigured",
      host: config.host,
    };
  }

  return {
    provider: "WhatsApp OSINT",
    configured: true,
    status: "ok",
    host: config.host,
    mode: "manual-admin-review",
  };
}
