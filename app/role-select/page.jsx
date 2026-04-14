"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { FaUserShield, FaUsers, FaFutbol, FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import { defaultActiveRole } from "@/lib/roles";

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    description: "Full control — manage bookings, competitions, courts, and all system settings.",
    icon: FaUserShield,
    color: "#f97316",
    bg: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.3)",
    redirect: "/admin/dashboard",
  },
  manager: {
    label: "Manager",
    description: "Manage your squad, view fixtures, and track standings for your tournament team.",
    icon: FaUsers,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.3)",
    redirect: "/manager/dashboard",
  },
  user: {
    label: "Player",
    description: "Book courts, view your bookings, track rewards, and follow live fixtures.",
    icon: FaFutbol,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.3)",
    redirect: "/",
  },
};

function RoleSelectInner() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [switching, setSwitching] = useState(null);
  const nextPath = searchParams.get("next");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
    if (status === "authenticated") {
      const roles = session?.user?.roles;
      // Single-role users don't need to select — redirect straight home
      if (!roles || roles.length <= 1) {
        const fallbackRole = defaultActiveRole(session?.user?.email, roles || [session?.user?.role || "user"]);
        const fallbackPath = nextPath || ROLE_CONFIG[fallbackRole]?.redirect || "/";
        router.replace(fallbackPath);
      }
    }
  }, [nextPath, router, session, status]);

  const handleSelect = async (role) => {
    setSwitching(role);
    await update({ activeRole: role });
    const cfg = ROLE_CONFIG[role];
    router.replace(nextPath || cfg?.redirect || "/");
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roles = session.user.roles || ["user"];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col items-center gap-3"
      >
        <div className="relative w-20 h-20">
          <Image src="/images/logo.png" alt="5s Arena" fill className="object-contain" priority />
        </div>
        <h1
          className="text-2xl font-black uppercase tracking-widest text-white"
          style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
        >
          5S <span className="text-green-400">ARENA</span>
        </h1>
      </motion.div>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-10"
      >
        <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Welcome back</p>
        <h2 className="text-xl font-black text-white">{session.user.name}</h2>
        <p className="text-gray-500 text-xs mt-2">You have multiple roles — choose how you&apos;d like to continue.</p>
      </motion.div>

      {/* Role cards */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {roles.map((role, i) => {
          const cfg = ROLE_CONFIG[role];
          if (!cfg) return null;
          const Icon = cfg.icon;
          const isLoading = switching === role;

          return (
            <motion.button
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(role)}
              disabled={!!switching}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all disabled:opacity-60"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${cfg.color}20` }}
              >
                {isLoading ? (
                  <div
                    className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: cfg.color, borderTopColor: "transparent" }}
                  />
                ) : (
                  <Icon size={20} style={{ color: cfg.color }} />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-black uppercase tracking-widest text-xs mb-0.5" style={{ color: cfg.color }}>
                  {cfg.label}
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">{cfg.description}</p>
              </div>
              <FaArrowRight size={12} className="text-gray-600 shrink-0" />
            </motion.button>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-600 text-[10px] uppercase tracking-widest mt-8"
      >
        You can switch roles anytime from the navigation
      </motion.p>
    </div>
  );
}


export default function RoleSelectPage() {
  return (
    <Suspense fallback={null}>
      <RoleSelectInner />
    </Suspense>
  );
}
