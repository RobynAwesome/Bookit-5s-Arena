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
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
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
import { isEpochRelaunchRoot } from "@/lib/featureFlags";
import { CANONICAL_OUTBOUND_LINKS } from "@/lib/experiments/KPGSTHREE";

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

  if (theme === "crazy") {
    return (
      <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.55)]">
        <span className="h-2.5 w-2.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
      </span>
    );
  }

  return (
    <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/15 shadow-[0_0_0_1px_rgba(74,222,128,0.35)]">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.55)]" />
    </span>
  );
};

const EPOCH_GUEST_NAV = [
  { href: CANONICAL_OUTBOUND_LINKS.kopanoLabs, emoji: "🧪", label: "Kopano Labs", external: true },
  { href: CANONICAL_OUTBOUND_LINKS.krrababalela, emoji: "👤", label: "KRRababalela", external: true },
  { href: CANONICAL_OUTBOUND_LINKS.linkedIn, emoji: "💼", label: "LinkedIn", external: true },
];

const GUEST_NAV = [
  { href: "/#courts",             emoji: "⚽",  label: "Book" },
  { href: "/fixtures",            emoji: "📅",  label: "Fixtures" },
  { href: "/leagues",             emoji: "🏆",  label: "Leagues" },
  { href: "/events-and-services", emoji: "🔥",  label: "Events" },
  { href: "/about",               emoji: "ℹ️",  label: "About" },
];

const USER_NAV = [
  { href: "/#courts",   emoji: "⚽",  label: "Book" },
  { href: "/bookings",  emoji: "📅",  label: "Bookings" },
  { href: "/leagues",   emoji: "🏆",  label: "Leagues" },
  { href: "/fixtures",  emoji: "📡",  label: "Fixtures" },
  { href: "/about",     emoji: "ℹ️",  label: "About" },
];

const MANAGER_NAV = [
  { href: "/manager/dashboard", emoji: "📊", label: "HQ" },
  { href: "/manager/squad",     emoji: "👥", label: "Squad" },
  { href: "/manager/fixtures",  emoji: "📅", label: "Fixtures" },
  { href: "/about",             emoji: "ℹ️", label: "About" },
];

const SECURITY_NAV = [
  { href: "/admin/bookings", emoji: "🛡️", label: "Check-In" },
  { href: "/fixtures",       emoji: "📅", label: "Fixtures" },
  { href: "/about",          emoji: "ℹ️", label: "About" },
];

const ADMIN_NAV_PRIMARY = [
  { href: "/admin/dashboard",    emoji: "🛡️", label: "Dashboard" },
  { href: "/admin/bookings",     emoji: "📅", label: "Bookings" },
  { href: "/admin/competitions", emoji: "🏆", label: "Comps" },
];

const ADMIN_NAV_MORE = [
  { href: "/admin/analytics",    emoji: "📈", label: "Analytics" },
  { href: "/admin/rights",       emoji: "🔑", label: "Rights" },
  { href: "/admin/integrations", emoji: "🔌", label: "Integrations" },
  { href: "/admin/google",       emoji: "🌐", label: "Google APIs" },
  { href: "/admin/newsletter",   emoji: "📰", label: "Newsletter" },
  { href: "/admin/sandbox",      emoji: "🧪", label: "Sandbox" },
  { href: "/admin/security",     emoji: "🛡️", label: "Security", comingSoon: true },
  { href: "/admin/audit",        emoji: "📜", label: "Audit Log", comingSoon: true },
];

/* Mobile admin nav grouped for the drawer */
const ADMIN_MOBILE_MANAGEMENT = [
  { href: "/admin/dashboard",    emoji: "🛡️", label: "Dashboard" },
  { href: "/admin/bookings",     emoji: "📅", label: "Bookings" },
  { href: "/admin/competitions", emoji: "🏆", label: "Comps" },
  { href: "/admin/analytics",    emoji: "📈", label: "Analytics" },
  { href: "/admin/rights",       emoji: "🔑", label: "Rights" },
];

const ADMIN_MOBILE_ADVANCED = [
  { href: "/admin/integrations", emoji: "🔌", label: "Integrations" },
  { href: "/admin/google",       emoji: "🌐", label: "Google APIs" },
  { href: "/admin/newsletter",   emoji: "📰", label: "Newsletter" },
  { href: "/admin/sandbox",      emoji: "🧪", label: "Sandbox" },
  { href: "/admin/security",     emoji: "🛡️", label: "Security", comingSoon: true },
  { href: "/admin/audit",        emoji: "📜", label: "Audit Log", comingSoon: true },
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
  const isSecurityGuard = activeRole === "security_guard";
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

  const epochRoot = isEpochRelaunchRoot(pathname);

  /* 5-tier enforcement: strictly match role to nav set */
  /* Epoch parked root: no Hellenic booking CTAs on the public landing chrome. */
  const navLinks = epochRoot
    ? EPOCH_GUEST_NAV
    : isAdmin         ? ADMIN_NAV_PRIMARY :
      isManager       ? MANAGER_NAV :
      isSecurityGuard ? SECURITY_NAV :
      session         ? USER_NAV :
                        GUEST_NAV;

  const navClass = (href) => {
    const active = isActive(pathname, href);
    return `relative flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-md transition-all duration-200 uppercase tracking-widest whitespace-nowrap ${
      active
        ? "text-yellow-500"
        : "text-gray-500 hover:text-white"
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
      <header className="bg-gray-950/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-[100] shadow-[0_2px_20px_rgba(0,0,0,0.6)]">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between sm:h-20">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-gray-800 animate-pulse sm:h-20 sm:w-20" />
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
    <>
      <header
        className="sticky top-0 z-[100]"
        style={{
          background: "rgba(4, 6, 10, 0.92)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderBottom: "1px solid rgba(74, 222, 128, 0.08)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.7), inset 0 -1px 0 rgba(74,222,128,0.06)",
        }}
      >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          {/* ── Logo Container (Centered Content) ── */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <motion.div
              className="relative flex h-11 w-11 min-h-11 items-center justify-center overflow-hidden rounded-full sm:h-14 sm:w-14 sm:min-h-14"
              style={{ position: "relative" }}
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/images/logo.svg"
                alt="5s Arena"
                fill
                sizes="56px"
                className="object-contain"
                priority
              />
            </motion.div>
            <span
              className="hidden sm:block font-black text-white uppercase leading-none text-sm tracking-widest"
              style={{ fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif", letterSpacing: "0.12em" }}
            >
              5S
              <br />
              <span style={{ color: "#4ade80", fontSize: "1.1rem" }}>ARENA</span>
            </span>
          </Link>

          {/* ── Desktop Nav (Minimal Pattern) ── */}
          <div className="hidden md:flex items-center gap-1.5 justify-center flex-1 mx-4">
            {/* Search Hub */}
            {!hideDesktopSearch && <SearchModal />}
            {navLinks.map((tab) => (
              tab.external ? (
                <a
                  key={tab.href}
                  href={tab.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={navClass(tab.href)}
                  data-epoch-cta={tab.label}
                >
                  {tab.emoji && <span className="text-sm">{tab.emoji}</span>}
                  {tab.label}
                </a>
              ) : (
              <Link
                key={tab.href}
                href={tab.href}
                prefetch={false}
                className={navClass(tab.href)}
              >
                {tab.emoji && <span className="text-sm">{tab.emoji}</span>}
                {tab.icon && <NavIcon>{tab.icon}</NavIcon>}
                {tab.label}
              </Link>
              )
            ))}

            {/* Admin "More" dropdown */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setAdminMoreOpen((v) => !v)}
                  className={`${navClass("#more")} ${adminMoreOpen ? "!text-yellow-500 !bg-gray-800" : ""}`}
                >
                  <span className="text-sm">⚙️</span> More
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
                                  ? "text-yellow-500 bg-yellow-600/10"
                                  : "text-gray-300 hover:text-white hover:bg-gray-800/60"
                            }`}
                          >
                            {item.emoji && <span className="text-sm">{item.emoji}</span>}
                            {item.icon && item.icon}
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

          {/* ── Social Icons (Blog-matching) ── */}
          {!epochRoot && (
            <div className="hidden lg:flex items-center gap-2 mr-1">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-1.5 text-gray-500 hover:text-yellow-500 transition-colors"><FaFacebookF size={13} /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-1.5 text-gray-500 hover:text-yellow-500 transition-colors"><FaInstagram size={13} /></a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="p-1.5 text-gray-500 hover:text-yellow-500 transition-colors"><FaTiktok size={13} /></a>
            </div>
          )}

          {/* ── Sovereign Ecosystem Dropdown (ISIS Protocol Chapter 6.2) ── */}
          {!epochRoot && (
            <div className="relative group hidden md:block mr-2">
              <button className="flex min-h-[38px] items-center gap-1.5 px-2.5 py-1 text-xs font-mono tracking-wider text-gray-400 hover:text-white rounded-lg border border-gray-800 bg-gray-900/60 transition hover:border-gray-700">
                <span className="text-green-400 font-bold">KPGS</span> ▾
              </button>
              <div className="absolute right-0 top-full mt-2 w-56 bg-gray-950/98 border border-gray-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] hidden group-hover:block backdrop-blur-xl p-1.5 z-50">
                <a
                  href="https://kopanolabs.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col p-2 rounded-lg text-xs font-mono text-gray-300 hover:text-white hover:bg-gray-800/80 transition"
                >
                  <span className="font-bold text-green-400">Kopano Labs</span>
                  <span className="text-[9px] text-gray-500">Autonomous Sovereign Hub</span>
                </a>
                <a
                  href="https://fivesarena.com"
                  className="flex flex-col p-2 rounded-lg text-xs font-mono text-gray-300 hover:text-white hover:bg-gray-800/80 transition"
                >
                  <span className="font-bold text-yellow-400">Bookit 5s Arena</span>
                  <span className="text-[9px] text-gray-500">5-a-Side Hellenic FC</span>
                </a>
                <a
                  href="https://blog.fivesarena.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col p-2 rounded-lg text-xs font-mono text-gray-300 hover:text-white hover:bg-gray-800/80 transition"
                >
                  <span className="font-bold text-blue-400">The 5s Blog</span>
                  <span className="text-[9px] text-gray-500">Football Intelligence</span>
                </a>
                <a
                  href="https://kasilink.online"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col p-2 rounded-lg text-xs font-mono text-gray-300 hover:text-white hover:bg-gray-800/80 transition"
                >
                  <span className="font-bold text-purple-400">KasiLink</span>
                  <span className="text-[9px] text-gray-500">Township Gig Engine</span>
                </a>
                <div className="my-1 border-t border-gray-800/80" />
                <a
                  href="https://krrababalela.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col p-2 rounded-lg text-xs font-mono text-gray-300 hover:text-white hover:bg-gray-800/80 transition"
                >
                  <span className="font-bold text-white">Chief Architect</span>
                  <span className="text-[9px] text-gray-500">KRR Sovereign Systems</span>
                </a>
              </div>
            </div>
          )}

          {/* ── Actions (Profile, Logout, Theme, Mobile Toggle) ── */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Theme Toggle — cycle on click, hover shows name */}
            <motion.button
              onClick={cycleTheme}
              className="group relative flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg border border-gray-800/70 bg-gray-900/80 px-2 py-1.5 text-gray-400 transition-all hover:border-gray-700 hover:bg-gray-800 hover:text-white md:min-h-0 md:min-w-0 md:px-2.5"
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
              <div className="hidden items-center gap-3 md:flex">
                <RoleSwitcher />
                <Link
                  href="/profile"
                  prefetch={false}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-800 transition-all border border-transparent hover:border-gray-800"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-yellow-600 bg-gray-900 flex items-center justify-center">
                    {session.user.image && !imgError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-linear-to-br from-yellow-700 to-emerald-800 flex items-center justify-center text-white text-[10px] font-black">
                        {session.user.name?.[0]?.toUpperCase() || "P"}
                      </div>
                    )}
                  </div>
                  <div className="hidden lg:block text-left leading-none">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">
                      {session.user.name?.split(" ")[0]}
                    </p>
                    <p className="text-yellow-600 text-[9px] font-bold uppercase">
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
              <div className="hidden items-center gap-2 md:flex">
                {(!onAuthScreen || authMode !== "login") && (
                  <Link
                    href="/login"
                    className="py-1.5 px-5 text-sm font-semibold text-white bg-yellow-700 hover:bg-yellow-600 rounded-full shadow-[0_0_16px_rgba(34,197,94,0.3)] transition-all"
                  >
                    Login
                  </Link>
                )}
              </div>
            )}

            {/* Mobile Toggle */}
            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white md:hidden"
              whileTap={{ scale: 0.85 }}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </motion.button>
          </div>
        </div>
      </nav>
      </header>

      {/* ── Mobile Sidebar (Minimal Pattern) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              id="mobile-navigation-drawer"
              className="fixed inset-x-3 z-[130] overflow-hidden rounded-[24px] border border-gray-800 bg-gray-950 shadow-[0_30px_90px_rgba(0,0,0,0.7)] md:hidden"
              style={{
                top: "calc(4rem + env(safe-area-inset-top, 0px))",
                bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
              }}
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
            >
              <div
                className="flex h-full flex-col overflow-y-auto overscroll-contain px-4 py-4"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
              >
                <div className="mb-4 flex items-start justify-between gap-3 border-b border-gray-800 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-500">
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
                    className="min-h-[44px] min-w-[44px] rounded-full bg-gray-900 p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
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
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-yellow-500 px-1 pt-1 pb-0.5">
                        Management
                      </p>
                      {ADMIN_MOBILE_MANAGEMENT.map((tab) => (
                        <Link
                          key={tab.href}
                          href={tab.href}
                          prefetch={false}
                          onClick={() => setMobileOpen(false)}
                          className={`${mobileClass(tab.href)} w-full justify-between border ${
                            isActive(pathname, tab.href)
                              ? "border-yellow-800 bg-yellow-600/10 text-white"
                              : "border-gray-800 bg-gray-900/80 text-gray-300 hover:border-gray-700 hover:bg-gray-900"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {tab.emoji && <span className="text-base">{tab.emoji}</span>}
                            {tab.icon && tab.icon} {tab.label}
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
                            if (tab.comingSoon) {
                              e.preventDefault();
                              return;
                            }
                            setMobileOpen(false);
                          }}
                          className={`${mobileClass(tab.href)} w-full justify-between border ${
                            tab.comingSoon
                              ? "border-gray-800/50 bg-gray-900/40 text-gray-600 cursor-not-allowed"
                              : isActive(pathname, tab.href)
                                ? "border-yellow-800 bg-yellow-600/10 text-white"
                                : "border-gray-800 bg-gray-900/80 text-gray-300 hover:border-gray-700 hover:bg-gray-900"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {tab.emoji && <span className="text-base">{tab.emoji}</span>}
                            {tab.icon && tab.icon} {tab.label}
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
                      tab.external ? (
                        <a
                          key={tab.href}
                          href={tab.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileOpen(false)}
                          data-epoch-cta={tab.label}
                          className={`${mobileClass(tab.href)} w-full justify-between border border-gray-800 bg-gray-900/80 text-gray-300 hover:border-gray-700 hover:bg-gray-900`}
                        >
                          <span className="flex items-center gap-2">
                            {tab.emoji && <span className="text-base">{tab.emoji}</span>}
                            {tab.label}
                          </span>
                          <FaChevronRight size={12} className="text-gray-500" />
                        </a>
                      ) : (
                      <Link
                        key={tab.href}
                        href={tab.href}
                        prefetch={false}
                        onClick={() => setMobileOpen(false)}
                        className={`${mobileClass(tab.href)} w-full justify-between border ${
                          isActive(pathname, tab.href)
                            ? "border-yellow-800 bg-yellow-600/10 text-white"
                            : "border-gray-800 bg-gray-900/80 text-gray-300 hover:border-gray-700 hover:bg-gray-900"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {tab.emoji && <span className="text-base">{tab.emoji}</span>}
                          {tab.icon && tab.icon} {tab.label}
                        </span>
                        <FaChevronRight size={12} className="text-gray-500" />
                      </Link>
                      )
                    ))
                  )}
                </div>

                {session ? (
                  <div className="mt-4 space-y-3 border-t border-gray-800 pt-4">
                    <Link
                      href="/profile"
                      prefetch={false}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900/80 px-4 py-3"
                    >
                      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-yellow-600 bg-gray-900">
                        {session.user.image && !imgError ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={session.user.image}
                            alt="Profile"
                            className="h-full w-full rounded-full object-cover"
                            onError={() => setImgError(true)}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-yellow-700 to-emerald-800 text-sm font-black text-white">
                            {session.user.name?.[0]?.toUpperCase() || "P"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black uppercase tracking-[0.18em] text-white">
                          {session.user.name || "Player"}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-500">
                          {session.user.activeRole || "Player"}
                        </p>
                      </div>
                    </Link>

                    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 px-4 py-3">
                      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">
                        Active Role
                      </p>
                      <RoleSwitcher />
                    </div>

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
                        onClick={() => setMobileOpen(false)}
                        className="rounded-2xl border border-gray-800 bg-gray-900/80 px-4 py-3 text-center text-sm font-black uppercase tracking-widest text-gray-200"
                      >
                        Login
                      </Link>
                    )}
                    {(!onAuthScreen || authMode !== "register") && (
                      <Link
                        href="/register"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-2xl bg-yellow-700 px-4 py-3 text-center text-sm font-black uppercase tracking-widest text-white shadow-[0_0_18px_rgba(34,197,94,0.28)]"
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
    </>
  );
};

const Header = () => (
  <Suspense fallback={null}>
    <HeaderInner />
  </Suspense>
);

export default Header;

