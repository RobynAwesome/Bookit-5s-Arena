"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaCode,
  FaServer,
  FaCogs,
  FaCheckCircle,
  FaCopy,
} from "react-icons/fa";

export default function ApiDocsPage() {
  const [copied, setCopied] = useState("");

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-64 shrink-0">
          <div className="sticky top-24 bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-green-400 mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
              <FaCogs /> API Reference
            </h3>
            <ul className="space-y-3 text-xs text-gray-400 font-bold uppercase tracking-wide">
              <li>
                <a href="#intro" className="hover:text-white transition">
                  Introduction
                </a>
              </li>
              <li>
                <a
                  href="#auth"
                  className="transition duration-200 hover:scale-105 hover:text-green-400"
                >
                  Authentication
                </a>
              </li>
              <li>
                <a
                  href="#teams"
                  className="transition duration-200 hover:scale-105 hover:text-blue-400"
                >
                  Get Teams
                </a>
              </li>
              <li>
                <a
                  href="#stats"
                  className="transition duration-200 hover:scale-105 hover:text-yellow-400"
                >
                  Tournament Stats
                </a>
              </li>
              <li>
                <a
                  href="#fixtures"
                  className="transition duration-200 hover:scale-105 hover:text-pink-400"
                >
                  Fixtures
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-12">
          <div id="intro">
            <h1
              className="text-3xl font-black uppercase tracking-widest text-white mb-4"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              5s Arena <span className="text-blue-400">Public API</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mb-4">
              Welcome to the 5s Arena developer documentation. Use our RESTful
              endpoints to query live tournament data, team rosters, and
              schedule information to build your own companion tools or
              visualizations.
            </p>
            <div className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-xs text-yellow-400 font-bold">
              <FaServer size={12} /> Base URL:{" "}
              <span className="text-white select-all">
                https://fivesarena.com/api/v1
              </span>
            </div>
          </div>

          <div
            id="auth"
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-3">
              Authentication
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              All public read endpoints (GET) are unauthenticated and heavily
              rate-limited (100 req/min per IP). For elevated access or write
              endpoints, include your API Bearer token in the request header.
            </p>
            <div className="bg-black/50 border border-gray-800 rounded-xl p-4 relative group">
              <button
                onClick={() =>
                  copyToClipboard("Authorization: Bearer YOUR_API_KEY", "auth")
                }
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
              >
                {copied === "auth" ? (
                  <FaCheckCircle className="text-green-500 animate-bounce" />
                ) : (
                  <FaCopy className="group-hover:animate-pulse" />
                )}
              </button>
              <code className="text-sm text-green-400">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
          </div>

          <div id="teams" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-2 flex items-center gap-3">
              <span className="bg-green-600 text-white px-2 py-1 rounded text-[10px] tracking-widest">
                GET
              </span>
              List Teams
            </h2>
            <p className="text-xs text-gray-400 mb-2">
              Retrieve a paginated list of registered World Cup teams.
            </p>

            <div className="bg-black/50 border border-gray-800 rounded-xl p-4 mb-4 select-all">
              <code className="text-sm text-gray-300">
                GET /tournament/teams?status=approved&limit=10
              </code>
            </div>

            <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">
              Example Response:
            </h4>
            <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-4 overflow-x-auto">
              <pre className="text-xs text-blue-300">
                {`{
  "success": true,
  "data": [
    {
      "id": "team_123xyz",
      "teamName": "Milnerton All Stars",
      "nation": "Argentina",
      "playersCount": 7,
      "status": "approved"
    }
  ],
  "pagination": { "total": 48, "page": 1 }
}`}
              </pre>
            </div>
          </div>

          <div id="stats" className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-2 flex items-center gap-3">
              <span className="bg-green-600 text-white px-2 py-1 rounded text-[10px] tracking-widest">
                GET
              </span>
              Tournament Stats
            </h2>
            <p className="text-xs text-gray-400 mb-2">
              Get real-time registration counts and capacity metrics.
            </p>

            <div className="bg-black/50 border border-gray-800 rounded-xl p-4 mb-4 select-all">
              <code className="text-sm text-gray-300">
                GET /tournament/stats
              </code>
            </div>

            <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">
              Example Response:
            </h4>
            <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-4 overflow-x-auto">
              <pre className="text-xs text-green-300">
                {`{
  "totalSlots": 48,
  "registeredCount": 32,
  "utilization": 0.66,
  "nationsRemaining": 16,
  "daysUntilKickoff": 24
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
