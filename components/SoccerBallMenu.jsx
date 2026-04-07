'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaCalendarCheck, FaFutbol, FaCalendarAlt, FaTrophy } from 'react-icons/fa';

const MENU_ITEMS = [
  {
    icon: FaFutbol,
    label: 'Book a Court',
    href: '/#courts',
    color: '#22c55e',
    desc: 'Reserve your pitch',
  },
  {
    icon: FaCalendarAlt,
    label: 'Book an Event',
    href: '/events-and-services',
    color: '#3b82f6',
    desc: 'Birthdays, corporate',
  },
  {
    icon: FaTrophy,
    label: 'Register for Tournament',
    href: '/tournament',
    color: '#eab308',
    desc: 'World Cup 5s · May 2026',
  },
];

export default function SoccerBallMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const router = useRouter();
  const closeTimer = useRef(null);
  const menuRef = useRef(null);

  // Auto-close after 4 seconds of no interaction
  useEffect(() => {
    if (isOpen) {
      closeTimer.current = setTimeout(() => setIsOpen(false), 4000);
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
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navigate = (href) => {
    setIsOpen(false);
    if (href.startsWith('/#')) {
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = href;
    } else {
      router.push(href);
    }
  };

  // MacOS dock magnification: scale based on distance from hovered item
  const getScale = (index) => {
    if (hoveredIndex === null) return 1;
    const dist = Math.abs(index - hoveredIndex);
    if (dist === 0) return 1.4;
    if (dist === 1) return 1.2;
    return 1;
  };

  return (
    <div ref={menuRef} className="fixed left-0 top-[60%] sm:top-1/2 -translate-y-1/2 z-[100] hidden sm:block">

      {/* Expanded dock menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute left-16 top-1/2 -translate-y-1/2 flex flex-col gap-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {MENU_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const scale = getScale(i);
              return (
                <motion.button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  onMouseEnter={() => {
                    setHoveredIndex(i);
                    clearTimeout(closeTimer.current);
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    closeTimer.current = setTimeout(() => setIsOpen(false), 4000);
                  }}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl bg-gray-950/95 backdrop-blur-2xl border border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.8)] cursor-pointer whitespace-nowrap origin-left"
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale,
                    borderColor: hoveredIndex === i ? item.color : 'rgba(55,65,81,1)',
                    boxShadow: hoveredIndex === i
                      ? `0 0 30px ${item.color}50`
                      : '0 10px 40px rgba(0,0,0,0.8)',
                  }}
                  exit={{ opacity: 0, x: -20, scale: 0.8 }}
                  transition={{
                    delay: i * 0.05,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    scale: { type: 'spring', stiffness: 400, damping: 15 },
                  }}
                  whileTap={{ scale: 0.92 }}
                >
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}20` }}
                    animate={{ scale: hoveredIndex === i ? 1.15 : 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Icon size={18} style={{ color: item.color }} />
                  </motion.div>
                  <div className="text-left">
                    <p className="text-white text-sm font-black uppercase tracking-widest">{item.label}</p>
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{item.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Soccer ball trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-11 h-11 rounded-r-xl flex items-center justify-center cursor-pointer border-2 border-l-0 relative overflow-hidden"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #1f2937, #111827)'
            : 'linear-gradient(135deg, #111827, #030712)',
          borderColor: isOpen ? 'var(--accent)' : '#374151',
        }}
        animate={{
          boxShadow: isOpen
            ? '0 0 40px var(--glow), 4px 0 20px var(--glow)'
            : [
                '0 0 10px var(--glow), 4px 0 8px rgba(0,0,0,0.5)',
                '0 0 30px var(--glow), 4px 0 15px var(--glow)',
                '0 0 10px var(--glow), 4px 0 8px rgba(0,0,0,0.5)',
              ],
        }}
        transition={{
          boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
        }}
        whileHover={{ x: 6 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isOpen ? 'Close booking menu' : 'Book now'}
      >
        {/* Hover tooltip */}
        <AnimatePresence>
          {!isOpen && (
            <motion.span
              className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-green-400 whitespace-nowrap bg-gray-950/90 px-2 py-1 rounded-lg border border-green-500/30 pointer-events-none"
              initial={{ opacity: 0, y: 4 }}
              whileHover={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Book Now
            </motion.span>
          )}
        </AnimatePresence>

        <motion.div
          animate={{
            rotate: isOpen ? 180 : [0, 15, -15, 0],
            scale: isOpen ? 1.1 : [1, 1.05, 1],
          }}
          transition={{
            rotate: isOpen
              ? { duration: 0.3 }
              : { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <FaCalendarCheck
            size={22}
            style={{ color: isOpen ? 'var(--accent)' : '#9ca3af' }}
          />
        </motion.div>
      </motion.button>
    </div>
  );
}
