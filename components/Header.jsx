"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSignOutAlt,
  FaCalendarAlt,
  FaBars,
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
            <SearchModal />
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
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] text-center font-bold text-gray-400 hover:text-white uppercase tracking-widest"
                >
                  LOGIN
                </Link>
                <Link
                  href="/register"
                  className="px-3 sm:px-5 py-2 text-[9px] sm:text-[10px] text-center font-black text-white bg-green-600 rounded-lg shadow-[0_0_12px_rgba(34,197,94,0.4)] uppercase tracking-widest"
                >
                  REGISTER
                </Link>
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
          <motion.div
            className="md:hidden bg-gray-950 border-t border-gray-800 px-4 py-6 space-y-2 overflow-y-auto max-h-[calc(100vh-64px)] shadow-2xl"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {navLinks.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMobileOpen(false)}
                className={mobileClass(tab.href)}
              >
                {tab.icon} {tab.label}
              </Link>
            ))}
            {session && (
              <div className="pt-4 border-t border-gray-800 mt-4">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-3 py-3 text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-2"
                >
                  <FaSignOutAlt size={14} /> Log Out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
