'use client';

import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp, FaArrowRight } from 'react-icons/fa';

const SOCIALS = [
  {
    icon: <FaFacebook size={22} />,
    label: 'Facebook',
    sub: 'Fives Arena — latest updates & events',
    href: 'https://www.facebook.com/profile.php?id=61588019843126',
    color: '#1877F2',
    bg: 'rgba(24,119,242,0.12)',
  },
  {
    icon: <FaInstagram size={22} />,
    label: 'Instagram',
    sub: 'Goals, match highlights & more',
    href: 'https://www.instagram.com/fivesarena',
    color: '#E1306C',
    bg: 'rgba(225,48,108,0.12)',
  },
  {
    icon: <FaTiktok size={22} />,
    label: 'TikTok',
    sub: 'Short clips from the pitch',
    href: 'https://www.tiktok.com/@fivesarena',
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.06)',
  },
  {
    icon: <FaWhatsapp size={22} />,
    label: 'WhatsApp',
    sub: '063 782 0245 — instant reply',
    href: 'https://wa.me/27637820245',
    color: '#25D366',
    bg: 'rgba(37,211,102,0.12)',
  },
];

export default function SocialSection() {
  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-green-400 font-bold tracking-widest uppercase text-sm mb-2">
            Stay connected
          </p>
          <h2
            className="events-title font-black uppercase text-white"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontFamily: "'Rubik Dirt', Impact, Arial Black, sans-serif",
            }}
          >
            FOLLOW OUR JOURNEY
          </h2>
          <p className="text-gray-400 mt-3 text-sm">
            See what&apos;s happening at 5s Arena — follow us for latest updates, goals &amp; events
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          {/* Facebook card */}
          <motion.a
            href="https://www.facebook.com/profile.php?id=61588019843126"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between rounded-2xl border border-gray-700 bg-gray-800/50 overflow-hidden"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              borderColor: '#1877F2',
              backgroundColor: 'rgba(24,119,242,0.05)',
              transition: { duration: 0.25 },
            }}
          >
            <div
              className="h-28 w-full flex-shrink-0"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 30%',
              }}
            />
            <div className="px-6 pb-6 pt-4 flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-4 -mt-10">
                <img
                  src="/images/logo.png"
                  alt="Fives Arena"
                  className="w-20 h-20 rounded-full object-contain flex-shrink-0"
                />
                <div className="pt-8">
                  <p className="text-white font-black text-lg leading-none" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                    Fives Arena
                  </p>
                  <p className="text-blue-400 text-xs mt-0.5 uppercase tracking-wide">Sports Club · Cape Town</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                5-a-side football at its finest. Follow our page for match highlights, booking updates,
                events &amp; behind-the-scenes content from Milnerton&apos;s top football venue.
              </p>
              <div className="mt-auto pt-3 flex items-center gap-3">
                <motion.span
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg uppercase tracking-wide"
                  whileHover={{ backgroundColor: '#2563eb', scale: 1.04 }}
                >
                  <FaFacebook size={15} /> View Page
                </motion.span>
                <span className="text-gray-500 text-xs">↗ Opens Facebook</span>
              </div>
            </div>
          </motion.a>

          {/* Social links grid */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-gray-400 uppercase tracking-widest text-xs mb-1">Find us on</p>
            {SOCIALS.map((s, i) => (
              <motion.a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 border border-gray-700 hover:bg-gray-800 rounded-xl group overflow-hidden relative"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
              >
                <motion.div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: s.bg }}
                  whileHover={{ scale: 1.15, transition: { type: 'spring', stiffness: 400 } }}
                >
                  <span style={{ color: s.color }}>{s.icon}</span>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-none mb-0.5">{s.label}</p>
                  <p className="text-gray-500 text-xs truncate">{s.sub}</p>
                </div>
                <FaArrowRight className="text-gray-600 group-hover:text-green-400 transition-colors flex-shrink-0" size={12} />
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
