"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FaTiktok,
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFutbol,
  FaLinkedinIn,
  FaShareAlt,
  FaCoffee,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useSession } from "next-auth/react";

/* ─── Social links ────────────────────────────────────────── */
const SOCIALS = [
  {
    icon: FaTiktok,
    href: "https://www.tiktok.com/@fivesarena",
    label: "TikTok",
    bg: "#010101",
  },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/fivesarena",
    label: "Instagram",
    bg: "#e1306c",
  },
  {
    icon: FaFacebook,
    href: "https://www.facebook.com/profile.php?id=61588019843126",
    label: "Facebook",
    bg: "#1877f2",
  },
  {
    icon: FaWhatsapp,
    href: "https://wa.me/27637820245",
    label: "WhatsApp",
    bg: "#25d366",
  },
];

/* ── Quick links — role-based ─────────────────────────────── */
const GUEST_QUICK_LINKS = [
  { label: "Book a Court", href: "/#courts" },
  { label: "Book an Event", href: "/events-and-services" },
  { label: "Register for Competitions", href: "/leagues" },
];
const AUTH_QUICK_LINKS = [
  { label: "Book a Court", href: "/#courts" },
  { label: "Events & Services", href: "/events-and-services" },
  { label: "Rules of the Game", href: "/rules-of-the-game" },
  { label: "Live Fixtures", href: "/fixtures" },
  { label: "Rewards", href: "/rewards" },
  { label: "Creator", href: "/creator" },
];

/* ─── LinkedIn business cards ─────────────────────────────── */
const TEAM_CARDS = [
  {
    name: "Kholofelo Robyn Rababalela",
    role: "Lead Developer",
    image: "/images/admin-photos/kholofelo-robyn-rababalela-footer-picture.png",
    linkedin:
      "https://www.linkedin.com/in/kholofelo-robyn-rababalela-7a26273b6/",
    gradient: "from-green-600/20 to-emerald-900/30",
    glow: "rgba(34,197,94,0.4)",
  },
  {
    name: "Mashoto Bayne Rababalela",
    role: "Founder",
    image: "/images/admin-photos/mashoto-rababalela-footer-picture.png",
    linkedin: "https://www.linkedin.com/in/mashoto-bayne-rababalela-836a47139/",
    gradient: "from-blue-600/20 to-indigo-900/30",
    glow: "rgba(59,130,246,0.4)",
  },
  {
    name: "Hellenic Football Club",
    role: "Venue Partner",
    image: "/images/Hellenic-Football-Club-logo.png",
    linkedin: "https://www.linkedin.com/company/hellenicfc/",
    gradient: "from-amber-600/20 to-orange-900/30",
    glow: "rgba(245,158,11,0.4)",
  },
];

/* ─── Bottom bar tabs ─────────────────────────────────────── */
const BOTTOM_TABS = [
  { label: "Roadmap", href: "/roadmap" },
  { label: "Security", href: "/security" },
  { label: "Terms", href: "/rules-of-the-game" },
  { label: "Contact", href: "/#contact" },
  { label: "About", href: "/about" },
  { label: "RSS Feed", href: "/api/rss" },
];

/* ═══════════════════════════════════════════════════════════ */
const Footer = () => {
  const { data: session } = useSession();
  const currentYear = new Date().getFullYear();

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "5s Arena", url });
    } else {
      navigator.clipboard?.writeText(url);
    }
  };

  return (
    <footer className="bg-gray-950 border-t border-gray-800 relative overflow-hidden pb-20 sm:pb-24">
      {/* Gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-linear-to-r from-transparent via-green-500/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* ─── LinkedIn Business Cards ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <motion.h3
            className="text-center text-green-400 font-bold text-xs uppercase tracking-[0.3em] mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            The Team Behind 5s Arena
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TEAM_CARDS.map((card, i) => (
              <motion.a
                key={card.name}
                href={card.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative group block rounded-2xl ${card.gradient} border border-gray-800/60 p-6 text-center overflow-hidden`}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.15,
                  type: "spring",
                  stiffness: 200,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                  boxShadow: `0 20px 60px ${card.glow}`,
                  borderColor: "rgba(74,222,128,0.4)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${card.glow}, transparent 70%)`,
                  }}
                />
                <div className="relative z-10">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-green-500 transition-colors duration-300"
                    whileHover={{ scale: 1.1, rotate: 3 }}
                  >
                    <Image
                      src={card.image}
                      alt={card.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <h4 className="text-white font-bold text-sm mb-1">
                    {card.name}
                  </h4>
                  <p className="text-gray-400 text-xs mb-3">{card.role}</p>
                  <motion.div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold"
                    whileHover={{
                      scale: 1.08,
                      boxShadow: "0 0 20px rgba(59,130,246,0.4)",
                    }}
                  >
                    <FaLinkedinIn size={10} />
                    Connect
                    <FaExternalLinkAlt size={8} />
                  </motion.div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* ─── Main Footer Grid ────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <motion.div
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="relative w-16 h-16 rounded-full overflow-hidden"
                whileHover={{ scale: 1.08 }}
              >
                <Image
                  src="/images/logo.png"
                  alt="5s Arena"
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </motion.div>
              <div>
                <p
                  className="font-black uppercase text-white text-lg tracking-wider"
                  style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                >
                  5S <span className="text-green-400">ARENA</span>
                </p>
              </div>
            </motion.div>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Cape Town&apos;s premier 5-a-side football venue. Floodlit,
              all-weather synthetic turf at Hellenic Football Club, Milnerton.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 mb-4">
              {SOCIALS.map(({ icon: Icon, href, label, bg }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 text-gray-400 transition-all duration-300"
                  whileHover={{
                    scale: 1.15,
                    y: -3,
                    backgroundColor: bg,
                    color: "#fff",
                    boxShadow: `0 0 16px ${bg}80`,
                    borderColor: bg,
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
            {/* Share + Buy Me a Coffee */}
            <div className="flex gap-2">
              <motion.button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/40 border border-gray-700 text-gray-400 text-xs hover:text-green-400 hover:border-green-500/30 transition-all cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaShareAlt size={10} /> Share
              </motion.button>
              <motion.a
                href="https://ko-fi.com/robynawesome"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-700/30 text-amber-400 text-xs font-semibold hover:bg-amber-800/30 transition-all"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 16px rgba(245,158,11,0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FaCoffee size={10} /> Buy us a coffee
              </motion.a>
            </div>
          </div>

          {/* Quick Links — role-based */}
          <div>
            <motion.h4
              className="text-green-400 font-bold text-xs uppercase tracking-[0.2em] mb-5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Quick Links
            </motion.h4>
            <ul className="space-y-2">
              {(!session ? GUEST_QUICK_LINKS : AUTH_QUICK_LINKS).map((link) => (
                <li key={link.href}>
                  <motion.div
                    whileHover={{ x: 3, scale: 1.02 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-all flex items-center gap-2 bg-gray-800/40 hover:bg-green-600/20 px-3 py-2 rounded-lg border border-gray-800/60 hover:border-green-500/30"
                    >
                      <span className="text-green-500 text-xs">→</span>
                      {link.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <motion.h4
              className="text-green-400 font-bold text-xs uppercase tracking-[0.2em] mb-5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Contact
            </motion.h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <a
                  href="tel:+27637820245"
                  className="flex items-center gap-3 hover:text-green-400 transition-colors group"
                >
                  <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-green-600/20 transition-colors">
                    <FaPhone size={12} className="text-green-400" />
                  </span>
                  063 782 0245
                </a>
              </li>
              <li>
                <a
                  href="mailto:fivearena@gmail.com"
                  className="flex items-center gap-3 hover:text-green-400 transition-colors group"
                >
                  <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-green-600/20 transition-colors">
                    <FaEnvelope size={12} className="text-green-400" />
                  </span>
                  fivearena@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/27637820245"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-green-400 transition-colors group"
                >
                  <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-green-600/20 transition-colors">
                    <FaWhatsapp size={12} className="text-green-400" />
                  </span>
                  WhatsApp Us
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                  <FaMapMarkerAlt size={12} className="text-green-400" />
                </span>
                <span>
                  Pringle Rd, Milnerton,
                  <br />
                  Cape Town, 7441
                </span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <motion.h4
              className="text-green-400 font-bold text-xs uppercase tracking-[0.2em] mb-5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Opening Hours
            </motion.h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex justify-between">
                <span>Monday – Friday</span>
                <span className="text-white font-semibold">10:00 – 22:00</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span className="text-white font-semibold">10:00 – 22:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-white font-semibold">10:00 – 22:00</span>
              </li>
              <li className="mt-3 pt-3 border-t border-gray-800 flex justify-between">
                <span>Public Holidays</span>
                <span className="text-amber-400 font-semibold">
                  Check Availability
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── Bottom bar ──────────────────────────────────── */}
        <div className="border-t border-gray-800/60 pt-6">
          {/* Built with ❤️ */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-600 text-xs">
              <FaFutbol className="text-green-600" size={10} />
              <p>&copy; {currentYear} Bookit 5s Arena. All rights reserved.</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Bottom tabs */}
              {BOTTOM_TABS.map((tab) => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className="text-gray-600 hover:text-gray-400 text-[10px] tracking-wider uppercase transition-colors"
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-[10px] tracking-[0.15em] uppercase flex items-center gap-1">
                Built by the 5s Arena Team
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
