'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaTimes, FaFutbol, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { WELCOME_POPUP_STORAGE_KEY } from '@/lib/popupPreferences';

export default function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem(WELCOME_POPUP_STORAGE_KEY);
    if (!hidden) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (dontShowAgain) {
      localStorage.setItem(WELCOME_POPUP_STORAGE_KEY, '1');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl p-8 overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition"
            >
              <FaTimes size={14} />
            </button>

            <div className="text-center relative z-10">
              <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                WELCOME TO <span className="text-green-400">5S ARENA</span>
              </h2>
              <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
                Are you here for our regular social competitions or the ultimate 5s Arena World Cup 2026?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Social Competitions Option */}
                <Link href="/leagues" onClick={handleClose}>
                  <motion.div
                    className="h-full flex flex-col items-center justify-center p-6 bg-gray-800/50 border border-gray-700 rounded-2xl cursor-pointer group hover:bg-gray-800 hover:border-gray-500 transition-all"
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="w-16 h-16 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FaFutbol size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Social Competitions</h3>
                    <p className="text-xs text-gray-400 mb-4">Join our weekly social divisions and build your squad rankings.</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Explore Competitions <FaArrowRight />
                    </span>
                  </motion.div>
                </Link>

                {/* World Cup Option */}
                <Link href="/tournament" onClick={handleClose}>
                  <motion.div
                    className="h-full flex flex-col items-center justify-center p-6 bg-green-900/20 border border-green-600/30 rounded-2xl cursor-pointer group hover:bg-green-900/40 hover:border-green-500 transition-all"
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="w-16 h-16 rounded-full bg-green-600/20 text-green-400 flex items-center justify-center mb-4 animate-pulse group-hover:animate-none group-hover:scale-110 transition-transform">
                      <FaTrophy size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">World Cup &apos;26</h3>
                    <p className="text-xs text-gray-400 mb-4">The ultimate 48-team tournament. Global glory awaits.</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Register Team <FaArrowRight />
                    </span>
                  </motion.div>
                </Link>
              </div>

              {/* Footer row */}
              <div className="mt-6 flex flex-col items-center gap-3">
                <button
                  onClick={handleClose}
                  className="text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-gray-300 transition-colors cursor-pointer"
                >
                  Just browsing, thanks
                </button>

                {/* Don't show again checkbox */}
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <div
                    onClick={() => setDontShowAgain((v) => !v)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      dontShowAgain
                        ? 'bg-green-600 border-green-500'
                        : 'bg-gray-800 border-gray-600 group-hover:border-gray-500'
                    }`}
                  >
                    {dontShowAgain && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                        <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors uppercase tracking-wider">
                    Don&apos;t show this again
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
