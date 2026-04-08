'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaFutbol, FaArrowRight, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { normalizeAvailabilityLabel } from '@/lib/bookingSlots';

// ─── Court Card ──────────────────────────────────────────────────────────────

function CourtCard({ court, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -8 }}
      transition={{
        default: { duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] },
        y: { type: 'spring', stiffness: 300, damping: 20 },
      }}
    >
      <div
        onClick={() => window.location.href = `/courts/${court._id}`}
        className="group block relative overflow-hidden rounded-2xl border border-gray-700/50 backdrop-blur-sm cursor-pointer
          transition-all duration-500
          hover:border-green-500/60
          hover:shadow-[0_0_0_1px_rgba(74,222,128,0.3),0_0_50px_rgba(74,222,128,0.25),0_20px_60px_rgba(0,0,0,0.5)]"
        style={{ background: 'linear-gradient(180deg, rgba(17,24,39,0.9) 0%, rgba(5,10,20,0.95) 100%)' }}
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          {court.image ? (
            <>
              <motion.img
                src={`/images/courts/${court.image}`}
                alt={court.name}
                loading="lazy"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1, filter: 'brightness(1.15)' }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{
                  scale: { duration: 12, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' },
                  filter: { duration: 0.8, ease: 'easeOut' },
                }}
                style={{ willChange: 'transform' }}
              />
              {/* Gradient overlays */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 40%, transparent 60%)' }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, transparent 50%)' }} />

              {/* Live pulse dot */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <motion.div
                  className="w-2 h-2 rounded-full bg-green-400"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-[9px] uppercase tracking-wider text-green-400 font-bold">Available</span>
              </div>
            </>
          ) : (
            <div className="h-56 bg-gray-800/80 flex items-center justify-center">
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                <FaFutbol className="text-green-400/40 text-6xl" />
              </motion.div>
            </div>
          )}

          {/* Court name overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3
              className="font-black text-2xl uppercase text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              {court.name}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {court.description && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">{court.description}</p>
          )}

          {/* Info row */}
          <div className="flex items-center gap-4 mb-4 text-[11px] text-gray-500 uppercase tracking-wider">
            {court.address && (
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-green-500/70" size={10} /> Milnerton
              </span>
            )}
            <span className="flex items-center gap-1">
              <FaClock className="text-green-500/70" size={10} /> {normalizeAvailabilityLabel(court.availability)}
            </span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-black text-green-400" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                R{court.price_per_hour}
              </span>
              <span className="text-gray-500 text-sm"> /hour</span>
            </div>
            <Link
              href={`/courts/${court._id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.span
                className="inline-flex items-center gap-2 text-white font-black px-6 py-3 rounded-full text-xs uppercase tracking-widest"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(135deg, var(--btn-from) 0%, var(--btn-to) 100%)',
                  boxShadow: '0 0 20px var(--glow), 0 4px 15px rgba(0,0,0,0.3)',
                }}
              >
                BOOK NOW <FaArrowRight size={10} />
              </motion.span>
            </Link>
          </div>
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-green-500 via-emerald-400 to-green-600"
          initial={{ width: '0%' }}
          whileHover={{ width: '100%' }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </motion.div>
  );
}

// ─── Main Section ────────────────────────────────────────────────────────────

export default function CourtsSection({ courts = [] }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  // Check scroll boundaries
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el.removeEventListener('scroll', checkScroll);
  }, [courts]);

  // Arrow key navigation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        el.scrollBy({ left: 300, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        el.scrollBy({ left: -300, behavior: 'smooth' });
      }
    };
    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mouse drag scrolling
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    scrollStartX.current = scrollRef.current?.scrollLeft || 0;
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !scrollRef.current) return;
    const dx = e.clientX - dragStartX.current;
    scrollRef.current.scrollLeft = scrollStartX.current - dx;
  }, [isDragging]);

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, isDragging]);

  const scrollTo = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section
      id="courts"
      className="py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #030712 0%, #0a1628 30%, #0d1f2d 60%, #030712 100%)',
      }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full opacity-30 blur-[120px]"
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)' }}
        />
        <motion.div
          className="absolute bottom-20 right-0 w-[500px] h-[500px] rounded-full blur-[100px]"
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }}
        />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-green-400/30"
            style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">

        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <FaFutbol className="text-green-400" size={12} />
            </motion.span>
            <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Ready to play?</span>
          </motion.div>

          <h2
            className="font-black uppercase mb-3"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontFamily: 'Impact, Arial Black, sans-serif',
              background: 'linear-gradient(135deg, #ffffff 0%, #4ade80 40%, #22c55e 70%, #16a34a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 30px rgba(34,197,94,0.3))',
            }}
          >
            BOOK A COURT
          </h2>

          <motion.div
            className="h-1.5 w-32 bg-gradient-to-r from-transparent via-green-500 to-transparent rounded-full mx-auto mb-4"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />

          <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            All courts are floodlit, all-weather synthetic turf pitches at Hellenic Football Club, Milnerton.
          </p>
        </motion.div>

        {courts.length === 0 ? (
          <p className="text-center text-gray-500 py-16 text-lg">
            No courts available right now. Check back soon.
          </p>
        ) : (
          <>
            {/* Mobile: draggable horizontal carousel with arrow controls */}
            <div className="lg:hidden relative">
              {/* Navigation arrows */}
              {canScrollLeft && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => scrollTo(-1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-green-600/90 text-white flex items-center justify-center shadow-lg shadow-green-900/50 -ml-2"
                  whileTap={{ scale: 0.9 }}
                >
                  <FaChevronLeft size={14} />
                </motion.button>
              )}
              {canScrollRight && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => scrollTo(1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-green-600/90 text-white flex items-center justify-center shadow-lg shadow-green-900/50 -mr-2"
                  whileTap={{ scale: 0.9 }}
                >
                  <FaChevronRight size={14} />
                </motion.button>
              )}

              <div
                ref={scrollRef}
                tabIndex={0}
                role="region"
                aria-label="Courts carousel"
                className={`flex gap-5 overflow-x-auto pb-4 -mx-3 px-3 snap-x snap-mandatory scrollbar-none outline-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                onMouseDown={handleMouseDown}
              >
                {courts.map((court, i) => (
                  <div
                    key={court._id}
                    className="flex-shrink-0 snap-center"
                    style={{ width: 'min(85vw, 340px)' }}
                  >
                    <CourtCard court={court} index={i} />
                  </div>
                ))}
              </div>

              {/* Swipe hint */}
              <motion.p
                className="text-center text-gray-500 text-xs mt-3 flex items-center justify-center gap-2"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FaChevronLeft size={8} /> Swipe or drag to see all courts <FaChevronRight size={8} />
              </motion.p>
            </div>

            {/* Desktop grid */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-6">
              {courts.map((court, i) => (
                <CourtCard key={court._id} court={court} index={i} />
              ))}
            </div>
          </>
        )}

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/bookings">
            <motion.span
              className="inline-flex items-center gap-3 text-white font-bold px-10 py-4 rounded-xl uppercase tracking-wide text-sm"
              style={{
                background: 'linear-gradient(135deg, var(--btn-from) 0%, var(--btn-to) 50%, var(--btn-from) 100%)',
                backgroundSize: '200% 200%',
                boxShadow: '0 0 30px var(--glow), 0 8px 30px rgba(0,0,0,0.3)',
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px var(--glow), 0 12px 40px rgba(0,0,0,0.4)' }}
              whileTap={{ scale: 0.97 }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <FaFutbol /> View All Courts <FaArrowRight size={12} />
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
