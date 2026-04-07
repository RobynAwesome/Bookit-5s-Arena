"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserShield, FaUsers, FaFutbol, FaChevronDown, FaCheck } from "react-icons/fa";

const ROLE_CONFIG = {
  admin: { label: "Admin", icon: FaUserShield, color: "#f97316", redirect: "/admin/dashboard" },
  manager: { label: "Manager", icon: FaUsers, color: "#3b82f6", redirect: "/manager/dashboard" },
  user: { label: "Player", icon: FaFutbol, color: "#22c55e", redirect: "/" },
};

export default function RoleSwitcher() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef(null);

  const roles = session?.user?.roles;
  const activeRole = session?.user?.activeRole || session?.user?.role || "user";

  // Close on outside click
  useEffect(() => {
    if (!roles || roles.length <= 1) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [roles]);

  // Only show switcher if user has multiple roles
  if (!roles || roles.length <= 1) return null;

  const handleSwitch = async (role) => {
    if (role === activeRole || switching) return;
    setSwitching(true);
    setOpen(false);
    await update({ activeRole: role });
    const cfg = ROLE_CONFIG[role];
    router.push(cfg?.redirect || "/");
    router.refresh();
    setSwitching(false);
  };

  const current = ROLE_CONFIG[activeRole] || ROLE_CONFIG.user;
  const CurrentIcon = current.icon;

  return (
    <div ref={ref} className="relative">
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-black uppercase tracking-widest transition-all"
        style={{
          color: current.color,
          borderColor: `${current.color}40`,
          background: `${current.color}10`,
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        disabled={switching}
      >
        {switching ? (
          <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: current.color }} />
        ) : (
          <CurrentIcon size={11} />
        )}
        <span className="hidden lg:inline">{current.label}</span>
        <FaChevronDown
          size={9}
          className="transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-[200]"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 px-3 pt-3 pb-1">
              Switch Role
            </p>
            {roles.map((role) => {
              const cfg = ROLE_CONFIG[role];
              if (!cfg) return null;
              const Icon = cfg.icon;
              const isActive = role === activeRole;
              return (
                <button
                  key={role}
                  onClick={() => handleSwitch(role)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-800/80 transition-all"
                >
                  <Icon size={13} style={{ color: cfg.color }} />
                  <span
                    className="text-xs font-bold uppercase tracking-wide flex-1"
                    style={{ color: isActive ? cfg.color : "#9ca3af" }}
                  >
                    {cfg.label}
                  </span>
                  {isActive && <FaCheck size={9} style={{ color: cfg.color }} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
