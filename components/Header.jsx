"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
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

const ADMIN_NAV = [
  { href: "/admin/dashboard",    icon: <FaUserShield size={11} className="text-green-400" />,   label: "Dashboard" },
  { href: "/admin/bookings",     icon: <FaCalendarAlt size={11} className="text-purple-400" />, label: "Bookings" },
  { href: "/admin/competitions", icon: <FaTrophy size={11} className="text-orange-400" />,      label: "Comps" },
  { href: "/admin/analytics",    icon: <FaChartBar size={11} className="text-cyan-400" />,      label: "Analytics" },
  { href: "/admin/rights",       icon: <FaKey size={11} className="text-yellow-400" />,         label: "Rights" },
];

const Header = () => {
  const { data: session } = useSession();
  const { theme, themes, cycleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeRole = session?.user?.activeRole || session?.user?.role;
  const hideDesktopSearch = pathname === "/login" || pathname === "/register" || pathname === "/role-select";
  const onAuthScreen = pathname === "/login" || pathname === "/register";
  const requestedMode =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("mode")
      : null;
  const authMode =
    pathname === "/register"
      ? "register"
      : pathname === "/login" && requestedMode === "register"
        ? "register"
        : "login";

  const navLinks =
    activeRole === "admin"   ? ADMIN_NAV :
    activeRole === "manager" ? MANAGER_NAV :
    session                  ? USER_NAV :
                               GUEST_NAV;

  const navClass = () =>
    "flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest whitespace-nowrap";

  const mobileClass = () =>
    "flex items-center gap-2 px-3 py-3 text-sm font-bold rounded-lg transition-all uppercase tracking-widest";
  const [imgError, setImgError] = useState(false);

  // Reset image error state when the session image URL changes (e.g. after upload)
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
                className={navClass(tab.href)}
              >
                <NavIcon>{tab.icon}</NavIcon> {tab.label}
              </Link>
            ))}
          </div>

          {/* ── Actions (Profile, Logout, Theme, Mobile Toggle) ── */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle — cycle on click, hover shows name */}
            <motion.button
              onClick={cycleTheme}
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all border border-gray-800/50 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              title={`Theme: ${themes[theme].name} — click to cycle`}
            >
              <motion.span
                key={theme}
                initial={{ rotate: -20, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="text-base leading-none"
              >
                {themes[theme].emoji}
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
                  {navLinks.map((tab) => (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      onClick={() => setMobileOpen(false)}
                      className={`${mobileClass(tab.href)} w-full justify-between border ${
                        pathname === tab.href
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
                </div>

                {session ? (
                  <div className="mt-4 space-y-3 border-t border-gray-800 pt-4">
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
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

export default Header;
