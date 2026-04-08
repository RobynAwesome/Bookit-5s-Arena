import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasMinRole, isSuperAdmin } from "@/lib/accessControl";

const PROTECTED_ROUTE_RULES = [
  { prefix: "/admin", requiredRole: "admin" },
  { prefix: "/manager", requiredRole: "manager" },
  { prefix: "/tournament/manager", requiredRole: "manager" },
  { prefix: "/profile", requiredRole: "user" },
  { prefix: "/bookings", requiredRole: "user" },
  { prefix: "/my-courts", requiredRole: "user" },
  { prefix: "/rewards", requiredRole: "user" },
];

const PUBLIC_BOOKING_ROUTES = new Set(["/bookings/success"]);

function matchesProtectedPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_BOOKING_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  const rule = PROTECTED_ROUTE_RULES.find(({ prefix }) =>
    matchesProtectedPrefix(pathname, prefix),
  );

  if (!rule) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  const roles = Array.isArray(token.roles)
    ? token.roles
    : [token.role || "user"];
  const activeRole = token.activeRole || token.role || "user";

  if (isSuperAdmin(token.email)) {
    return NextResponse.next();
  }

  if (rule.requiredRole === "user") {
    return NextResponse.next();
  }

  if (hasMinRole(activeRole, rule.requiredRole)) {
    return NextResponse.next();
  }

  if (roles.includes(rule.requiredRole)) {
    const roleSelectUrl = new URL("/role-select", request.url);
    roleSelectUrl.searchParams.set(
      "next",
      `${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(roleSelectUrl);
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/tournament/manager/:path*",
    "/profile/:path*",
    "/bookings/:path*",
    "/my-courts/:path*",
    "/rewards/:path*",
  ],
};
