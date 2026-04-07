"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

const STATUS_OPTIONS = [
  { key: "online", label: "Available", color: "#22c55e", dot: "bg-green-500" },
  { key: "busy", label: "Busy", color: "#eab308", dot: "bg-yellow-500" },
  {
    key: "offline",
    label: "Appear Offline",
    color: "#6b7280",
    dot: "bg-gray-500",
  },
];

const STORAGE_KEY = "5sa_user_status";

export default function OnlineStatus() {
  const { data: session } = useSession();
  const [status, setStatus] = useState("online");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && STATUS_OPTIONS.find((s) => s.key === saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(saved);
    }
  }, []);

  if (!session) return null;

  const current = STATUS_OPTIONS.find((s) => s.key === status);

  const handleSet = (key) => {
    setStatus(key);
    localStorage.setItem(STORAGE_KEY, key);
    setOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 cursor-pointer group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={`Status: ${current.label}`}
      >
        <span className="relative shrink-0">
          <span className={`block w-2.5 h-2.5 rounded-full ${current.dot}`} />
          {status === "online" && (
            <motion.span
              className="absolute inset-0 rounded-full bg-green-500"
              animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute right-0 top-full mt-2 w-44 bg-gray-950 border border-gray-800 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden z-[200] backdrop-blur-xl"
          >
            <div className="px-3 py-2 border-b border-gray-800">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">
                Set Status
              </p>
            </div>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleSet(opt.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-900 transition-colors cursor-pointer ${
                  status === opt.key ? "bg-gray-900/60" : ""
                }`}
              >
                <span className="relative shrink-0 w-3 h-3">
                  <span
                    className="block w-3 h-3 rounded-full"
                    style={{ backgroundColor: opt.color }}
                  />
                  {status === opt.key && (
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: opt.color }}
                      animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    status === opt.key ? "text-white" : "text-gray-400"
                  }`}
                >
                  {opt.label}
                </span>
                {status === opt.key && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto text-[8px] font-black text-green-400"
                  >
                    ✓
                  </motion.span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close on outside click */}
      {open && (
        <div className="fixed inset-0 z-199" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
