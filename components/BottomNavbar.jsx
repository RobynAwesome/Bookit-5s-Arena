"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FaFutbol,
  FaCalendarAlt,
  FaTrophy,
  FaHome,
  FaGift,
  FaStar,
  FaBolt,
  FaUsers,
  FaTachometerAlt,
  FaListAlt,
  FaChartBar,
  FaUserShield,
  FaBookOpen,
  FaKey,
} from "react-icons/fa";

/* ─── Nav items per role (4-tier) ───────────────────── */
const USER_ITEMS = [
  { href: "/", icon: FaHome, label: "Home", color: "#22c55e" },
  { href: "/#courts", icon: FaFutbol, label: "Book", color: "#22c55e" },
  { href: "/bookings", icon: FaCalendarAlt, label: "Bookings", color: "#a855f7" },
  { href: "/fixtures", icon: FaListAlt, label: "Fixtures", color: "#f97316" },
  { href: "/leagues", icon: FaTrophy, label: "Leagues", color: "#eab308" },
  { href: "/about", icon: FaBookOpen, label: "About", color: "#22c55e" },
];

const GUEST_ITEMS = [
  { href: "/", icon: FaHome, label: "Home", color: "#22c55e" },
  { href: "/#courts", icon: FaFutbol, label: "Book", color: "#22c55e" },
  { href: "/fixtures", icon: FaListAlt, label: "Fixtures", color: "#f97316" },
  { href: "/leagues", icon: FaTrophy, label: "Leagues", color: "#eab308" },
  { href: "/tournament", icon: FaStar, label: "Tournament", color: "#f97316" },
  { href: "/about", icon: FaBookOpen, label: "About", color: "#22c55e" },
];

const MANAGER_ITEMS = [
  { href: "/", icon: FaHome, label: "Home", color: "#22c55e" },
  {
    href: "/manager/dashboard",
    icon: FaTachometerAlt,
    label: "HQ",
    color: "#22c55e",
  },
  { href: "/manager/squad", icon: FaUsers, label: "Squad", color: "#3b82f6" },
  {
    href: "/manager/fixtures",
    icon: FaListAlt,
    label: "Fixtures",
    color: "#f97316",
  },
  {
    href: "/tournament/standings",
    icon: FaTrophy,
    label: "Standings",
    color: "#eab308",
  },
  { href: "/about", icon: FaBookOpen, label: "About", color: "#22c55e" },
];

const ADMIN_ITEMS = [
  { href: "/", icon: FaHome, label: "Home", color: "#22c55e" },
  {
    href: "/admin/dashboard",
    icon: FaUserShield,
    label: "Dashboard",
    color: "#22c55e",
  },
  {
    href: "/admin/bookings",
    icon: FaCalendarAlt,
    label: "Bookings",
    color: "#a855f7",
  },
  {
    href: "/admin/competitions",
    icon: FaTrophy,
    label: "Comps",
    color: "#f97316",
  },
  { href: "/admin/rights", icon: FaKey, label: "Rights", color: "#eab308" },
  { href: "/about", icon: FaBookOpen, label: "About", color: "#22c55e" },
  // Analytics tab removed
];

export default function BottomNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { data: session } = useSession();
  const pathname = usePathname();
  const menuRef = useRef(null);
  const closeTimer = useRef(null);

  const role = session?.user?.activeRole || session?.user?.role;
  const items =
    role === "admin"
      ? ADMIN_ITEMS
      : role === "manager"
        ? MANAGER_ITEMS
        : session
          ? USER_ITEMS
          : GUEST_ITEMS;

  // Badge colour, icon, and label per role
  const roleBadge =
    role === "admin"
      ? { label: "ADMIN", color: "#f97316", icon: FaUserShield }
      : role === "manager"
        ? { label: "MANAGER", color: "#3b82f6", icon: FaUsers }
        : session
          ? { label: "PLAYER", color: "#22c55e", icon: FaFutbol }
          : null;

  // Auto-close after 5 seconds
  useEffect(() => {
    if (isOpen) {
      closeTimer.current = setTimeout(() => setIsOpen(false), 5000);
    }
    return () => clearTimeout(closeTimer.current);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // MacOS dock magnification
  const getScale = (index) => {
    if (hoveredIndex === null) return 1;
    const dist = Math.abs(index - hoveredIndex);
    if (dist === 0) return 1.5;
    if (dist === 1) return 1.25;
    return 1;
  };

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    /* Hidden on mobile (sm:flex). Positioned at bottom center */
    <div
      ref={menuRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-90 hidden sm:flex flex-col items-center pointer-events-none"
    >
      {/* Expanded dock */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mb-3 flex items-end gap-2 px-4 py-3 rounded-2xl bg-gray-950/95 backdrop-blur-2xl border border-gray-800 shadow-[0_20px_60px_rgba(0,0,0,0.8)] pointer-events-auto"
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {items.map((item, i) => {
              const Icon = item.icon;
              const scale = getScale(i);
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center px-2 py-1 rounded-lg transition-all"
                  style={{
                    color: active ? item.color : "#fff",
                    transform: `scale(${scale})`,
                  }}
                >
                  <Icon size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button (soccer ball) */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-14 h-14 rounded-full bg-gray-950/95 backdrop-blur-2xl border border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center justify-center pointer-events-auto cursor-pointer"
        whileHover={{ scale: 1.1, borderColor: "#22c55e" }}
        whileTap={{ scale: 0.9 }}
      >
        <FaFutbol
          size={22}
          className={isOpen ? "text-green-400" : "text-gray-400"}
        />

        {/* Pulse ring */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-500/30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}

        {/* Role badge */}
        {roleBadge && !isOpen && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded pointer-events-none"
            style={{
              color: roleBadge.color,
              background: `${roleBadge.color}18`,
              border: `1px solid ${roleBadge.color}40`,
            }}
          >
            {roleBadge.label}
          </motion.span>
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isOpen && (
          <motion.span
            className="absolute -top-7 left-1/2 max-w-[8rem] -translate-x-1/2 text-center text-[8px] font-black uppercase tracking-widest text-green-400 bg-gray-950/90 px-2 py-1 rounded-lg border border-green-500/20 pointer-events-none"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 1, y: 0 }}
          >
            Navigate
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
