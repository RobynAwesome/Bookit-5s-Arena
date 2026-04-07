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
    <section className="relative z-0 min-h-screen flex items-center justify-center pt-24 pb-24 overflow-hidden">
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
        className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center md:text-left"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Location pill */}
        <motion.p
          variants={item}
          className="text-green-400 font-bold uppercase tracking-widest text-[9px] sm:text-sm mb-4"
        >
          Milnerton · Cape Town · Hellenic Football Club
        </motion.p>

        {/* Hero title — WELCOME TO + FIVES ARENA */}
        <motion.h1
          variants={item}
          className="hero-title text-white font-black uppercase leading-none mb-6 cursor-default"
          style={{
            fontSize: "clamp(3rem, 9vw, 7.5rem)",
            fontFamily: "Impact, Arial Black, sans-serif",
            textShadow: "0 4px 32px rgba(0,0,0,0.6)",
          }}
          whileHover={{
            textShadow:
              "0 0 40px rgba(34,197,94,0.6), 0 0 80px rgba(34,197,94,0.3), 0 4px 32px rgba(0,0,0,0.6)",
            transition: { duration: 0.3 },
          }}
        >
          <motion.span
            className="inline-block"
            whileHover={{
              scale: 1.05,
              color: "#4ade80",
              textShadow: "0 0 30px rgba(74,222,128,0.5)",
              transition: { type: "spring", stiffness: 300, damping: 15 },
            }}
          >
            WELCOME TO
          </motion.span>
          <br />
          <motion.span
            className="text-green-400 inline-block"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.75,
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
              scale: 1.08,
              textShadow:
                "0 0 60px rgba(34,197,94,0.8), 0 0 120px rgba(34,197,94,0.4)",
              filter: "brightness(1.3)",
              transition: { type: "spring", stiffness: 400, damping: 12 },
            }}
          >
            FIVES ARENA
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={item}
          className="text-gray-300 text-xl max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed"
        >
          Cape Town&apos;s premier 5-a-side football experience. Book a court,
          gather your squad, and play the beautiful game.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mx-auto md:mx-0 w-full sm:w-auto"
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
