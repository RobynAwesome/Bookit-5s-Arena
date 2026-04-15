"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSignOutAlt,
  FaCalendarAlt,
  FaBars,
  FaChevronRight,
  FaTimes,
  FaChartBar,
  FaFutbol,
  FaTachometerAlt,
  FaListAlt,
  FaBookOpen,
  FaTrophy,
  FaBolt,
  FaUserShield,
  FaUsers,
  FaKey,
  FaCog,
  FaNewspaper,
  FaPlug,
  FaFlask,
  FaShieldAlt,
  FaHistory,
  FaGoogle,
} from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import SearchModal from "@/components/SearchModal";
import RoleSwitcher from "@/components/RoleSwitcher";
import OnlineStatus from "@/components/OnlineStatus";

/* ── Animated nav icon wrapper ── */
const NavIcon = ({ children }) => (
  <motion.span
    className="inline-flex"
    whileHover={{
      scale: 1.3,
      rotate: 12,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    }}
    whileTap={{ scale: 0.7, rotate: -20, transition: { duration: 0.1 } }}
  >
    {children}
  </motion.span>
);

import { useTheme } from "@/context/ThemeContext";

const ThemeGlyph = ({ theme }) => {
  if (theme === "light") {
    return (
      <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]">
        <span className="absolute inset-[3px] rounded-full border border-amber-100/70" />
      </span>
    );
  }

  if (theme === "read") {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded bg-stone-200 text-[8px] font-black text-stone-700 shadow-[0_0_0_1px_rgba(231,229,228,0.7)]">
        R
      </span>
    );
  }

  return (
    <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/15 shadow-[0_0_0_1px_rgba(74,222,128,0.35)]">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.55)]" />
    </span>
  );
};

const GUEST_NAV = [
  { href: "/#courts",             icon: <FaFutbol size={11} className="text-green-400" />,    label: "Book Court" },
  { href: "/events-and-services", icon: <FaBolt size={11} className="text-cyan-400" />,       label: "Events" },
  { href: "/leagues",             icon: <FaTrophy size={11} className="text-yellow-400" />,   label: "Competitions" },
  { href: "/fixtures",            icon: <FaListAlt size={11} className="text-orange-400" />,  label: "Fixtures" },
  { href: "/about",               icon: <FaBookOpen size={11} className="text-green-400" />,  label: "About" },
];

const USER_NAV = [
  { href: "/#courts",   icon: <FaFutbol size={11} className="text-green-400" />,    label: "Book" },
  { href: "/bookings",  icon: <FaCalendarAlt size={11} className="text-purple-400" />, label: "My Bookings" },
  { href: "/leagues",   icon: <FaTrophy size={11} className="text-yellow-400" />,   label: "Competitions" },
  { href: "/fixtures",  icon: <FaListAlt size={11} className="text-orange-400" />,  label: "Fixtures" },
  { href: "/about",     icon: <FaBookOpen size={11} className="text-green-400" />,  label: "About" },
];

const MANAGER_NAV = [
  { href: "/manager/dashboard", icon: <FaTachometerAlt size={11} className="text-green-400" />, label: "HQ" },
  { href: "/manager/squad",     icon: <FaUsers size={11} className="text-blue-400" />,          label: "Squad" },
  { href: "/manager/fixtures",  icon: <FaListAlt size={11} className="text-orange-400" />,      label: "Fixtures" },
  { href: "/about",             icon: <FaBookOpen size={11} className="text-green-400" />,      label: "About" },
];

const ADMIN_NAV_PRIMARY = [
  { href: "/admin/dashboard",    icon: <FaUserShield size={11} className="text-green-400" />,   label: "Dashboard" },
  { href: "/admin/bookings",     icon: <FaCalendarAlt size={11} className="text-purple-400" />, label: "Bookings" },
  { href: "/admin/competitions", icon: <FaTrophy size={11} className="text-orange-400" />,      label: "Comps" },
];

const ADMIN_NAV_MORE = [
  { href: "/admin/analytics",    icon: <FaChartBar size={11} className="text-cyan-400" />,      label: "Analytics" },
  { href: "/admin/rights",       icon: <FaKey size={11} className="text-yellow-400" />,         label: "Rights" },
  { href: "/admin/integrations", icon: <FaPlug size={11} className="text-emerald-400" />,       label: "Integrations" },
  { href: "/admin/google",       icon: <FaGoogle size={11} className="text-white" />,           label: "Google APIs" },
  { href: "/admin/newsletter",   icon: <FaNewspaper size={11} className="text-blue-400" />,     label: "Newsletter" },
  { href: "/admin/sandbox",      icon: <FaFlask size={11} className="text-pink-400" />,         label: "Sandbox" },
  { href: "/admin/security",     icon: <FaShieldAlt size={11} className="text-red-400" />,      label: "Security", comingSoon: true },
  { href: "/admin/audit",        icon: <FaHistory size={11} className="text-amber-400" />,      label: "Audit Log", comingSoon: true },
];

/* Mobile admin nav grouped for the drawer */
const ADMIN_MOBILE_MANAGEMENT = [
  { href: "/admin/dashboard",    icon: <FaUserShield size={11} className="text-green-400" />,   label: "Dashboard" },
  { href: "/admin/bookings",     icon: <FaCalendarAlt size={11} className="text-purple-400" />, label: "Bookings" },
  { href: "/admin/competitions", icon: <FaTrophy size={11} className="text-orange-400" />,      label: "Comps" },
  { href: "/admin/analytics",    icon: <FaChartBar size={11} className="text-cyan-400" />,      label: "Analytics" },
  { href: "/admin/rights",       icon: <FaKey size={11} className="text-yellow-400" />,         label: "Rights" },
];

const ADMIN_MOBILE_ADVANCED = [
  { href: "/admin/integrations", icon: <FaPlug size={11} className="text-emerald-400" />,       label: "Integrations" },
  { href: "/admin/google",       icon: <FaGoogle size={11} className="text-white" />,           label: "Google APIs" },
  { href: "/admin/newsletter",   icon: <FaNewspaper size={11} className="text-blue-400" />,     label: "Newsletter" },
  { href: "/admin/sandbox",      icon: <FaFlask size={11} className="text-pink-400" />,         label: "Sandbox" },
  { href: "/admin/security",     icon: <FaShieldAlt size={11} className="text-red-400" />,      label: "Security", comingSoon: true },
  { href: "/admin/audit",        icon: <FaHistory size={11} className="text-amber-400" />,      label: "Audit Log", comingSoon: true },
];

/* ── Route-matching helper ── */
function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  if (href.includes("#")) return pathname === href.split("#")[0];
  return pathname === href || pathname.startsWith(href + "/");
}

const HeaderInner = () => {
  const { data: session, status } = useSession();
  const { theme, themes, cycleTheme } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [adminMoreOpen, setAdminMoreOpen] = useState(false);

  const activeRole = session?.user?.activeRole || session?.user?.role;
  const isAdmin = activeRole === "admin";
  const isManager = activeRole === "manager";
  const onManagerRoute = pathname?.startsWith("/manager");
  const hideDesktopSearch = pathname === "/login" || pathname === "/register" || pathname === "/role-select";
  const onAuthScreen = pathname === "/login" || pathname === "/register";
  const requestedMode = searchParams.get("mode");
  const authMode =
    pathname === "/register"
      ? "register"
      : pathname === "/login" && requestedMode === "register"
        ? "register"
        : "login";

  /* 4-tier enforcement: strictly match role to nav set */
  const navLinks =
    isAdmin   ? ADMIN_NAV_PRIMARY :
    isManager ? MANAGER_NAV :
    session   ? USER_NAV :
                GUEST_NAV;

  /* Close admin dropdown on route change */
  useEffect(() => {
    setAdminMoreOpen(false);
  }, [pathname]);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navClass = (href) => {
    const active = isActive(pathname, href);
    return `flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest whitespace-nowrap ${
      active
        ? "text-green-400 bg-green-500/10"
        : "text-gray-400 hover:text-white hover:bg-gray-800/60"
    }`;
  };

  const mobileClass = (href) => {
    const active = isActive(pathname, href);
    return `flex items-center gap-2 px-3 py-3 text-sm font-bold rounded-lg transition-all uppercase tracking-widest ${
      active ? "" : ""
    }`;
  };

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImgError(false);
  }, [session?.user?.image]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = previousOverflow || "";
      document.body.style.touchAction = previousTouchAction || "";
    }

    return () => {
      document.body.style.overflow = previousOverflow || "";
      document.body.style.touchAction = previousTouchAction || "";
    };
  }, [mobileOpen]);

  /* Hide the global header entirely on manager routes — ManagerNavbar handles it */
  if (isManager && onManagerRoute) {
    return null;
  }

  /* Show a loading skeleton while session is resolving to prevent layout flash */
  if (status === "loading") {
    return (
      <header className="bg-gray-950/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50 shadow-[0_2px_20px_rgba(0,0,0,0.6)]">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gray-800 animate-pulse" />
            </div>
            <div className="hidden md:flex items-center gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-20 rounded-lg bg-gray-800 animate-pulse" />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-800 animate-pulse" />
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-gray-950/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50 shadow-[0_2px_20px_rgba(0,0,0,0.6)]">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* ── Logo Container (Centered Content) ── */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <motion.div
              className="relative w-20 h-20 min-h-20 rounded-full overflow-hidden flex items-center justify-center"
              style={{ position: "relative" }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/images/logo.png"
                alt="5s Arena"
                fill
                sizes="80px"
                className="object-contain"
                priority
              />
            </motion.div>
            <span
              className="hidden sm:block font-black text-white uppercase leading-none text-base tracking-widest"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              5S
              <br />
              <span className="text-green-400 text-lg">ARENA</span>
            </span>
          </Link>

          {/* ── Desktop Nav (Minimal Pattern) ── */}
          <div className="hidden md:flex items-center gap-1.5 justify-center flex-1 mx-4">
            {/* Search Hub */}
            {!hideDesktopSearch && <SearchModal />}
            {navLinks.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                prefetch={false}
                className={navClass(tab.href)}
              >
                <NavIcon>{tab.icon}</NavIcon> {tab.label}
              </Link>
            ))}

            {/* Admin "More" dropdown */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setAdminMoreOpen((v) => !v)}
                  className={`${navClass("#more")} ${adminMoreOpen ? "!text-green-400 !bg-gray-800" : ""}`}
                >
                  <NavIcon><FaCog size={11} className="text-green-400" /></NavIcon> More
                </button>
                <AnimatePresence>
                  {adminMoreOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-800 bg-gray-950/98 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl overflow-hidden z-50"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <div className="py-1.5">
                        {ADMIN_NAV_MORE.map((item) => (
                          <Link
                            key={item.href}
                            href={item.comingSoon ? "#" : item.href}
                            prefetch={false}
                            onClick={(e) => {
                              if (item.comingSoon) e.preventDefault();
                              else setAdminMoreOpen(false);
                            }}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                              item.comingSoon
                                ? "text-gray-600 cursor-not-allowed"
                                : isActive(pathname, item.href)
                                  ? "text-green-400 bg-green-500/10"
                                  : "text-gray-300 hover:text-white hover:bg-gray-800/60"
                            }`}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                            {item.comingSoon && (
                              <span className="ml-auto text-[8px] font-bold uppercase tracking-wider text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                                Soon
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Actions (Profile, Logout, Theme, Mobile Toggle) ── */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle — cycle on click, hover shows name */}
            <motion.button
              onClick={cycleTheme}
              className="relative flex items-center gap-2 rounded-lg border border-gray-800/70 bg-gray-900/80 px-2.5 py-1.5 text-gray-400 transition-all hover:border-gray-700 hover:text-white hover:bg-gray-800 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              title={`Theme: ${themes[theme].name} — click to cycle`}
            >
              <motion.span
                key={theme}
                initial={{ rotate: -20, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex items-center justify-center"
              >
                <ThemeGlyph theme={theme} />
              </motion.span>
              <motion.span
                key={`label-${theme}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block text-[9px] font-black uppercase tracking-widest"
              >
                {themes[theme].name}
              </motion.span>
            </motion.button>

            {session ? (
              <div className="flex items-center gap-3">
                <RoleSwitcher />
                <Link
                  href="/profile"
                  prefetch={false}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-800 transition-all border border-transparent hover:border-gray-800"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-green-500 bg-gray-900 flex items-center justify-center">
                    {session.user.image && !imgError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-linear-to-br from-green-600 to-emerald-800 flex items-center justify-center text-white text-[10px] font-black">
                        {session.user.name?.[0]?.toUpperCase() || "P"}
                      </div>
                    )}
                  </div>
                  <div className="hidden lg:block text-left leading-none">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">
                      {session.user.name?.split(" ")[0]}
                    </p>
                    <p className="text-green-500 text-[9px] font-bold uppercase">
                      {session.user.activeRole || "Player"}
                    </p>
                  </div>
                </Link>
                <OnlineStatus />
                <motion.button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaSignOutAlt size={14} />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {(!onAuthScreen || authMode !== "login") && (
                  <Link
                    href="/login"
                    className="px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] text-center font-bold text-gray-400 hover:text-white uppercase tracking-widest"
                  >
                    LOGIN
                  </Link>
                )}
                {(!onAuthScreen || authMode !== "register") && (
                  <Link
                    href="/register"
                    className="px-3 sm:px-5 py-2 text-[9px] sm:text-[10px] text-center font-black text-white bg-green-600 rounded-lg shadow-[0_0_12px_rgba(34,197,94,0.4)] uppercase tracking-widest"
                  >
                    REGISTER
                  </Link>
                )}
              </div>
            )}

            {/* Mobile Toggle */}
            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
              whileTap={{ scale: 0.85 }}
            >
              {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Sidebar (Minimal Pattern) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed inset-x-4 bottom-4 top-24 z-40 overflow-hidden rounded-[28px] border border-gray-800 bg-gray-950/98 shadow-[0_30px_90px_rgba(0,0,0,0.65)] md:hidden"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            >
              <div
                className="flex h-full flex-col overflow-y-auto px-4 py-4"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
              >
                <div className="mb-4 flex items-start justify-between gap-3 border-b border-gray-800 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-400">
                      Navigation
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      {session
                        ? `Signed in as ${session.user.name?.split(" ")[0] || "Player"}`
                        : "Browse courts, fixtures, competitions and more"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full bg-gray-900 p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>

                {!hideDesktopSearch && (
                  <div className="mb-4 rounded-2xl border border-gray-800 bg-gray-900/80 p-3">
                    <SearchModal />
                  </div>
                )}

                <div className="space-y-2">
                  {isAdmin ? (
                    <>
                      {/* Management group */}
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-green-400 px-1 pt-1 pb-0.5">
                        Management
                      </p>
                      {ADMIN_MOBILE_MANAGEMENT.map((tab) => (
                        <Link
                          key={tab.href}
                          href={tab.href}
                          prefetch={false}
                          className={`${mobileClass(tab.href)} w-full justify-between border ${
                            isActive(pathname, tab.href)
                              ? "border-green-700 bg-green-500/10 text-white"
                              : "border-gray-800 bg-gray-900/80 text-gray-300 hover:border-gray-700 hover:bg-gray-900"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {tab.icon} {tab.label}
                          </span>
                          <FaChevronRight size={12} className="text-gray-500" />
                        </Link>
                      ))}

                      {/* Advanced group */}
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-500 px-1 pt-3 pb-0.5">
                        Advanced
                      </p>
                      {ADMIN_MOBILE_ADVANCED.map((tab) => (
                        <Link
                          key={tab.href}
                          href={tab.comingSoon ? "#" : tab.href}
                          prefetch={false}
                          onClick={(e) => {
                            if (tab.comingSoon) e.preventDefault();
                          }}
                          className={`${mobileClass(tab.href)} w-full justify-between border ${
                            tab.comingSoon
                              ? "border-gray-800/50 bg-gray-900/40 text-gray-600 cursor-not-allowed"
                              : isActive(pathname, tab.href)
                                ? "border-green-700 bg-green-500/10 text-white"
                                : "border-gray-800 bg-gray-900/80 text-gray-300 hover:border-gray-700 hover:bg-gray-900"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {tab.icon} {tab.label}
                            {tab.comingSoon && (
                              <span className="text-[8px] font-bold uppercase tracking-wider text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                                Soon
                              </span>
                            )}
                          </span>
                          <FaChevronRight size={12} className="text-gray-600" />
                        </Link>
                      ))}
                    </>
                  ) : (
                    navLinks.map((tab) => (
                      <Link
                        key={tab.href}
                        href={tab.href}
                        prefetch={false}
                        className={`${mobileClass(tab.href)} w-full justify-between border ${
                          isActive(pathname, tab.href)
                            ? "border-green-700 bg-green-500/10 text-white"
                            : "border-gray-800 bg-gray-900/80 text-gray-300 hover:border-gray-700 hover:bg-gray-900"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {tab.icon} {tab.label}
                        </span>
                        <FaChevronRight size={12} className="text-gray-500" />
                      </Link>
                    ))
                  )}
                </div>

                {session ? (
                  <div className="mt-4 space-y-3 border-t border-gray-800 pt-4">
                    <Link
                      href="/profile"
                      prefetch={false}
                      className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900/80 px-4 py-3"
                    >
                      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-green-500 bg-gray-900">
                        {session.user.image && !imgError ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={session.user.image}
                            alt="Profile"
                            className="h-full w-full rounded-full object-cover"
                            onError={() => setImgError(true)}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-green-600 to-emerald-800 text-sm font-black text-white">
                            {session.user.name?.[0]?.toUpperCase() || "P"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black uppercase tracking-[0.18em] text-white">
                          {session.user.name || "Player"}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-400">
                          {session.user.activeRole || "Player"}
                        </p>
                      </div>
                    </Link>

                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center justify-between rounded-2xl border border-red-900/60 bg-red-500/10 px-4 py-3 text-left text-sm font-black uppercase tracking-widest text-red-400"
                    >
                      <span className="flex items-center gap-2">
                        <FaSignOutAlt size={14} /> Log Out
                      </span>
                      <FaChevronRight size={12} className="text-red-300" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-2 border-t border-gray-800 pt-4">
                    {(!onAuthScreen || authMode !== "login") && (
                      <Link
                        href="/login"
                        className="rounded-2xl border border-gray-800 bg-gray-900/80 px-4 py-3 text-center text-sm font-black uppercase tracking-widest text-gray-200"
                      >
                        Login
                      </Link>
                    )}
                    {(!onAuthScreen || authMode !== "register") && (
                      <Link
                        href="/register"
                        className="rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-black uppercase tracking-widest text-white shadow-[0_0_18px_rgba(34,197,94,0.28)]"
                      >
                        Register
                      </Link>
                    )}
                  </div>
                )}

                {session && (
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-800 bg-gray-900/80 px-4 py-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-500">
                      Presence
                    </span>
                    <OnlineStatus />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

const Header = () => (
  <Suspense fallback={null}>
    <HeaderInner />
  </Suspense>
);

export default Header;
