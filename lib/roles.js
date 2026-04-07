// Super admin email — the only user allowed to hold all roles simultaneously
export const SUPER_ADMIN_EMAIL = 'rkholofelo@gmail.com';

// Role hierarchy for permission checks
export const ROLE_HIERARCHY = { guest: 0, user: 1, manager: 2, admin: 3 };

// Check if a user is the super admin (by email)
export function isSuperAdmin(email) {
  return email === SUPER_ADMIN_EMAIL;
}

// Check if a roles array includes a specific role
export function hasRole(roles, role) {
  return Array.isArray(roles) && roles.includes(role);
}

// Check if the active role meets or exceeds the required level
export function hasMinRole(activeRole, requiredRole) {
  return (ROLE_HIERARCHY[activeRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}

// Get the highest role from an array
export function highestRole(roles) {
  if (!Array.isArray(roles) || roles.length === 0) return 'user';
  return roles.reduce((max, r) => (ROLE_HIERARCHY[r] || 0) > (ROLE_HIERARCHY[max] || 0) ? r : max, roles[0]);
}

// Does the user need to pick a role? (multiple roles available)
export function needsRoleSelection(roles) {
  return Array.isArray(roles) && roles.length > 1;
}

// Server-side guard: check session has the required role (or is super admin)
export function requireRole(session, role) {
  if (!session) return false;
  if (isSuperAdmin(session.user.email)) return true;
  return session.user.activeRole === role;
}

// Server-side guard: check session has at least the required role level (or is super admin)
export function requireMinRole(session, role) {
  if (!session) return false;
  if (isSuperAdmin(session.user.email)) return true;
  return hasMinRole(session.user.activeRole, role);
}

// ── Feature Access ────────────────────────────────────────────────

// Simple in-memory cache: { featureKey: { value, expires } }
const _featureCache = new Map();
const CACHE_TTL_MS = 60_000;

/**
 * Server-side feature check. Super admin always returns true.
 * Check order: user override → role override → defaultEnabled.
 *
 * @param {string} featureKey
 * @param {{ userId?: string, activeRole?: string, email?: string }} context
 * @param {object} [db] — optional pre-connected mongoose for injection; otherwise lazy import
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
