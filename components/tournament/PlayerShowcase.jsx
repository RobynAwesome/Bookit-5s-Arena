"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight, FaTh, FaStream } from "react-icons/fa";
import { WORLD_CUP_TEAMS, playerImage } from "@/lib/worldCupTeams";

/* Only teams with a player profile image */
const TEAMS_WITH_PROFILES = WORLD_CUP_TEAMS.filter((t) => playerImage(t));

/* ── Shimmer overlay (CSS keyframe injected once) ── */
const shimmerStyle = `
@keyframes shimmer-sweep {
  0% { transform: translateX(-100%) rotate(15deg); }
  100% { transform: translateX(200%) rotate(15deg); }
}
@keyframes float-particle {
  0% { transform: translateY(0) scale(1); opacity: 0.6; }
  50% { opacity: 1; }
  100% { transform: translateY(-60px) scale(0); opacity: 0; }
}
`;

export default function PlayerShowcase() {
  const [viewMode, setViewMode] = useState("carousel"); // 'carousel' | 'grid'
  const [centerIndex, setCenterIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const total = TEAMS_WITH_PROFILES.length;

  /* Auto-rotate carousel */
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % total);
    }, 4000);
  }, [total]);

  useEffect(() => {
    if (viewMode === "carousel" && !isPaused) startTimer();
    return () => clearInterval(timerRef.current);
  }, [viewMode, isPaused, startTimer]);

  const goTo = (dir) => {
    setCenterIndex((prev) => (prev + dir + total) % total);
    startTimer();
  };

  /* Get visible cards for carousel (5 cards centered) */
  const getVisibleCards = () => {
    const cards = [];
    for (let offset = -2; offset <= 2; offset++) {
      const idx = (centerIndex + offset + total) % total;
      cards.push({ team: TEAMS_WITH_PROFILES[idx], offset, idx });
    }
    return cards;
  };

  return (
    <div className="mt-14">
      <style dangerouslySetInnerHTML={{ __html: shimmerStyle }} />

      {/* Header + view toggle */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-green-400 text-xs font-bold uppercase tracking-[0.2em]">
          Representing Nations
        </h3>
        <div className="flex gap-1 bg-gray-900/80 rounded-full p-1 border border-gray-800">
          <button
            onClick={() => setViewMode("carousel")}
            className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === "carousel" ? "bg-green-600 text-white" : "text-gray-500 hover:text-white"}`}
          >
            <FaStream size={10} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-full transition-all cursor-pointer ${viewMode === "grid" ? "bg-green-600 text-white" : "text-gray-500 hover:text-white"}`}
          >
            <FaTh size={10} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "carousel" ? (
          <motion.div
            key="carousel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 3D Coverflow */}
            <div
              className="relative flex items-center justify-center"
              style={{ perspective: "1200px", height: "340px" }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Navigation arrows */}
              <motion.button
                onClick={() => goTo(-1)}
                className="absolute left-0 z-30 w-10 h-10 rounded-full bg-gray-900/80 border border-gray-700 flex items-center justify-center text-gray-400 cursor-pointer"
                whileHover={{
                  scale: 1.15,
                  borderColor: "#22c55e",
                  color: "#22c55e",
                }}
                whileTap={{ scale: 0.9 }}
              >
                <FaChevronLeft size={12} />
              </motion.button>
              <motion.button
                onClick={() => goTo(1)}
                className="absolute right-0 z-30 w-10 h-10 rounded-full bg-gray-900/80 border border-gray-700 flex items-center justify-center text-gray-400 cursor-pointer"
                whileHover={{
                  scale: 1.15,
                  borderColor: "#22c55e",
                  color: "#22c55e",
                }}
                whileTap={{ scale: 0.9 }}
              >
                <FaChevronRight size={12} />
              </motion.button>

              {/* Cards */}
              <AnimatePresence mode="popLayout">
                {getVisibleCards().map(({ team, offset, idx }) => (
                  <CoverflowCard key={idx} team={team} offset={offset} />
                ))}
              </AnimatePresence>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1.5 mt-6">
              {TEAMS_WITH_PROFILES.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => {
                    setCenterIndex(i);
                    startTimer();
                  }}
                  className={`rounded-full cursor-pointer transition-all ${i === centerIndex ? "w-6 h-2 bg-green-500" : "w-1.5 h-1.5 bg-gray-700"}`}
                  whileHover={{ scale: 1.5 }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          /* Grid Mode */
          <motion.div
            key="grid"
            className="grid grid-cols-2 md:grid-cols-4 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {TEAMS_WITH_PROFILES.map((team, i) => (
              <GridCard key={team.name} team={team} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Coverflow Card ── */
function CoverflowCard({ team, offset }) {
  const [isHovered, setIsHovered] = useState(false);
  const absOffset = Math.abs(offset);
  const img = playerImage(team);

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{ transformStyle: "preserve-3d" }}
      animate={{
        rotateY: offset * -20,
        scale: 1 - absOffset * 0.15,
        x: offset * 180,
        opacity: 1 - absOffset * 0.25,
        zIndex: 10 - absOffset,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative w-48 h-64 rounded-2xl overflow-hidden cursor-pointer bg-transparent"
        style={{ transformOrigin: "center bottom" }}
        animate={
          isHovered && offset === 0
            ? {
                scale: 1.15,
                y: -20,
                filter: "drop-shadow(0 20px 40px rgba(34,197,94,0.4))",
              }
            : {
                scale: 1,
                y: 0,
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
              }
        }
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {img ? (
          <Image
            src={img}
            alt={team.player}
            fill
            className="object-cover rounded-2xl aspect-square"
            sizes="200px"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-green-900 to-gray-900 flex items-center justify-center text-6xl font-black text-green-500/30">
            {team.name[0]}
          </div>
        )}

        {/* Shimmer sweep on hover */}
        {isHovered && offset === 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
              animation: "shimmer-sweep 1.2s ease-in-out infinite",
            }}
          />
        )}

        {/* Bottom gradient + text */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm font-black tracking-wide">
            {team.player}
          </p>
          <p className="text-green-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            {team.name}
          </p>
        </div>

        {/* Green glow border on hover */}
        {isHovered && offset === 0 && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-green-400/60 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </motion.div>

      {/* Floating label on hover */}
      <AnimatePresence>
        {isHovered && offset === 0 && (
          <motion.div
            className="absolute -top-8 px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/40 backdrop-blur-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <span className="text-green-400 text-[9px] font-black uppercase tracking-[0.15em]">
              {team.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Grid Card ── */
function GridCard({ team, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const img = playerImage(team);

  return (
    <motion.div
      className="relative cursor-pointer"
      style={{ transformOrigin: "center bottom" }}
      initial={{ opacity: 0, y: 40, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: index * 0.04,
      }}
      whileHover={{
        scale: 1.12,
        y: -16,
        zIndex: 50,
        filter: "drop-shadow(0 20px 40px rgba(34,197,94,0.35))",
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-3/4 rounded-2xl overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={team.player}
            fill
            className="object-cover rounded-2xl"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-green-900 to-gray-900 flex items-center justify-center text-5xl font-black text-green-500/30">
            {team.name[0]}
          </div>
        )}

        {/* Shimmer */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
              animation: "shimmer-sweep 1.2s ease-in-out infinite",
            }}
          />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-xs font-black">{team.player}</p>
          <p className="text-green-400 text-[9px] font-bold uppercase tracking-[0.15em]">
            {team.name}
          </p>
        </div>

        {/* Green glow border on hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-green-400/50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </div>
    </motion.div>
  );
}
