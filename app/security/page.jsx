"use client";

import { motion } from "framer-motion";
import { FaLock, FaUserShield, FaServer, FaFingerprint } from "react-icons/fa";

export default function SecurityPage() {
  const points = [
    {
      title: "Encrypted Transactions",
      icon: FaLock,
      desc: "Every data exchange between your device and our arena servers is protected by high-grade 256-bit TLS encryption.",
    },
    {
      title: "Identity Protection",
      icon: FaUserShield,
      desc: "We utilize multi-layer authentication (NextAuth) and follow OAuth 2.0 best practices for all Google and Facebook sessions.",
    },
    {
      title: "Server Integrity",
      icon: FaServer,
      desc: "Our database is managed via secure clusters with real-time threat monitoring and automatic failover protection.",
    },
    {
      title: "Bot Mitigation",
      icon: FaFingerprint,
      desc: "We implement advanced fingerprinting and rate-limiting to protect court inventory from automated booking scrapers.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block p-4 rounded-full bg-blue-900/20 border border-blue-500/30 mb-6">
            <FaLock className="text-blue-500" size={40} />
          </div>
          <h1
            className="font-black uppercase tracking-tight mb-4"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontFamily: "Impact, Arial Black, sans-serif",
            }}
          >
            System <span className="text-blue-500">Security</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Your data safety is our top priority. We employ enterprise-standard security measures to ensure your 5s Arena experience is secure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {points.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] group"
            >
              <p.icon className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-lg font-black uppercase tracking-wider mb-2 text-white">
                {p.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
