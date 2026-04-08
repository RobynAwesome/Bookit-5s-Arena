import { promises as fs } from "fs";
import path from "path";

const STORE_PATH = path.join(
  process.cwd(),
  "data",
  "newsletter-subscribers.local.json",
);

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function ensureStoreDir() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
}

export async function readLocalNewsletterSubscribers() {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => ({
        email: normalizeEmail(entry?.email),
        source: entry?.source || "popup",
        subscribedAt: entry?.subscribedAt || entry?.createdAt || new Date().toISOString(),
        createdAt: entry?.createdAt || entry?.subscribedAt || new Date().toISOString(),
        updatedAt: entry?.updatedAt || entry?.subscribedAt || new Date().toISOString(),
      }))
      .filter((entry) => entry.email);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeLocalNewsletterSubscribers(subscribers) {
  await ensureStoreDir();
  await fs.writeFile(STORE_PATH, JSON.stringify(subscribers, null, 2), "utf8");
}

export async function upsertLocalNewsletterSubscriber(
  email,
  { source = "popup" } = {},
) {
  const normalizedEmail = normalizeEmail(email);
  const subscribers = await readLocalNewsletterSubscribers();
  const now = new Date().toISOString();

  const deduped = subscribers.filter(
    (entry) => normalizeEmail(entry.email) !== normalizedEmail,
  );

  deduped.unshift({
    email: normalizedEmail,
    source,
    subscribedAt: now,
    createdAt:
      subscribers.find(
        (entry) => normalizeEmail(entry.email) === normalizedEmail,
      )?.createdAt || now,
    updatedAt: now,
  });

  await writeLocalNewsletterSubscribers(deduped);

  return deduped[0];
}
