"use client";

import { motion } from "framer-motion";
import { FaFutbol, FaStar, FaClock, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

export default function PricingPage() {
  const tiers = [
    {
      name: "Standard Play",
      price: "400",
      period: "per hour / court",
      icon: FaFutbol,
      color: "#22c55e",
      features: [
        "Full access to floodlit courts",
        "Free bibs and ball rental",
        "Changing rooms & shower use",
        "Standard social matches",
      ],
      cta: "Book Standard",
      tier: "Bronze",
    },
    {
      name: "Peak Performance",
      price: "550",
      period: "per hour / court",
      icon: FaStar,
      color: "#eab308",
      features: [
        "Priority evening slots",
        "Peak hour availability",
        "Video highlights (optional)",
        "Competitive league matches",
      ],
      cta: "Book Peak",
      popular: true,
      tier: "Silver+",
    },
    {
      name: "Tournament Entry",
      price: "3,000",
      period: "per team / event",
      icon: FaClock,
      color: "#3b82f6",
      features: [
        "World Cup 5s registration",
        "Official kit provided",
        "Dedicated referee & line-up",
        "Min 3 matches guaranteed",
      ],
      cta: "Join World Cup",
      tier: "All Players",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-black uppercase leading-tight mb-4"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 5rem)",
              fontFamily: "Impact, Arial Black, sans-serif",
            }}
          >
            Transparent <span className="text-green-500">Pricing</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            No hidden fees. No membership dues. Just pay for the time you play and get back on the pitch.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-3xl bg-gray-900 border ${tier.popular ? "border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]" : "border-gray-800"} flex flex-col`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <tier.icon className="mb-4" size={32} style={{ color: tier.color }} />
                <h3 className="text-2xl font-black uppercase tracking-wide mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">R{tier.price}</span>
                  <span className="text-gray-500 text-xs">{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-gray-400">
                    <FaCheckCircle className="text-green-500 shrink-0" size={14} />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href={tier.name.includes("Tournament") ? "/tournament" : "/courts"}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm text-center transition-all flex items-center justify-center gap-2 ${
                  tier.popular 
                    ? "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/40" 
                    : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                }`}
              >
                {tier.cta} <FaArrowRight size={12} />
              </Link>
              
              <p className="mt-4 text-[10px] text-center text-gray-600 uppercase font-bold tracking-widest">
                Member Tier: {tier.tier}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-12 p-10 bg-gray-900/50 border border-gray-800 rounded-3xl">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-black uppercase tracking-wide text-white mb-2">Bulk Sessions?</h4>
            <p className="text-gray-400 text-sm max-w-sm">
              Booking for a whole season or corporate tournament? Contact us for specialized block-booking rates.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-10 py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:scale-105 rounded-xl text-white font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-blue-900/40"
          >
            Get Custom Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
