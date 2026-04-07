'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaCalendarCheck, FaArrowRight } from 'react-icons/fa';

const EVENTS = [
  {
    image: '/images/events/birthday-parties.png',
    title: 'Birthday Parties',
    desc: 'Private court hire with full access to our bar & clubhouse. Catering options available. Perfect for groups of all sizes — book the pitch, celebrate in style.',
    border: 'border-t-green-500',
    glow: 'rgba(34,197,94,0.25)',
  },
  {
    image: '/images/events/Tournaments.png',
    title: 'Tournaments',
    desc: 'Organise your own 5v5 tournament on our floodlit courts. We provide the venue, sound system and bar — you bring the teams and the competitive spirit.',
    border: 'border-t-yellow-500',
    glow: 'rgba(234,179,8,0.25)',
  },
  {
    image: '/images/events/corporate-events.png',
    title: 'Corporate Events',
    desc: 'The ultimate team-building day out. Use our courts, clubhouse bar and restaurant to host a full corporate event your team will never forget.',
    border: 'border-t-blue-500',
    glow: 'rgba(59,130,246,0.25)',
  },
  {
    image: '/images/events/holiday-clinics.png',
    title: 'Holiday Clinics',
    desc: 'Coached football clinics for all ages and skill levels during school holidays. Great way to keep the kids active, improving and having fun.',
    border: 'border-t-purple-500',
    glow: 'rgba(168,85,247,0.25)',
  },
];

export default function EventsSection() {
  return (
    <Link href="/events-and-services" className="block">
      <section className="py-20 relative overflow-hidden cursor-pointer group/section" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #111827 50%, #0f172a 100%)' }}>
        {/* Decorative glows */}
        <div className="absolute top-10 right-10 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-10 left-10 w-[350px] h-[350px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto px-6 relative">

          {/* Header */}
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.p
              className="text-green-400 font-bold tracking-widest uppercase text-sm mb-2 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🎉
              </motion.span>
              More than just football
            </motion.p>
            <h2
              className="font-black uppercase"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontFamily: 'Impact, Arial Black, sans-serif',
                background: 'linear-gradient(135deg, #ffffff 0%, #4ade80 50%, #22c55e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              EVENTS &amp; SERVICES
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 rounded-full mx-auto mt-3" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {EVENTS.map((e, i) => (
              <motion.div
                key={i}
                className={`group bg-gray-800/50 overflow-hidden border-t-4 ${e.border} flex flex-col rounded-2xl border border-gray-700/50 backdrop-blur-sm`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{
                  y: -10,
                  boxShadow: `0 20px 50px -10px ${e.glow}, 0 0 30px ${e.glow}`,
                  borderColor: 'rgba(74,222,128,0.3)',
                  transition: { duration: 0.25 },
                }}
              >
                <div className="h-48 overflow-hidden rounded-t-2xl">
                  <motion.img
                    src={e.image}
                    alt={e.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    animate={{ scale: [1, 1.04, 1], x: [0, 3, 0] }}
                    transition={{ duration: 12 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3
                    className="font-black uppercase text-xl mb-3 text-white"
                    style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
                  >
                    {e.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed flex-1">{e.desc}</p>
                  <motion.span
                    className="inline-flex items-center gap-2 mt-4 text-white font-black px-5 py-2.5 rounded-full text-xs uppercase tracking-widest self-start"
                    whileHover={{ scale: 1.08, boxShadow: '0 0 24px var(--glow)' }}
                    style={{
                      background: 'linear-gradient(135deg, var(--btn-from) 0%, var(--btn-to) 100%)',
                      boxShadow: '0 0 18px var(--glow)',
                    }}
                  >
                    <FaCalendarCheck size={12} /> BOOK EVENT <FaArrowRight size={9} />
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.span
              className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl uppercase tracking-wide transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--btn-from) 0%, var(--btn-to) 100%)',
                boxShadow: '0 0 20px var(--glow)',
              }}
              whileHover={{ scale: 1.04, boxShadow: '0 0 35px var(--glow)' }}
              whileTap={{ scale: 0.97 }}
              animate={{ boxShadow: ['0 0 15px var(--glow)', '0 0 30px var(--glow)', '0 0 15px var(--glow)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaCalendarCheck /> View All Events & Book <FaArrowRight size={12} />
            </motion.span>
          </motion.div>
        </div>
      </section>
    </Link>
  );
}
