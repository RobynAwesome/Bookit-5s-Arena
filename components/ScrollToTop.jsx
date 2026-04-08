'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronUp } from 'react-icons/fa';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      setIsVisible(scrolled > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            boxShadow: [
              '0 0 20px var(--glow), 0 8px 32px rgba(0,0,0,0.5)',
              '0 0 45px var(--glow), 0 8px 32px rgba(0,0,0,0.5)',
              '0 0 20px var(--glow), 0 8px 32px rgba(0,0,0,0.5)',
            ],
          }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-6 z-[60] w-16 h-16 flex flex-col items-center justify-center gap-0.5 rounded-2xl cursor-pointer group"
          style={{
            background: 'linear-gradient(135deg, var(--btn-from), var(--btn-to))',
            boxShadow: '0 0 30px var(--glow), 0 8px 32px rgba(0,0,0,0.5)',
          }}
          whileHover={{
            scale: 1.12,
            y: -6,
            boxShadow: '0 0 50px var(--glow), 0 12px 40px rgba(0,0,0,0.6)',
          }}
          whileTap={{ scale: 0.9 }}
          transition={{
            boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          aria-label="Scroll to top"
        >
          <FaChevronUp size={20} className="text-white" />
          <span className="text-white text-[8px] font-black uppercase tracking-wider opacity-80">
            TOP
          </span>

          {/* Glow ring pulse */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-green-400/40"
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
