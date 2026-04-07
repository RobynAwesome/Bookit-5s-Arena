"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaTh, FaList, FaCheck } from "react-icons/fa";
import { WORLD_CUP_TEAMS, logoImage } from "@/lib/worldCupTeams";

/* ── Particle burst styles ── */
const burstStyle = `
@keyframes ripple-ring {
  0% { transform: scale(0); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
}
`;

export default function CountrySelector({ selectedTeam, onSelect }) {
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [particles, setParticles] = useState([]);
  const [ripples, setRipples] = useState([]);

  const isSelected = (team) => selectedTeam?.includes(team.name);

  const handleSelect = useCallback(
    (team) => {
      onSelect(`${team.name} (${team.player})`);

      /* Particle burst */
      const newParticles = Array.from({ length: 14 }, (_, i) => ({
        id: `${team.name}-${Date.now()}-${i}`,
        angle: (i / 14) * 360,
        distance: 40 + Math.random() * 60,
        size: 3 + Math.random() * 5,
        color: ["#22c55e", "#4ade80", "#86efac", "#fbbf24"][
          Math.floor(Math.random() * 4)
        ],
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 800);

      /* Ripple rings */
      const newRipples = [0, 150, 300].map((delay, i) => ({
        id: `ripple-${Date.now()}-${i}`,
        delay,
      }));
      setRipples(newRipples);
      setTimeout(() => setRipples([]), 1200);
    },
    [onSelect],
  );

  return (
    <div className="rounded-2xl p-5">
      <style dangerouslySetInnerHTML={{ __html: burstStyle }} />

      {/* Header + view toggle */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-green-400 text-xs font-bold uppercase tracking-widest">
          Choose Your Country
        </h3>
        <div className="flex gap-1 bg-gray-800/80 rounded-full p-1 border border-gray-700">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${viewMode === "grid" ? "bg-green-600 text-white" : "text-gray-500 hover:text-white"}`}
          >
            <FaTh size={9} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${viewMode === "list" ? "bg-green-600 text-white" : "text-gray-500 hover:text-white"}`}
          >
            <FaList size={9} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[420px] overflow-y-auto pr-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {WORLD_CUP_TEAMS.map((team, i) => (
              <GridItem
                key={team.name}
                team={team}
                index={i}
                selected={isSelected(team)}
                onSelect={handleSelect}
                particles={isSelected(team) ? particles : []}
                ripples={isSelected(team) ? ripples : []}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className="space-y-2 max-h-[420px] overflow-y-auto pr-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {WORLD_CUP_TEAMS.map((team, i) => (
              <ListItem
                key={team.name}
                team={team}
                index={i}
                selected={isSelected(team)}
                onSelect={handleSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Grid Item ── */
function GridItem({ team, index, selected, onSelect, particles, ripples }) {
  const [isHovered, setIsHovered] = useState(false);
  const logo = logoImage(team);

  return (
    <motion.button
      className={`relative flex flex-col items-center p-3 rounded-xl text-center transition-colors cursor-pointer overflow-visible ${
        selected
          ? "bg-green-900/20"
          : "hover:bg-white/5"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.015, type: "spring", stiffness: 200, damping: 20 }}
      style={{ transformOrigin: "center" }}
      whileHover={{
        scale: 1.15,
        y: -8,
        zIndex: 50,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(team)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow pulse for selected */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(34,197,94,0)",
              "0 0 20px 4px rgba(34,197,94,0.3)",
              "0 0 0 0 rgba(34,197,94,0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Hover glow ring */}
      {isHovered && !selected && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-green-400/30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {/* Logo image */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2 flex items-center justify-center">
        {logo ? (
          <Image
            src={logo}
            alt={team.name}
            fill
            className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            sizes="80px"
          />
        ) : (
          <div
            className="w-full h-full rounded-xl flex items-center justify-center text-2xl font-black"
            style={{
              background: `linear-gradient(135deg, ${stringToColor(team.name)}22, ${stringToColor(team.name)}44)`,
              color: stringToColor(team.name),
            }}
          >
            {team.name[0]}
          </div>
        )}

        {/* Checkmark stamp */}
        <AnimatePresence>
          {selected && (
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <FaCheck size={10} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Country name */}
      <p
        className={`text-[10px] font-bold leading-tight ${selected ? "text-green-400" : "text-white"}`}
      >
        {team.name}
      </p>
      <p className="text-[8px] text-gray-500 font-medium mt-0.5 leading-tight">
        {team.player}
      </p>

      {/* Particle burst */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute pointer-events-none rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              left: "50%",
              top: "50%",
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
              y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
              scale: 0,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Ripple rings */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute inset-0 rounded-xl border-2 border-green-400/40 pointer-events-none"
          style={{
            animation: `ripple-ring 0.8s ease-out ${r.delay}ms forwards`,
          }}
        />
      ))}

      {/* Hover tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-gray-800/95 border border-gray-700 whitespace-nowrap pointer-events-none z-50"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            <span className="text-[8px] font-bold text-green-400 uppercase tracking-wider">
              {team.player}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ── List Item ── */
function ListItem({ team, index, selected, onSelect }) {
  const logo = logoImage(team);

  return (
    <motion.button
      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer ${
        selected
          ? "bg-green-900/20"
          : "hover:bg-white/5"
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(team)}
    >
      {/* Logo */}
      <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
        {logo ? (
          <Image
            src={logo}
            alt={team.name}
            fill
            className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            sizes="48px"
          />
        ) : (
          <div
            className="w-full h-full rounded-lg flex items-center justify-center text-lg font-black"
            style={{
              background: `linear-gradient(135deg, ${stringToColor(team.name)}22, ${stringToColor(team.name)}44)`,
              color: stringToColor(team.name),
            }}
          >
            {team.name[0]}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-left">
        <p
          className={`text-sm font-bold ${selected ? "text-green-400" : "text-white"}`}
        >
          {team.name}
        </p>
        <p className="text-[10px] text-gray-500">{team.player}</p>
      </div>

      {/* Selected check */}
      {selected && (
        <motion.div
          className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <FaCheck size={10} className="text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}

/* ── Utility: deterministic color from string ── */
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
}
