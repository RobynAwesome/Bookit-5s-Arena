const DEFAULT_SUPER_ADMIN_EMAILS = [
  "rkholofelo@gmail.com",
  "rkhkolofelo@gmail.com",
];

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function parseConfiguredSuperAdminEmails(value) {
  return String(value || "")
    .split(/[,\s;]+/)
    .map(normalizeEmail)
    .filter(Boolean);
}

export const SUPER_ADMIN_EMAILS = Array.from(
  new Set([
    ...DEFAULT_SUPER_ADMIN_EMAILS.map(normalizeEmail),
    ...parseConfiguredSuperAdminEmails(
      process.env.SUPER_ADMIN_EMAILS || process.env.SUPER_ADMIN_EMAIL,
    ),
  ]),
);

export const SUPER_ADMIN_EMAIL = SUPER_ADMIN_EMAILS[0];
export const ROLE_HIERARCHY = { guest: 0, user: 1, manager: 2, admin: 3 };

export function isSuperAdmin(email) {
  return SUPER_ADMIN_EMAILS.includes(normalizeEmail(email));
}

export function hasRole(roles, role) {
  return Array.isArray(roles) && roles.includes(role);
}

export function hasMinRole(activeRole, requiredRole) {
  return (ROLE_HIERARCHY[activeRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}

export function highestRole(roles) {
  if (!Array.isArray(roles) || roles.length === 0) return "user";
  return roles.reduce(
    (max, role) =>
      (ROLE_HIERARCHY[role] || 0) > (ROLE_HIERARCHY[max] || 0) ? role : max,
    roles[0],
  );
}

export function normalizeSessionRoles(email, roles) {
  if (isSuperAdmin(email)) {
    return ["user", "manager", "admin"];
  }

  const normalized = Array.isArray(roles)
    ? Array.from(
        new Set(
          roles.filter((role) =>
            ["user", "manager", "admin"].includes(role),
          ),
        ),
      )
    : [];

  return normalized.length ? normalized : ["user"];
}

export function getDefaultActiveRole(email, roles) {
  if (isSuperAdmin(email)) {
    return "admin";
  }

  const normalizedRoles = normalizeSessionRoles(email, roles);
  return normalizedRoles.includes("user")
    ? "user"
    : highestRole(normalizedRoles);
}

export function needsRoleSelection(roles) {
  return Array.isArray(roles) && roles.length > 1;
}

export function canAccessRole(user, role) {
  if (!user) return false;
  if (isSuperAdmin(user.email)) return true;
  return (user.activeRole || user.role || "user") === role;
}

export function requireRole(session, role) {
  return canAccessRole(session?.user, role);
}

export function requireMinRole(session, role) {
  if (!session) return false;
  if (isSuperAdmin(session.user.email)) return true;
  return hasMinRole(session.user.activeRole || session.user.role || "user", role);
}
