'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InfoTooltip = ({ text, position = 'top', size = 14 }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const posClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span ref={ref} className="relative inline-flex items-center" style={{ verticalAlign: 'middle' }}>
      <span
        role="note"
        tabIndex={0}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center justify-center rounded-full bg-gray-700 hover:bg-green-800 border border-gray-600 hover:border-green-500 text-gray-400 hover:text-green-300 transition-all cursor-help select-none"
        style={{ width: size, height: size, fontSize: size * 0.6, fontWeight: 900, fontStyle: 'italic', lineHeight: 1 }}
        aria-label="More information"
      >
        i
      </span>

      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, scale: 0.88, y: position === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute z-50 w-52 block ${posClasses[position]}`}
            style={{ pointerEvents: 'none' }}
          >
            <span className="block bg-gray-900 border border-green-800/60 rounded-xl px-3 py-2.5 text-xs text-gray-300 leading-relaxed shadow-[0_0_20px_rgba(0,0,0,0.6)]">
              {text}
              <span className={`absolute w-2 h-2 bg-gray-900 border-gray-800 rotate-45 ${
                position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-b border-r' :
                position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-t border-l' :
                position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2 border-t border-r' :
                'right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-b border-l'
              }`} />
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

export default InfoTooltip;
