"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FaGithub,
  FaLinkedin,
  FaWhatsapp,
  FaCode,
  FaPaintBrush,
  FaServer,
  FaFutbol,
  FaArrowRight,
  FaEnvelope,
  FaCoffee,
  FaPaypal,
  FaHeart,
  FaRocket,
  FaDatabase,
  FaMobileAlt,
  FaGlobe,
} from "react-icons/fa";
import {
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiMongodb,
  SiFramer,
  SiStripe,
  SiNodedotjs,
  SiJavascript,
} from "react-icons/si";

/* ════════════════════════════════════════════════════════════════
   WELCOME ANIMATION — 5-second intro sequence
   ════════════════════════════════════════════════════════════════ */

const COLORS = [
  "#22c55e",
  "#06b6d4",
  "#f59e0b",
  "#a855f7",
  "#ef4444",
  "#f472b6",
  "#34d399",
  "#fb923c",
];

/* Firework particle on click */
function Firework({ x, y, onDone }) {
  const particles = useMemo(() => Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * 360;
    const dist = 60 + Math.random() * 80; // eslint-disable-line react-hooks/purity
    return {
      dx: Math.cos((angle * Math.PI) / 180) * dist,
      dy: Math.sin((angle * Math.PI) / 180) * dist,
      color: COLORS[i % COLORS.length],
      // eslint-disable-next-line react-hooks/purity
      dur: 0.8 + Math.random() * 0.3,
    };
  }), []);

  useEffect(() => {
    const t = setTimeout(onDone, 1000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed pointer-events-none z-9999"
      style={{ left: x, top: y }}
    >
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ background: p.color, left: -4, top: -4 }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0 }}
          transition={{ duration: p.dur, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function WelcomeAnimation({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [fireworks, setFireworks] = useState([]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2200),
      setTimeout(() => setPhase(3), 3800),
      setTimeout(() => onComplete(), 5200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleClick = useCallback((e) => {
    const id = Date.now();
    setFireworks((fw) => [...fw, { id, x: e.clientX, y: e.clientY }]);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-9998 flex items-center justify-center overflow-hidden cursor-pointer"
      style={{
        background: "radial-gradient(ellipse at center, #0a0a1a 0%, #000 100%)",
      }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.7 }}
      onClick={handleClick}
    >
      {/* Animated orbs and subtle gradients */}
      {COLORS.map((color, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none blur-3xl opacity-20"
          style={{
            width: 300,
            height: 300,
            background: color,
            left: `${5 + ((i * 12) % 90)}%`,
            top: `${10 + ((i * 17) % 80)}%`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 15, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Animated circular brand logo centerpiece */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 180 }}
      >
        <motion.div
          className="w-40 h-40 md:w-56 md:h-56 rounded-full mb-8 shadow-[0_0_60px_rgba(34,197,94,0.25)] border-4 border-green-500/40 bg-black/60 flex items-center justify-center"
          style={{ boxShadow: "0 0 80px #22c55e33, 0 0 0px #fff0" }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/images/logo.png"
            alt="Bookit 5s Arena Logo"
            width={192}
            height={192}
            className="w-36 h-36 md:w-48 md:h-48 object-contain drop-shadow-[0_0_40px_rgba(34,197,94,0.25)] rounded-full"
            style={{ animation: "spin 8s linear infinite" }}
          />
        </motion.div>
        <motion.p
          className="text-xs font-black uppercase tracking-[0.4em] mb-5"
          style={{
            background: "linear-gradient(90deg, #22c55e, #06b6d4, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ type: "spring", stiffness: 200 }}
        >
          Welcome to Bookit 5s Arena
        </motion.p>
      </motion.div>

      {/* Flash on exit */}
      <AnimatePresence>
        {phase === 3 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, #22c55e20, #a855f720, #f59e0b20)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      {/* Fireworks */}
      {fireworks.map((fw) => (
        <Firework
          key={fw.id}
          x={fw.x}
          y={fw.y}
          onDone={() => setFireworks((f) => f.filter((f) => f.id !== fw.id))}
        />
      ))}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════════ */

const TECH_STACK = [
  {
    name: "React 19",
    icon: SiReact,
    color: "#61dafb",
    desc: "Component-driven UIs, hooks, state management",
  },
  {
    name: "Next.js 16",
    icon: SiNextdotjs,
    color: "#ffffff",
    desc: "App Router, SSR, API routes, middleware",
  },
  {
    name: "JavaScript",
    icon: SiJavascript,
    color: "#f7df1e",
    desc: "ES2024+, async/await, DOM, Web APIs",
  },
  {
    name: "Node.js",
    icon: SiNodedotjs,
    color: "#68a063",
    desc: "Express, REST APIs, server-side logic",
  },
  {
    name: "MongoDB",
    icon: SiMongodb,
    color: "#47a248",
    desc: "Mongoose ODM, aggregation, indexing",
  },
  {
    name: "Tailwind CSS",
    icon: SiTailwindcss,
    color: "#06b6d4",
    desc: "Utility-first, responsive, v4 migration",
  },
  {
    name: "Framer Motion",
    icon: SiFramer,
    color: "#a855f7",
    desc: "Page transitions, scroll animations, gestures",
  },
  {
    name: "Stripe",
    icon: SiStripe,
    color: "#635bff",
    desc: "Checkout, webhooks, payment links",
  },
];

const PROJECTS = [
  {
    name: "Bookit 5s Arena",
    desc: "Full-stack management and booking system for a 5-a-side football venue. Features real-time booking, team management, payment integration, and admin dashboard.",
    icon: FaFutbol,
    color: "#22c55e",
    link: "/",
    tags: ["Next.js", "MongoDB", "Stripe", "SSE", "NextAuth"],
    github: "https://github.com/RobynAwesome/Bookit-5s-Arena",
  },
  {
    name: "5s Arena Blog",
    desc: "MERN stack community blog platform with full authentication, role-based access control (RBAC), image uploads, rich text editing, and responsive design.",
    icon: FaPaintBrush,
    color: "#06b6d4",
    link: "https://github.com/RobynAwesome/5s-Arena-Blog",
    tags: ["React", "Vite", "Express", "MongoDB"],
    github: "https://github.com/RobynAwesome/5s-Arena-Blog",
  },
  {
    name: "Portfolio Website",
    desc: "Modern, animated, multi-page React application showcasing skills, projects, and experience with smooth Framer Motion transitions. Fully open source.",
    icon: FaGlobe,
    color: "#f59e0b",
    link: "https://kholofelorababalela.vercel.app/",
    tags: ["React", "TypeScript", "TailwindCSS", "Framer Motion"],
    github: "https://github.com/RobynAwesome/Portfolio",
  },
];

const SOCIAL_LINKS = [
  {
    label: "Portfolio",
    icon: FaGlobe,
    url: "https://kholofelorababalela.vercel.app/",
    color: "#22c55e",
  },
  {
    label: "GitHub",
    icon: FaGithub,
    url: "https://github.com/RobynAwesome",
    color: "#f0f6fc",
  },
  {
    label: "LinkedIn",
    icon: FaLinkedin,
    url: "https://www.linkedin.com/in/kholofelo-robyn-rababalela-7a26273b6/",
    color: "#0a66c2",
  },
  {
    label: "Email",
    icon: FaEnvelope,
    url: "mailto:rkholofelo@gmail.com",
    color: "#ea4335",
  },
  {
    label: "WhatsApp",
    icon: FaWhatsapp,
    url: "https://wa.me/27637820245",
    color: "#25d366",
  },
];

const SUPPORT_LINKS = [
  {
    label: "Ko-fi",
    icon: FaCoffee,
    url: "https://ko-fi.com/robynawesome",
    color: "#29abe0",
    desc: "Buy me a coffee",
  },
  {
    label: "PayPal",
    icon: FaPaypal,
    url: "https://www.paypal.me/osheenviews",
    color: "#003087",
    desc: "Donate directly",
  },
];

const CAPABILITIES = [
  {
    icon: FaCode,
    label: "Frontend",
    desc: "React, Next.js, TypeScript, TailwindCSS",
  },
  {
    icon: FaServer,
    label: "Backend",
    desc: "Node.js, Express, REST APIs, SSE",
  },
  {
    icon: FaDatabase,
    label: "Database",
    desc: "MongoDB, Mongoose ODM, aggregation",
  },
  {
    icon: FaMobileAlt,
    label: "Responsive Design",
    desc: "Mobile-first, all breakpoints",
  },
  {
    icon: FaPaintBrush,
    label: "Animation",
    desc: "Framer Motion, transitions, gestures",
  },
  { icon: FaGlobe, label: "Deployment", desc: "Vercel, Git, Docker, Firebase" },
];

const STATS = [
  { value: "51", label: "Pages Built", icon: FaRocket },
  { value: "53", label: "API Routes", icon: FaServer },
  { value: "10", label: "DB Models", icon: FaDatabase },
  { value: "41", label: "Components", icon: FaCode },
];

/* ════════════════════════════════════════════════════════════════
   COMPONENTS
   ════════════════════════════════════════════════════════════════ */

function TechCard({ tech, index }) {
  const Icon = tech.icon;
  return (
    <motion.div
      className="group relative bg-gray-900/60 border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition-all overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 200 }}
      whileHover={{ y: -4, borderColor: tech.color + "60" }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${tech.color}08 0%, transparent 70%)`,
        }}
      />
      <div className="flex items-center gap-4 relative z-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: tech.color + "15" }}
        >
          <Icon size={20} style={{ color: tech.color }} />
        </div>
        <div>
          <p className="text-white font-bold text-sm">{tech.name}</p>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            {tech.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectCard({ project, index }) {
  const Icon = project.icon;
  const isExternal = project.link.startsWith("http");
  const linkProps = isExternal
    ? { href: project.link, target: "_blank", rel: "noopener noreferrer" }
    : { href: project.link };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.12, type: "spring", stiffness: 180 }}
    >
      <motion.div
        className="group relative bg-gray-900/80 border border-gray-800 rounded-3xl p-8 h-full overflow-hidden"
        whileHover={{ y: -6, borderColor: project.color + "50" }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${project.color}10 0%, transparent 60%)`,
          }}
        />

        <div className="relative z-10">
          {/* Icon + Title */}
          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: `${project.color}15`,
                border: `1px solid ${project.color}25`,
              }}
            >
              <Icon size={24} style={{ color: project.color }} />
            </div>
            <div>
              <h3
                className="text-white font-black text-lg uppercase tracking-wider"
                style={{ fontFamily: "Impact, sans-serif" }}
              >
                {project.name}
              </h3>
              <div className="flex gap-2 mt-1 flex-wrap">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{
                      background: project.color + "15",
                      color: project.color,
                      border: `1px solid ${project.color}25`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {project.desc}
          </p>

          {/* CTA */}
          <div className="flex items-center justify-between">
            {isExternal ? (
              <a
                {...linkProps}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest no-underline group-hover:translate-x-1 transition-transform"
                style={{ color: project.color }}
              >
                View Project <FaArrowRight size={9} />
              </a>
            ) : (
              <Link
                {...linkProps}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest no-underline group-hover:translate-x-1 transition-transform"
                style={{ color: project.color }}
              >
                View Project <FaArrowRight size={9} />
              </Link>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-white transition-colors"
              >
                <FaGithub size={16} />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */

export default function CreatorPage() {
  const [welcomeDone, setWelcomeDone] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!welcomeDone && (
          <WelcomeAnimation
            key="welcome"
            onComplete={() => setWelcomeDone(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {welcomeDone && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gray-950 min-h-screen"
          >
            {/* ═══ HERO ═══════════════════════════════════════════ */}
            <section className="relative overflow-hidden pt-28 pb-20 px-4">
              {/* Background gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, #030712 0%, #0d1117 30%, #0f1729 60%, #030712 100%)",
                }}
              />
              {/* Animated orbs */}
              {COLORS.map((color, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full pointer-events-none blur-3xl"
                  style={{
                    width: 250,
                    height: 250,
                    background: color + "12",
                    left: `${10 + i * 20}%`,
                    top: `${20 + (i % 2) * 30}%`,
                  }}
                  animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0] }}
                  transition={{
                    duration: 8 + i * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}

              <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Universal Creator Icon */}
                <motion.div
                  className="w-36 h-36 rounded-full mx-auto mb-8 overflow-hidden border-4 border-blue-400/30 shadow-[0_0_40px_rgba(59,130,246,0.3)] bg-linear-to-br from-blue-500/30 to-green-400/20 flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 150, damping: 15 }}
                >
                  <FaPaintBrush
                    size={80}
                    className="text-blue-400 drop-shadow-lg"
                  />
                </motion.div>

                {/* Universal Welcome Title */}
                <motion.h1
                  className="text-white mb-2 text-3xl md:text-4xl font-extrabold tracking-tight"
                  style={{
                    fontFamily: "Impact, sans-serif",
                    fontSize: "clamp(2rem, 8vw, 4.5rem)",
                    letterSpacing: "0.03em",
                    lineHeight: 1,
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-green-400">KHOLOFELO</span> ROBYN
                </motion.h1>
                <motion.p
                  className="text-gray-300 font-black text-lg uppercase tracking-[0.15em] mb-2"
                  style={{ fontFamily: "Impact, sans-serif" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  RABABALELA
                </motion.p>

                {/* Title badges */}
                <motion.div
                  className="flex justify-center gap-3 flex-wrap mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  {[
                    "Full-Stack MERN Developer",
                    "Computer Engineering Student",
                    "Cape Town, South Africa",
                  ].map((title, i) => (
                    <span
                      key={title}
                      className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border"
                      style={{
                        color: COLORS[i],
                        borderColor: COLORS[i] + "30",
                        background: COLORS[i] + "10",
                      }}
                    >
                      {title}
                    </span>
                  ))}
                </motion.div>

                {/* Bio */}
                <motion.p
                  className="text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  Computer Engineering student at Cape Peninsula University of
                  Technology (CPUT), specializing in full-stack web development.
                  I design and develop UIs with a focus on UX, responsiveness,
                  performance, and maintainability. Creator of the Bookit 5s
                  Arena platform and the 5s Arena Blog — built from scratch with
                  the MERN stack.
                </motion.p>

                {/* Social links */}
                <motion.div
                  className="flex justify-center gap-3 flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  {SOCIAL_LINKS.map(({ label, icon: Icon, url, color }) => (
                    <motion.a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all"
                      style={{
                        borderColor: color + "25",
                        background: color + "08",
                      }}
                      whileHover={{
                        y: -3,
                        borderColor: color + "60",
                        background: color + "20",
                        boxShadow: `0 8px 24px ${color}25`,
                      }}
                      whileTap={{ scale: 0.95 }}
                      title={label}
                    >
                      <Icon size={18} style={{ color }} />
                    </motion.a>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* ═══ STATS BAR ══════════════════════════════════════ */}
            <section className="border-y border-gray-800 bg-gray-900/50">
              <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
                {STATS.map(({ value, label, icon: Icon }, i) => (
                  <motion.div
                    key={label}
                    className="py-8 px-4 text-center border-r border-gray-800 last:border-r-0"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Icon size={16} className="text-green-500 mx-auto mb-2" />
                    <p
                      className="text-white font-black text-2xl"
                      style={{ fontFamily: "Impact, sans-serif" }}
                    >
                      {value}
                    </p>
                    <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1">
                      {label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ═══ WHAT I DO ══════════════════════════════════════ */}
            <section className="py-20 px-4 bg-gray-950">
              <div className="max-w-5xl mx-auto">
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <p className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">
                    Capabilities
                  </p>
                  <h2
                    className="text-white text-3xl md:text-5xl font-black uppercase tracking-tight"
                    style={{ fontFamily: "Impact, sans-serif" }}
                  >
                    What I <span className="text-green-400">Build</span>
                  </h2>
                  <div className="h-1 w-12 bg-green-500 mx-auto mt-4 rounded-full" />
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {CAPABILITIES.map(({ icon: Icon, label, desc }, i) => (
                    <motion.div
                      key={label}
                      className="group bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center hover:border-green-500/30 transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ y: -4 }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-green-500/20 transition-colors">
                        <Icon size={20} className="text-green-400" />
                      </div>
                      <p className="text-white font-bold text-sm mb-1">
                        {label}
                      </p>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                        {desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══ TECH STACK ═════════════════════════════════════ */}
            <section
              className="py-20 px-4"
              style={{
                background: "linear-gradient(180deg, #0d1117, #030712)",
              }}
            >
              <div className="max-w-5xl mx-auto">
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">
                    Technologies
                  </p>
                  <h2
                    className="text-white text-3xl md:text-5xl font-black uppercase tracking-tight"
                    style={{ fontFamily: "Impact, sans-serif" }}
                  >
                    Tech <span className="text-cyan-400">Stack</span>
                  </h2>
                  <div className="h-1 w-12 bg-cyan-400 mx-auto mt-4 rounded-full" />
                </motion.div>

                <div className="grid md:grid-cols-2 gap-4">
                  {TECH_STACK.map((tech, i) => (
                    <TechCard key={tech.name} tech={tech} index={i} />
                  ))}
                </div>
              </div>
            </section>

            {/* ═══ FEATURED PROJECTS ══════════════════════════════ */}
            <section className="py-20 px-4 bg-gray-950">
              <div className="max-w-5xl mx-auto">
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">
                    Portfolio
                  </p>
                  <h2
                    className="text-white text-3xl md:text-5xl font-black uppercase tracking-tight"
                    style={{ fontFamily: "Impact, sans-serif" }}
                  >
                    Featured <span className="text-yellow-400">Builds</span>
                  </h2>
                  <div className="h-1 w-12 bg-yellow-400 mx-auto mt-4 rounded-full" />
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                  {PROJECTS.map((project, i) => (
                    <ProjectCard
                      key={project.name}
                      project={project}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* ═══ SUPPORT THE CREATOR ════════════════════════════ */}
            <section
              className="py-20 px-4 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #1a0a2e 0%, #0d1117 50%, #030712 100%)",
              }}
            >
              {/* Animated glow */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.1) 0%, transparent 60%)",
                }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  ☕
                </motion.div>

                <p className="text-purple-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">
                  Support
                </p>
                <h2
                  className="text-white text-3xl md:text-5xl font-black uppercase tracking-tight mb-4"
                  style={{ fontFamily: "Impact, sans-serif" }}
                >
                  Enjoyed The <span className="text-purple-400">Work?</span>
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
                  Every donation keeps the code flowing and the football stories
                  alive. I build all of this solo — your support means
                  everything.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {SUPPORT_LINKS.map(
                    ({ label, icon: Icon, url, color, desc }) => (
                      <motion.a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-white no-underline"
                        style={{
                          background:
                            label === "Ko-fi"
                              ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                              : `${color}20`,
                          border:
                            label === "Ko-fi" ? "none" : `1px solid ${color}40`,
                          color:
                            label === "Ko-fi"
                              ? "#fff"
                              : color === "#003087"
                                ? "#60a5fa"
                                : "#fff",
                          boxShadow:
                            label === "Ko-fi"
                              ? "0 0 30px rgba(168,85,247,0.4)"
                              : "none",
                        }}
                        whileHover={{
                          y: -3,
                          boxShadow: `0 12px 30px ${label === "Ko-fi" ? "rgba(168,85,247,0.5)" : color + "30"}`,
                        }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Icon size={18} /> {desc}
                      </motion.a>
                    ),
                  )}
                </div>
              </div>
            </section>

            {/* ═══ CONNECT ════════════════════════════════════════ */}
            <section className="py-16 px-4 bg-gray-950 border-t border-gray-800">
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">
                  Get In Touch
                </p>
                <h2
                  className="text-white text-2xl md:text-4xl font-black uppercase tracking-tight mb-8"
                  style={{ fontFamily: "Impact, sans-serif" }}
                >
                  Let&apos;s <span className="text-green-400">Connect</span>
                </h2>

                <div className="flex justify-center gap-4 flex-wrap mb-8">
                  {SOCIAL_LINKS.map(({ label, icon: Icon, url, color }) => (
                    <motion.a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border no-underline"
                      style={{
                        borderColor: color + "30",
                        background: color + "08",
                        color,
                      }}
                      whileHover={{
                        y: -2,
                        borderColor: color + "60",
                        background: color + "15",
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Icon size={16} /> {label}
                    </motion.a>
                  ))}
                </div>

                <p className="text-gray-600 text-xs">
                  <FaHeart size={10} className="inline text-red-500 mx-1" />
                  Built with passion in Cape Town, South Africa
                </p>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
