/**
 * Server-side feature access checks.
 * Kept separate from lib/roles.js so roles.js stays Edge Runtime-safe (no mongoose).
 */
import { SUPER_ADMIN_EMAIL } from './roles.js';

// Simple in-memory cache: { cacheKey: { value, expires } }
const _featureCache = new Map();
const CACHE_TTL_MS = 60_000;

/**
 * Server-side feature check. Super admin always returns true.
 * Check order: user override → role override → defaultEnabled.
 *
 * @param {string} featureKey
 * @param {{ userId?: string, activeRole?: string, email?: string }} context
 */
export async function isFeatureEnabled(featureKey, { userId, activeRole, email } = {}) {
  if (email === SUPER_ADMIN_EMAIL) return true;

  const cacheKey = `${featureKey}:${userId || ''}:${activeRole || ''}`;
  const cached = _featureCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.value;

  try {
    const { default: connectDB } = await import('./mongodb.js');
    const { default: FeatureAccess } = await import('../models/FeatureAccess.js');
    await connectDB();

    const feature = await FeatureAccess.findOne({ featureKey }).lean();
    if (!feature) return true; // unknown feature → allow by default

    // User-level override
    if (userId && feature.userOverrides instanceof Map) {
      if (feature.userOverrides.has(userId)) {
        const val = feature.userOverrides.get(userId);
        _featureCache.set(cacheKey, { value: val, expires: Date.now() + CACHE_TTL_MS });
        return val;
      }
    }

    // Role-level override
    if (activeRole && feature.roleOverrides instanceof Map) {
      if (feature.roleOverrides.has(activeRole)) {
        const val = feature.roleOverrides.get(activeRole);
        _featureCache.set(cacheKey, { value: val, expires: Date.now() + CACHE_TTL_MS });
        return val;
      }
    }

    const val = feature.defaultEnabled;
    _featureCache.set(cacheKey, { value: val, expires: Date.now() + CACHE_TTL_MS });
    return val;
  } catch {
    return true; // fail open — never block on DB error
  }
}
