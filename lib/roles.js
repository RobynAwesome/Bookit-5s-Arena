// Super admin email — the only user allowed to hold all roles simultaneously
export const SUPER_ADMIN_EMAIL = 'rkholofelo@gmail.com';
export const ALL_ROLES = ['user', 'manager', 'admin'];

// Role hierarchy for permission checks
export const ROLE_HIERARCHY = { guest: 0, user: 1, manager: 2, admin: 3 };

// Check if a user is the super admin (by email)
export function isSuperAdmin(email) {
  return String(email || '').trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

// Check if a roles array includes a specific role
export function hasRole(roles, role) {
  return Array.isArray(roles) && roles.includes(role);
}

// Check if the active role meets or exceeds the required level
export function hasMinRole(activeRole, requiredRole) {
  return (ROLE_HIERARCHY[activeRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}

export function normalizeRoles(email, roles, fallbackRole = 'user') {
  if (isSuperAdmin(email)) return [...ALL_ROLES];

  const source = Array.isArray(roles) ? roles : [roles].filter(Boolean);
  const normalized = Array.from(new Set(source.filter((role) => ALL_ROLES.includes(role))));

  if (normalized.length === 0 && ALL_ROLES.includes(fallbackRole)) {
    normalized.push(fallbackRole);
  }

  return normalized.sort(
    (left, right) => (ROLE_HIERARCHY[left] || 0) - (ROLE_HIERARCHY[right] || 0),
  );
}

export function canAssumeRole(email, roles, role) {
  return normalizeRoles(email, roles).includes(role);
}

export function defaultActiveRole(email, roles) {
  const normalized = normalizeRoles(email, roles);

  if (normalized.includes('user')) return 'user';
  return highestRole(normalized);
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

// isFeatureEnabled lives in lib/features.js to keep this file Edge Runtime-safe.
