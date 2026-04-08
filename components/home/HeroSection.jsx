"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaFutbol, FaWhatsapp } from "react-icons/fa";

const whatsappPulse = {
  animate: {
    scale: [1, 1.08, 1],
    rotate: [0, -8, 8, 0],
  },
  transition: {
    duration: 2.2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.25 } },
};

const item = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroSection() {
  return (
    <section className="relative z-0 flex min-h-screen items-center justify-center overflow-hidden pt-24 pb-24">
      {/* Ken Burns background (always visible, even in Read Mode) */}
      <div
        className="absolute inset-0 hero-bg"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80)",
          backgroundColor: "#eae6df", // fallback for Read Mode
        }}
      />

      {/* Particle dot grid overlay (reduce opacity in Read Mode for clarity) */}
      <div className="absolute inset-0 hero-particles read:opacity-30" />

      {/* Vignette overlay (lighter in Read Mode for image clarity) */}
      <div
        className="absolute inset-0 vignette-overlay"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.08) 100%)",
        }}
      />

      <motion.div
        className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-6 text-center md:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] md:text-left"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-2xl">
          <motion.p
            variants={item}
            className="mb-4 text-[9px] font-bold uppercase tracking-[0.35em] text-green-400 sm:text-sm"
          >
            Milnerton · Cape Town · Hellenic Football Club
          </motion.p>

          <motion.h1
            variants={item}
            className="hero-title mb-6 cursor-default font-black uppercase leading-[0.9] text-white"
            style={{
              fontSize: "clamp(2.9rem, 7vw, 6rem)",
              fontFamily: "Impact, Arial Black, sans-serif",
              textShadow: "0 4px 32px rgba(0,0,0,0.55)",
            }}
          >
            <span className="block text-white/95">Welcome to</span>
            <motion.span
              className="mt-2 block text-green-400"
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.55,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Five&apos;s Arena
            </motion.span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mb-10 max-w-xl text-lg leading-relaxed text-gray-200 sm:text-xl"
          >
            Cape Town&apos;s premier 5-a-side football experience. Book a court,
            gather your squad, and play the beautiful game under the lights.
          </motion.p>

          <motion.div
            variants={item}
            className="mx-auto flex w-full flex-col items-center justify-center gap-4 sm:flex-row md:mx-0 md:justify-start"
          >
            <Link
              href="/#courts"
              className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(34,197,94,0.4)] hover:bg-green-500 hover:scale-105 active:scale-95 transition-all text-center"
            >
              <motion.span
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FaFutbol size={16} />
              </motion.span>
              Book Now
            </Link>
            <a
              href="https://wa.me/27637820245"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white/80 text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all text-center"
            >
              <motion.span
                animate={whatsappPulse.animate}
                transition={whatsappPulse.transition}
              >
                <FaWhatsapp size={16} />
              </motion.span>
              Whatsapp Us
            </a>
          </motion.div>
        </div>

        <motion.div
          variants={item}
          className="hidden justify-self-end md:block"
        >
          <div className="rounded-[32px] border border-white/12 bg-black/20 p-5 backdrop-blur-sm shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <div className="w-[min(34vw,390px)] rounded-[26px] border border-white/10 bg-black/10 p-5 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-green-300">
                Open Daily
              </p>
              <p
                className="mt-3 text-3xl font-black uppercase text-white"
                style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
              >
                Floodlit 5-A-Side
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-200">
                Premium synthetic turf, quick bookings, fixtures, and competition play from the heart of Milnerton.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span className="text-white text-[10px] uppercase tracking-[0.3em]">
            Scroll
          </span>
          <motion.div
            className="w-px h-10 bg-green-500 origin-top"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
