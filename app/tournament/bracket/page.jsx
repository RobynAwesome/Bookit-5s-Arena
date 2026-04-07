"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaDownload, FaShareAlt, FaTrophy } from "react-icons/fa";
import { toPng } from "html-to-image";
import Image from "next/image";
import { WORLD_CUP_TEAMS, teamImage } from "@/lib/worldCupTeams";

// Helper to determine if a team is on the winner's path
function isWinnerPath(roundIdx, match, rounds) {
  if (!match.winner) return false;
  // Final always winner
  if (roundIdx === rounds.length - 1) return true;
  // Find next round, see if winner is in next match
  const next = rounds[roundIdx + 1];
  if (!next) return false;
  return next.matches.some(
    (m) => m.teamA === match.winner || m.teamB === match.winner,
  );
}

// Helper to get team info from world cup data
function getTeamInfo(name) {
  return WORLD_CUP_TEAMS.find(
    (t) => t.name.toLowerCase() === name?.toLowerCase(),
  );
}

// Mock Knockout Data
const BRACKET_ROUNDS = [
  {
    title: "Quarter-Finals",
    matches: [
      {
        id: 1,
        teamA: "Brazil",
        scoreA: 3,
        teamB: "Germany",
        scoreB: 1,
        winner: "Brazil",
      },
      {
        id: 2,
        teamA: "Spain",
        scoreA: 2,
        teamB: "Portugal",
        scoreB: 2,
        pensA: 4,
        pensB: 5,
        winner: "Portugal",
      },
      {
        id: 3,
        teamA: "Argentina",
        scoreA: 1,
        teamB: "France",
        scoreB: 0,
        winner: "Argentina",
      },
      {
        id: 4,
        teamA: "England",
        scoreA: 0,
        teamB: "Italy",
        scoreB: 2,
        winner: "Italy",
      },
    ],
  },
  {
    title: "Semi-Finals",
    matches: [
      {
        id: 5,
        teamA: "Brazil",
        scoreA: 1,
        teamB: "Portugal",
        scoreB: 0,
        winner: "Brazil",
      },
      {
        id: 6,
        teamA: "Argentina",
        scoreA: 2,
        teamB: "Italy",
        scoreB: 1,
        winner: "Argentina",
      },
    ],
  },
  {
    title: "Final",
    matches: [
      {
        id: 7,
        teamA: "Brazil",
        scoreA: null,
        teamB: "Argentina",
        scoreB: null,
        winner: null,
      },
    ],
  },
];

export default function BracketPage() {
  const bracketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const downloadBracket = () => {
    if (!bracketRef.current) return;
    setDownloading(true);
    toPng(bracketRef.current, { cacheBust: true, backgroundColor: "#030712" })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "5s-arena-knockout-bracket.png";
        link.href = dataUrl;
        link.click();
        setDownloading(false);
      })
      .catch((err) => {
        console.error("Download failed", err);
        setDownloading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 pb-20 px-4 flex flex-col items-center overflow-hidden">
      <div className="max-w-6xl w-full text-center mb-10">
        <h1
          className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-4"
          style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
        >
          KNOCKOUT <span className="text-purple-500">BRACKET</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          The road to the 5s Arena World Cup Final. Export this bracket and
          share it with your squad.
        </p>

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={downloadBracket}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-lg disabled:opacity-50"
          >
            {downloading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <FaDownload />
            )}
            {downloading ? "Exporting..." : "Export as Image"}
          </button>
        </div>
      </div>

      {/* The Printable Bracket Container */}
      <div className="w-full max-w-7xl overflow-x-auto custom-scrollbar pb-8">
        <div
          ref={bracketRef}
          className="min-w-200 p-8 bg-gray-950 rounded-3xl relative flex justify-between gap-12"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at center, rgba(147, 51, 234, 0.05) 0%, rgba(3, 7, 18, 1) 70%)",
          }}
        >
          {/* SVG lines for bracket connections */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            width="100%"
            height="100%"
          >
            {BRACKET_ROUNDS.slice(0, -1).map((round, rIdx) => {
              const next = BRACKET_ROUNDS[rIdx + 1];
              return round.matches.map((match, mIdx) => {
                // Calculate y positions for lines
                const x1 = (rIdx + 0.95) * (100 / (BRACKET_ROUNDS.length - 1));
                const x2 = (rIdx + 1.05) * (100 / (BRACKET_ROUNDS.length - 1));
                const y1 = (mIdx + 1) * (100 / (round.matches.length + 1));
                // Find which match in next round this winner goes to
                const winner = match.winner;
                const nextMatchIdx = next.matches.findIndex(
                  (nm) => nm.teamA === winner || nm.teamB === winner,
                );
                if (nextMatchIdx === -1) return null;
                const y2 =
                  (nextMatchIdx + 1) * (100 / (next.matches.length + 1));
                // Animate winner path
                const isPath = isWinnerPath(rIdx, match, BRACKET_ROUNDS);
                return (
                  <motion.line
                    key={`line-${rIdx}-${mIdx}`}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke={isPath ? "#a855f7" : "#7c3aed"}
                    strokeWidth={isPath ? 5 : 2}
                    strokeDasharray={isPath ? "8 4" : "4 4"}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: rIdx * 0.2 + mIdx * 0.1 }}
                    style={{
                      filter: isPath
                        ? "drop-shadow(0 0 8px #a855f7)"
                        : undefined,
                    }}
                  />
                );
              });
            })}
          </svg>

          {BRACKET_ROUNDS.map((round, rIndex) => (
            <div
              key={round.title}
              className="flex-1 flex flex-col justify-around relative z-10"
            >
              <h3 className="text-center text-sm font-black text-purple-400 uppercase tracking-widest mb-10">
                {round.title}
              </h3>

              <div className="flex flex-col justify-around h-full gap-8 relative z-10">
                {round.matches.map((match, mIndex) => {
                  const isPath = isWinnerPath(rIndex, match, BRACKET_ROUNDS);
                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: rIndex * 0.2 + mIndex * 0.1 }}
                      className={`relative ${isPath ? "ring-4 ring-purple-500/60 animate-pulse-neon" : ""}`}
                    >
                      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative z-10">
                        {/* Team A */}
                        <div
                          className={`flex justify-between items-center px-4 py-3 border-b border-gray-800/50 ${match.winner === match.teamA ? "bg-purple-900/20" : ""}`}
                        >
                          <span className="flex items-center gap-2">
                            {/* Player profile, logo, or fallback */}
                            {(() => {
                              const info = getTeamInfo(match.teamA);
                              if (info?.profile) {
                                return (
                                  <Image
                                    src={info.profile}
                                    alt={info.player + " profile"}
                                    width={28}
                                    height={28}
                                    className="object-cover rounded-full border-2 border-purple-400 bg-gray-950 shadow-md"
                                    style={{ marginRight: 2 }}
                                  />
                                );
                              } else if (info?.logo) {
                                return (
                                  <Image
                                    src={info.logo}
                                    alt={match.teamA + " logo"}
                                    width={24}
                                    height={24}
                                    className="object-contain rounded-full border border-gray-700 bg-gray-950"
                                  />
                                );
                              }
                              return (
                                <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500 border border-gray-700">
                                  {match.teamA?.[0]}
                                </span>
                              );
                            })()}
                            <span
                              className={`text-sm font-bold ${match.winner === match.teamA ? "text-white" : "text-gray-400"}`}
                            >
                              {match.teamA}
                            </span>
                          </span>
                          <div className="flex gap-2">
                            {match.pensA && (
                              <span className="text-[10px] text-gray-500 font-mono">
                                ({match.pensA})
                              </span>
                            )}
                            <span
                              className={`font-mono text-sm font-black ${match.winner === match.teamA ? "text-purple-400" : "text-gray-500"}`}
                            >
                              {match.scoreA !== null ? match.scoreA : "-"}
                            </span>
                          </div>
                        </div>

                        {/* Team B */}
                        <div
                          className={`flex justify-between items-center px-4 py-3 ${match.winner === match.teamB ? "bg-purple-900/20" : ""}`}
                        >
                          <span className="flex items-center gap-2">
                            {/* Player profile, logo, or fallback */}
                            {(() => {
                              const info = getTeamInfo(match.teamB);
                              if (info?.profile) {
                                return (
                                  <Image
                                    src={info.profile}
                                    alt={info.player + " profile"}
                                    width={28}
                                    height={28}
                                    className="object-cover rounded-full border-2 border-purple-400 bg-gray-950 shadow-md"
                                    style={{ marginRight: 2 }}
                                  />
                                );
                              } else if (info?.logo) {
                                return (
                                  <Image
                                    src={info.logo}
                                    alt={match.teamB + " logo"}
                                    width={24}
                                    height={24}
                                    className="object-contain rounded-full border border-gray-700 bg-gray-950"
                                  />
                                );
                              }
                              return (
                                <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500 border border-gray-700">
                                  {match.teamB?.[0]}
                                </span>
                              );
                            })()}
                            <span
                              className={`text-sm font-bold ${match.winner === match.teamB ? "text-white" : "text-gray-400"}`}
                            >
                              {match.teamB}
                            </span>
                          </span>
                          <div className="flex gap-2">
                            {match.pensB && (
                              <span className="text-[10px] text-gray-500 font-mono">
                                ({match.pensB})
                              </span>
                            )}
                            <span
                              className={`font-mono text-sm font-black ${match.winner === match.teamB ? "text-purple-400" : "text-gray-500"}`}
                            >
                              {match.scoreB !== null ? match.scoreB : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Background Watermark for exported image */}
          <div className="absolute top-4 right-8 opacity-20 pointer-events-none flex items-center gap-2">
            <FaTrophy className="text-purple-500 text-3xl" />
            <span className="font-black text-white text-xl tracking-widest uppercase">
              5S ARENA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
