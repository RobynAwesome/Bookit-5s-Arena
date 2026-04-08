'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaTrophy, FaArrowRight, FaFutbol, FaStar, FaTv, FaBolt } from 'react-icons/fa';

const LEAGUES = [
  { name: 'Premier League', code: 'PL' },
  { name: 'La Liga', code: 'LL' },
  { name: 'Serie A', code: 'SA' },
  { name: 'Bundesliga', code: 'BL' },
  { name: 'PSL', code: 'PSL' },
  { name: 'Champions League', code: 'UCL' },
  { name: 'MLS', code: 'MLS' },
  { name: 'Brasileirao', code: 'BRA' },
];

export default function FixturesPromo() {
  return (
    <Link href="/fixtures" className="block">
      <section
        className="relative overflow-hidden cursor-pointer group"
        style={{
          minHeight: '500px',
          background: 'linear-gradient(135deg, #030712 0%, #064e3b 30%, #022c22 60%, #030712 100%)',
        }}
      >
        {/* Background image with green tint overlay */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/images/events/football-legends.png)',
              filter: 'brightness(0.35) saturate(1.3)',
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Green gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,20,10,0.85) 0%, rgba(5,46,22,0.6) 40%, rgba(0,0,0,0.7) 100%)',
            }}
          />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to top, #030712, transparent)' }} />
          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-20" style={{ background: 'linear-gradient(to bottom, #030712, transparent)' }} />
        </div>

        {/* Floating animated elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${10 + i * 12}%`,
                top: `${15 + (i % 3) * 30}%`,
              }}
              animate={{
                y: [-15, 15, -15],
                rotate: [0, 360],
                opacity: [0.1, 0.25, 0.1],
              }}
              transition={{
                duration: 5 + i * 0.8,
                repeat: Infinity,
                delay: i * 0.6,
                ease: 'easeInOut',
              }}
            >
              <FaFutbol className="text-green-400" size={10 + i * 2} />
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 flex flex-col items-center text-center">

          {/* Trophy icon */}
          <motion.div
            className="mb-6"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <motion.div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(16,185,129,0.1) 100%)',
                border: '2px solid rgba(34,197,94,0.3)',
                boxShadow: '0 0 40px rgba(34,197,94,0.2), inset 0 0 20px rgba(34,197,94,0.1)',
              }}
              animate={{
                boxShadow: [
                  '0 0 40px rgba(34,197,94,0.2), inset 0 0 20px rgba(34,197,94,0.1)',
                  '0 0 60px rgba(34,197,94,0.4), inset 0 0 30px rgba(34,197,94,0.2)',
                  '0 0 40px rgba(34,197,94,0.2), inset 0 0 20px rgba(34,197,94,0.1)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <FaTrophy className="text-green-400 text-3xl" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h2
            className="font-black uppercase mb-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              fontFamily: 'Impact, Arial Black, sans-serif',
              background: 'linear-gradient(135deg, #ffffff 0%, #4ade80 40%, #22c55e 70%, #16a34a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 40px rgba(34,197,94,0.4))',
            }}
          >
            Keep Up With Your Favourites
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Live scores, breaking news, video highlights, local arena schedules,
            and top-25 league coverage with PSL included.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.span
              className="inline-flex items-center gap-3 text-white font-black px-10 py-4 rounded-xl text-sm uppercase tracking-widest"
              style={{
                background: 'linear-gradient(135deg, var(--btn-from) 0%, var(--btn-to) 50%, var(--btn-from) 100%)',
                backgroundSize: '200% 200%',
                boxShadow: '0 0 40px var(--glow), 0 8px 30px rgba(0,0,0,0.4)',
              }}
              whileHover={{ scale: 1.08, boxShadow: '0 0 60px var(--glow), 0 12px 40px rgba(0,0,0,0.5)' }}
              whileTap={{ scale: 0.95 }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <FaBolt size={14} /> Go to Fixtures Today <FaArrowRight size={12} />
            </motion.span>

            <motion.span
              className="inline-flex items-center gap-3 text-white font-bold px-8 py-4 rounded-xl text-sm uppercase tracking-widest border border-white/20 backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.05)' }}
              whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(74,222,128,0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              <FaTv size={14} /> Watch Highlights
            </motion.span>
          </motion.div>

          <motion.div
            className="mb-10 flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.62 }}
          >
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
              Arena local fixtures redesigned
            </span>
            <span className="rounded-full border border-green-500/25 bg-green-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-green-300">
              Top 25 leagues tracked
            </span>
            <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
              PSL always visible
            </span>
          </motion.div>

          {/* League badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            {LEAGUES.map((league, i) => (
              <motion.span
                key={league.code}
                className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-sm"
                style={{
                  background: 'rgba(34,197,94,0.08)',
                  borderColor: 'rgba(34,197,94,0.2)',
                  color: 'rgba(74,222,128,0.9)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + i * 0.08 }}
                whileHover={{
                  scale: 1.1,
                  background: 'rgba(34,197,94,0.15)',
                  borderColor: 'rgba(34,197,94,0.4)',
                  boxShadow: '0 0 15px rgba(34,197,94,0.3)',
                }}
              >
                <FaStar size={8} className="inline mr-1.5 -mt-0.5" />
                {league.name}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>
    </Link>
  );
}
