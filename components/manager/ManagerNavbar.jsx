"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  FaHome,
  FaUsers,
  FaCalendarCheck,
  FaTrophy,
  FaSignOutAlt,
} from "react-icons/fa";

const NAV_TABS = [
  { label: "HQ",         href: "/manager/dashboard", icon: FaHome },
  { label: "Squad",      href: "/manager/squad",     icon: FaUsers },
  { label: "Fixtures",   href: "/manager/fixtures",  icon: FaCalendarCheck },
  { label: "Standings",  href: "/tournament/standings", icon: FaTrophy, readOnly: true },
];

export default function ManagerNavbar({ session, connected }) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full z-50 bg-gray-950/85 backdrop-blur-xl border-b border-gray-800/70">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-18 md:h-20 flex items-center justify-between gap-4">

        {/* ── LEFT: Logo + Brand ── */}
        <Link href="/manager/dashboard" prefetch={false} className="flex items-center gap-3 shrink-0">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-blue-500/30 bg-gray-900">
            <Image
              src="/images/logo.png"
              alt="5s Arena"
              fill
              className="object-contain p-0.5"
              sizes="36px"
              priority
            />
          </div>
          <div className="leading-none">
            <p
              className="text-white font-black text-base uppercase leading-none tracking-tight"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              5S <span className="text-blue-400">ARENA</span>
            </p>
            <p className="text-[8px] text-blue-500 font-black uppercase tracking-[0.25em] mt-0.5">
              Manager Portal
            </p>
          </div>
        </Link>

        {/* ── CENTRE: Nav Tabs ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link key={tab.href} href={tab.href} prefetch={false}>
                <motion.div
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer ${
                    active
                      ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                      : "text-gray-500 hover:text-gray-200 hover:bg-white/5 border border-transparent"
                  }`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Icon size={11} />
                  {tab.label}
                  {tab.readOnly && (
                    <span className="text-[7px] text-gray-600 font-bold normal-case tracking-normal">
                      (view)
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* ── Mobile Nav ── */}
        <nav className="flex md:hidden items-center gap-1 overflow-x-auto">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link key={tab.href} href={tab.href} prefetch={false}>
                <div
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-colors ${
                    active
                      ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                      : "text-gray-500 border border-transparent"
                  }`}
                >
                  <Icon size={10} />
                  {tab.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* ── RIGHT: Live dot · User · Exit ── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* SSE live indicator */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? "bg-blue-500 animate-pulse" : "bg-gray-700"
              }`}
            />
            <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">
              {connected ? "Live" : "Offline"}
            </span>
          </div>

          {/* User info */}
          {session?.user && (
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-white leading-none">{session.user.name}</p>
              <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest border border-blue-500/30 bg-blue-900/20 px-1.5 py-0.5 rounded-full inline-block mt-1">
                Manager
              </span>
            </div>
          )}

          {/* Exit */}
          <motion.button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 bg-red-900/20 text-red-400 hover:bg-red-900/40 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-red-800/30 transition-all cursor-pointer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <FaSignOutAlt size={11} /> Exit
          </motion.button>
        </div>
      </div>
    </header>
  );
}
