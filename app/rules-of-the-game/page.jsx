"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FaTrophy,
  FaHandshake,
  FaBan,
  FaUserPlus,
  FaFutbol,
  FaShieldAlt,
  FaTools,
  FaFileContract,
  FaChevronDown,
  FaArrowRight,
  FaBookOpen,
  FaListAlt,
} from "react-icons/fa";

/* ─── Chapter Data ───────────────────────────────────────── */
const CHAPTERS = [
  {
    id: "tournament-rules",
    title: "Tournament Rules",
    icon: FaTrophy,
    color: "#eab308",
    desc: "Learn how our World Cup-style tournament works — 8 groups, 6 teams each, classic knockout format.",
    content: [
      "🏆 Our tournament follows the classic UEFA Champions League group-stage format.",
      "8 groups with 6 teams each — every team plays against every other team in the group (home & away style).",
      "Top 2 teams from each group advance to the Round of 16.",
      "From the Round of 16 onwards, it's single-elimination knockout matches.",
      "Each match is played under standard 5-a-side rules (see General Rules below).",
      "A random generator is used to assign fixtures — fair play for everyone.",
      "Teams represent World Cup nations — choose your country at sign-up!",
      "⚠️ Tournament dates: 26 May – 31 May 2026.",
    ],
    links: [
      { label: "Sign-Up Rules →", href: "#signup" },
      { label: "5-a-Side Rules →", href: "#general" },
    ],
  },
  {
    id: "behavior",
    title: "Behavior on the Premises",
    icon: FaHandshake,
    color: "#3b82f6",
    desc: "Respect the grounds, respect each other. Simple rules to keep it fun for everyone.",
    content: [
      "🚬 Smoking is allowed anywhere on the premises EXCEPT inside the clubhouse.",
      "Any person behaving in a disorderly, abusive, rude, or rowdy manner will be asked to leave immediately.",
      "If they refuse to leave, the police will be contacted without hesitation.",
      "Spectators and supporters are the responsibility of the team managers.",
      "Maintain sportsmanlike conduct at all times — on and off the field.",
      "Arrive on time for your scheduled matches. Late arrivals may forfeit.",
      "No fighting, intimidation, or threatening behavior. Zero tolerance.",
      "Respect staff, referees, and fellow players at all times.",
      "Keep the facilities clean — dispose of waste in designated bins.",
      "Children must be supervised by a responsible adult at all times.",
    ],
  },
  {
    id: "drugs",
    title: "Drugs & Illegal Substances",
    icon: FaBan,
    color: "#ef4444",
    desc: "Zero tolerance. No exceptions. This keeps everyone safe.",
    content: [
      "🚫 The use, possession, or distribution of any illegal substances is STRICTLY PROHIBITED.",
      "Any person found with drugs or illegal substances will be immediately removed from the premises.",
      "The police will be contacted, and the individual will be permanently banned.",
      "This includes any performance-enhancing substances not prescribed by a medical professional.",
      "Excessive alcohol consumption leading to disorderly behavior will also result in removal.",
      "All bags and personal items may be subject to inspection by security.",
      "Report any suspicious activity to staff immediately.",
    ],
  },
  {
    id: "signup",
    title: "How to Sign Up",
    icon: FaUserPlus,
    color: "#22c55e",
    desc: "Everything you need to know about registering your team for the tournament.",
    content: [
      "📝 Sign-ups open the day after the website launches.",
      "⚠️ DEADLINE: Sign-ups close exactly ONE WEEK before the tournament starts.",
      "**IF YOU DO NOT COMPLY WITH THE DEADLINE, YOUR TEAM WILL NOT BE ALLOWED TO SIGN UP. IF YOU MISS THE DEADLINE, YOUR TEAM WILL BE REMOVED FROM OUR SYSTEM AND NETWORK ENTIRELY.**",
      "Each team must have exactly 5 registered players + 1 team manager.",
      "The team manager is responsible for all communications and compliance.",
      "During sign-up, choose your preferred communication method: SMS, Email, or WhatsApp.",
      "Select which World Cup team you want to represent (first come, first served).",
      "You may add up to 3 reserve players and 3 support staff (water carriers, trainers, etc.).",
      "After sign-up, a copy of all rules will be sent to your preferred communication channel.",
      "Managers are fully accountable for their team's compliance with all deadlines and rules.",
    ],
  },
  {
    id: "competition",
    title: "Competition Rules",
    icon: FaTrophy,
    color: "#a855f7",
    desc: "Structure, points, and standings — how our league system works.",
    content: [
      "📊 Competition standings are calculated using the standard points system:",
      "Win = 3 points | Draw = 1 point | Loss = 0 points.",
      "Goal difference is used as the first tiebreaker.",
      "Head-to-head record is used as the second tiebreaker.",
      "Goals scored is the third tiebreaker.",
      "If still tied, a playoff match will be held.",
      "All competition fixtures are generated randomly and announced via your preferred channel.",
      "Forfeited matches result in a 3-0 loss for the forfeiting team.",
      "Two forfeits = automatic disqualification from the competition.",
    ],
  },
  {
    id: "general",
    title: "General Rules",
    icon: FaFutbol,
    color: "#06b6d4",
    desc: "The core rules of 5-a-side football as played at 5s Arena.",
    content: [
      "⚽ Each match is 20 minutes long (2 x 10 minute halves with 2 min break).",
      "NO slide tackles — this is a hard rule. Violation = yellow card.",
      "Rolling substitutions are allowed at any time during play.",
      "Teams consist of 5 players (4 outfield + 1 goalkeeper).",
      "The goalkeeper may not cross the halfway line.",
      "Kick-ins replace throw-ins (the ball must be stationary on the sideline).",
      "Goals can be scored from anywhere on the pitch.",
      "No offside rule applies.",
      "Direct free kicks are awarded for fouls — the wall must be 3 meters away.",
      "Penalty kicks are taken from the designated penalty spot.",
      "The referee's decision is final in all matters.",
      "Shin guards are mandatory for all players.",
      "Only appropriate football boots or astro turf shoes are allowed.",
    ],
  },
  {
    id: "equipment",
    title: "Respecting the Equipment",
    icon: FaTools,
    color: "#f97316",
    desc: "Take care of the facilities. Break it? You pay for it.",
    content: [
      "🔧 All equipment, goals, nets, and pitch facilities are the property of 5s Arena / Hellenic Football Club.",
      "Any intentional damage to equipment will result in immediate financial liability.",
      "**IF YOU DAMAGE EQUIPMENT, YOU WILL PAY FOR THE FULL COST OF REPAIR OR REPLACEMENT.**",
      "Do not move goals, barriers, or any fixed equipment without staff permission.",
      "Report any damaged or faulty equipment to staff immediately.",
      "Do not bring glass bottles or containers onto the playing field.",
      "Clean up after yourself — leave the pitch and changing rooms as you found them.",
      "Equipment provided for matches (bibs, balls) must be returned after use.",
    ],
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    icon: FaFileContract,
    color: "#64748b",
    desc: "The legal stuff. Read it, tick the box, play the game.",
    content: [
      "📜 By participating in any 5s Arena event, you agree to all rules outlined on this page.",
      "Participants play at their own risk. 5s Arena and Hellenic Football Club are not liable for injuries sustained during play.",
      "All participants must be 16 years or older. Under-16s require parental/guardian consent.",
      "Personal belongings are the responsibility of the individual. We are not liable for lost or stolen items.",
      "5s Arena reserves the right to refuse entry or remove any person from the premises without refund.",
      "5s Arena reserves the right to modify rules, schedules, and pricing at any time.",
      "Photography and video recording may occur during events. By attending, you consent to being recorded.",
      "Refunds for tournament registration are available up to 48 hours before the event. No refunds after.",
      "All disputes will be resolved by 5s Arena management. Their decision is final.",
      "These terms are governed by the laws of the Republic of South Africa.",
      "By registering, you confirm that all information provided is accurate and truthful.",
    ],
  },
];

/* ═══════════════════════════════════════════════════════════ */
export default function RulesOfTheGamePage() {
  const [activeChapter, setActiveChapter] = useState(null);
  const [quickJump, setQuickJump] = useState("");

  const handleQuickJump = (val) => {
    setQuickJump(val);
    if (val) {
      setActiveChapter(val);
      document
        .getElementById(val)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Animated Brand Logo */}
      <div className="flex flex-col items-center justify-center pt-16 pb-4">
        <div className="relative w-32 h-32 mb-4 animate-bounce-slow">
          <img
            src="/images/logo.png"
            alt="Bookit 5s Arena Logo"
            className="w-full h-full object-contain rounded-full"
            style={{ animation: "spin 8s linear infinite" }}
          />
        </div>
      </div>
      {/* Hero */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-green-900/20 to-gray-950" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FaBookOpen className="mx-auto text-green-400 mb-4" size={40} />
            <h1
              className="font-black uppercase leading-tight mb-4"
              style={{
                fontSize: "clamp(2rem, 6vw, 4rem)",
                fontFamily: "Impact, Arial Black, sans-serif",
              }}
            >
              RULES OF THE <span className="text-green-400">GAME</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to know before stepping on the pitch. Click on
              any chapter below to learn more!
            </p>
          </motion.div>

          {/* Quick Jump Dropdown */}
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative">
              <select
                value={quickJump}
                onChange={(e) => handleQuickJump(e.target.value)}
                className="appearance-none bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm text-gray-300 outline-none focus:border-green-500 cursor-pointer"
              >
                <option value="">⚡ Quick Jump to Chapter...</option>
                {CHAPTERS.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}
                  </option>
                ))}
              </select>
              <FaChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={12}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Chapters Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHAPTERS.map((chapter, _i) => {
            const Icon = chapter.icon;
            const isActive = activeChapter === chapter.id;

            return (
              <motion.div
                key={chapter.id}
                id={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: _i * 0.06, duration: 0.5 }}
              >
                <motion.button
                  onClick={() => setActiveChapter(isActive ? null : chapter.id)}
                  className="w-full text-left p-5 rounded-2xl border transition-all cursor-pointer"
                  style={{
                    borderColor: isActive
                      ? chapter.color
                      : "rgba(55,65,81,0.5)",
                    background: isActive
                      ? `linear-gradient(135deg, ${chapter.color}10, ${chapter.color}05)`
                      : "rgba(17,24,39,0.5)",
                  }}
                  whileHover={{
                    scale: 1.02,
                    borderColor: chapter.color,
                    boxShadow: `0 0 20px ${chapter.color}20`,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${chapter.color}20` }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon size={20} style={{ color: chapter.color }} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                          {chapter.title}
                        </h3>
                        <motion.span
                          animate={{ rotate: isActive ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaChevronDown
                            size={12}
                            style={{ color: chapter.color }}
                          />
                        </motion.span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                        {chapter.desc}
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 py-4 space-y-2">
                        {chapter.content.map((line, _j) => (
                          <motion.p
                            key={_j}
                            className={`text-sm leading-relaxed ${
                              line.startsWith("**")
                                ? "text-red-400 font-black text-xs uppercase tracking-wider bg-red-900/20 p-3 rounded-lg border border-red-800/30"
                                : line.startsWith("⚠")
                                  ? "text-amber-400 font-semibold"
                                  : "text-gray-300"
                            }`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: _j * 0.03 }}
                          >
                            {line.replace(/\*\*/g, "")}
                          </motion.p>
                        ))}
                        {chapter.links && (
                          <div className="flex gap-3 pt-3">
                            {chapter.links.map((link) => (
                              <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const id = link.href.replace("#", "");
                                  setActiveChapter(id);
                                  document
                                    .getElementById(id)
                                    ?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all"
                                style={{
                                  color: chapter.color,
                                  borderColor: `${chapter.color}40`,
                                }}
                              >
                                {link.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Tabs */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              title: "Ready to Play?",
              desc: "Now that you know the rules, grab your squad and book a court.",
              href: "/#courts",
              color: "#22c55e",
              icon: FaFutbol,
            },
            {
              title: "Book an Event",
              desc: "Birthdays, corporate days, and more — book your next big event.",
              href: "/events-and-services",
              color: "#3b82f6",
              icon: FaShieldAlt,
            },
            {
              title: "Register for Tournament",
              desc: "Join the World Cup-style tournament. Sign up your team now!",
              href: "/tournament",
              color: "#eab308",
              icon: FaTrophy,
            },
            {
              title: "Competitions",
              desc: "Explore all 5s Arena competitions — leagues, tournaments and more.",
              href: "/leagues",
              color: "#ef4444",
              icon: FaListAlt,
            },
          ].map((cta, _i) => {
            const Icon = cta.icon;
            return (
              <motion.div
                key={cta.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: _i * 0.1 }}
              >
                <Link href={cta.href}>
                  <motion.div
                    className="p-6 rounded-2xl border text-center cursor-pointer h-full"
                    style={{
                      borderColor: `${cta.color}30`,
                      background: `${cta.color}08`,
                    }}
                    whileHover={{
                      scale: 1.03,
                      borderColor: cta.color,
                      boxShadow: `0 0 30px ${cta.color}25`,
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Icon
                      size={28}
                      style={{ color: cta.color }}
                      className="mx-auto mb-3"
                    />
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2">
                      {cta.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-3">{cta.desc}</p>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                      style={{ color: cta.color }}
                    >
                      Go <FaArrowRight size={10} />
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
