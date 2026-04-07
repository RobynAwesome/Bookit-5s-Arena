"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaTrophy, FaArrowRight, FaFutbol } from "react-icons/fa";

const FixturesPromo = () => {
  return (
    <section className="relative overflow-hidden py-16 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-green-950 via-gray-950 to-gray-950" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(34,197,94,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(34,197,94,0.2) 0%, transparent 50%)",
        }}
      />

      {/* Floating football icons */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-green-900/20"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 360],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        >
          <FaFutbol size={20 + i * 4} />
        </motion.div>
      ))}

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Trophy icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
          style={{
            background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
            boxShadow: "0 0 40px rgba(34,197,94,0.3)",
          }}
        >
          <FaTrophy className="text-white text-2xl" />
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white mb-4"
          style={{
            fontFamily: "Impact, Arial Black, sans-serif",
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Keep Up With Your{" "}
          <span
            className="text-green-400"
            style={{ textShadow: "0 0 30px rgba(34,197,94,0.4)" }}
          >
            Favourites
          </span>
        </motion.h2>

        <motion.p
          className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Live scores, match updates, referee decisions &amp; highlights — all
          the world&apos;s biggest leagues in one place. Never miss a goal.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Link href="/fixtures">
            <motion.div
              className="flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold text-sm uppercase tracking-widest cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
                boxShadow: "0 0 30px rgba(34,197,94,0.3)",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 50px rgba(34,197,94,0.5)",
              }}
              whileTap={{ scale: 0.97 }}
            >
              <FaTrophy size={16} />
              Go to Fixtures Today
              <FaArrowRight size={14} />
            </motion.div>
          </Link>
          <Link href="/fixtures">
            <motion.div
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-400 hover:text-white font-semibold text-xs uppercase tracking-widest border border-gray-700 hover:border-green-700 cursor-pointer transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaFutbol size={12} />
              Premier League, La Liga, Serie A &amp; More
            </motion.div>
          </Link>
        </motion.div>

        {/* League badges strip */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {[
            "Champions League",
            "Premier League",
            "La Liga",
            "Serie A",
            "Bundesliga",
            "PSL",
          ].map((league) => (
            <span
              key={league}
              className="text-[10px] uppercase tracking-widest font-bold text-gray-500 bg-gray-900/80 border border-gray-800 rounded-full px-3 py-1.5"
            >
              {league}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FixturesPromo;
