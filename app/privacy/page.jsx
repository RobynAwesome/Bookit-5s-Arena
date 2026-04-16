"use client";

import { motion } from "framer-motion";
import { FaShieldAlt, FaGavel, FaUserSecret, FaRegFileAlt } from "react-icons/fa";

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Term of Use",
      icon: FaGavel,
      content: "By accessing Bookit 5s Arena, you agree to comply with our code of conduct. We reserve the right to remove any individual who engages in reckless behavior, drugs, or intentional equipment damage without refund.",
    },
    {
      title: "2. Privacy Policy",
      icon: FaUserSecret,
      content: "We collect only the data necessary to provide a seamless booking experience. This includes your name, email, and phone number for reservation tracking. We never share your personal data with third-party advertisers.",
    },
    {
      title: "3. Refund Policy",
      icon: FaShieldAlt,
      content: "Online bookings can be cancelled for a full refund up to 24 hours before the match. Within 24 hours, no refunds are issued. Tournament fees are non-refundable except in cases of event cancellation by the venue.",
    },
    {
      title: "4. Data Security",
      icon: FaRegFileAlt,
      content: "Our systems use industry-standard encryption for all data transmissions. Payment data is processed exclusively through specialized providers (Stripe/PayFast) and is never stored on our local servers.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <FaShieldAlt className="mx-auto text-green-500 mb-6" size={48} />
          <h1
            className="font-black uppercase tracking-tight mb-4"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontFamily: "Impact, Arial Black, sans-serif",
            }}
          >
            Privacy & <span className="text-green-500">Terms</span>
          </h1>
          <p className="text-gray-400">Last updated: April 16, 2026</p>
        </div>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-900/30 border border-green-500/30 flex items-center justify-center">
                  <section.icon className="text-green-500" size={18} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-wide text-white">
                  {section.title}
                </h2>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-3xl bg-linear-to-br from-green-900/20 to-gray-900 border border-green-500/20 text-center">
          <p className="text-sm text-gray-300 italic">
            "We aren't just here to manage your booking; we're here to protect the integrity of the game."
          </p>
        </div>
      </div>
    </div>
  );
}
