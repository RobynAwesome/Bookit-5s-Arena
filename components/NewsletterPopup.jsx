"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaEnvelope, FaFutbol } from "react-icons/fa";

const STORAGE_KEY_DISMISSED = "5s_newsletter_dismissed_forever";
const STORAGE_KEY_SUBSCRIBED = "5s_newsletter_subscribed";

export default function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    const dismissedForever = localStorage.getItem(STORAGE_KEY_DISMISSED);
    const subscribed = localStorage.getItem(STORAGE_KEY_SUBSCRIBED);
    if (dismissedForever || subscribed) return;

    const timer = setTimeout(() => setShow(true), 20000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      localStorage.setItem(STORAGE_KEY_SUBSCRIBED, "true");
      setTimeout(() => setShow(false), 3000);
    } catch {
      setStatus("error");
    }
  };

  const dismiss = () => {
    setShow(false);
    if (dontShow) {
      localStorage.setItem(STORAGE_KEY_DISMISSED, "true");
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <FaTimes size={16} />
            </button>

            {status === "success" ? (
              <motion.div
                className="text-center py-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-600/20 border border-green-500 flex items-center justify-center">
                  <FaFutbol className="text-green-400" size={24} />
                </div>
                <h3 className="text-white text-xl font-black uppercase tracking-widest mb-2">
                  You&apos;re In! ⚽
                </h3>
                <p className="text-gray-400 text-sm">
                  Welcome to the 5s Arena family. You&apos;ll receive match
                  updates, exclusive deals, and tournament news.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <motion.div
                    className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-900/30 border border-green-500/50 flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FaEnvelope className="text-green-400" size={20} />
                  </motion.div>
                  <h3
                    className="text-white text-xl font-black uppercase tracking-widest mb-2"
                    style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                  >
                    Never Miss a <span className="text-green-400">Match</span>
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Get tournament updates, fixture alerts, exclusive deals, and
                    behind-the-scenes content straight to your inbox.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 pl-10 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm outline-none focus:border-green-500 transition-colors"
                      required
                    />
                    <FaEnvelope
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
                      size={12}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3 rounded-xl bg-green-600 text-white font-bold uppercase tracking-widest text-sm cursor-pointer disabled:opacity-50"
                    style={{ boxShadow: "0 0 20px rgba(34,197,94,0.3)" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {status === "loading" ? "Subscribing..." : "Subscribe ⚽"}
                  </motion.button>
                  {status === "error" && (
                    <p className="text-red-400 text-xs text-center">
                      Something went wrong. Try again.
                    </p>
                  )}
                </form>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-gray-600 text-[10px]">
                    Unsubscribe anytime. We respect your inbox.
                  </p>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={dontShow}
                      onChange={(e) => setDontShow(e.target.checked)}
                      className="w-3 h-3 rounded accent-green-500 cursor-pointer"
                    />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600 group-hover:text-gray-400 transition-colors">
                      Don&apos;t show again
                    </span>
                  </label>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
