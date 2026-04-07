"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaQuestionCircle,
  FaChevronDown,
  FaCreditCard,
  FaCalendarAlt,
  FaShieldAlt,
  FaTrophy,
  FaUsers,
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";

const FAQ_CATEGORIES = [
  {
    name: "Bookings & Payments",
    icon: FaCreditCard,
    color: "#22c55e",
    faqs: [
      {
        q: "How do I book a court?",
        a: "You can book online through our website — select your preferred court, date, and time slot. Payment can be made via Stripe (card) or cash on site for guest bookings.",
      },
      {
        q: "Can I book as a guest?",
        a: "Yes! Guest bookings are available with cash-on-site payment only. However, signing up unlocks online payments, booking history, loyalty rewards, and more.",
      },
      {
        q: "What are the court rates?",
        a: "Courts start from R400 per hour. Rates may vary for peak times, weekends, and special events. Check the booking page for live pricing.",
      },
      {
        q: "Can I cancel a booking?",
        a: "Cancellations are allowed up to 24 hours before your booking time. Cancellations within 24 hours are non-refundable.",
      },
      {
        q: "Are refunds available?",
        a: "Refunds for online payments are processed within 5-7 business days. Cash payments are non-refundable.",
      },
    ],
  },
  {
    name: "Events & Parties",
    icon: FaCalendarAlt,
    color: "#3b82f6",
    faqs: [
      {
        q: "How do I book an event?",
        a: "Contact us via WhatsApp, phone, or email. We will create a custom package based on your requirements.",
      },
      {
        q: "What events do you host?",
        a: "Kids birthdays, corporate team-building, social tournaments, and private functions. All packages include court access, equipment, and dedicated staff.",
      },
      {
        q: "Is catering included?",
        a: "Our bar and restaurant are available for all events. Custom catering can be arranged upon request for an additional fee.",
      },
      {
        q: "How far in advance should I book?",
        a: "We recommend booking at least 2 weeks in advance for events. Popular dates (weekends, school holidays) fill up fast!",
      },
    ],
  },
  {
    name: "Tournament",
    icon: FaTrophy,
    color: "#eab308",
    faqs: [
      {
        q: "When does the tournament start?",
        a: "The 5s Arena World Cup runs May 26–31, 2026. Sign-ups close one week before (May 19).",
      },
      {
        q: "How many players per team?",
        a: "5 starting players, up to 3 reserves, and up to 3 support staff (water carriers, coaches, etc.).",
      },
      {
        q: "How does the format work?",
        a: "8 groups of 6 teams. Top 2 from each group advance to the Round of 16, then single-elimination knockout to the final.",
      },
      {
        q: "Can I change my World Cup team?",
        a: "Yes, through the manager interface — but only if your new choice hasn't been taken by another team.",
      },
      {
        q: "What happens if I miss the deadline?",
        a: "Your team will NOT be allowed to register. If you miss the deadline, your team is removed from the system entirely. No exceptions.",
      },
    ],
  },
  {
    name: "Rules & Safety",
    icon: FaShieldAlt,
    color: "#ef4444",
    faqs: [
      {
        q: "Are slide tackles allowed?",
        a: "NO. Slide tackles are strictly prohibited. Any slide tackle results in an immediate yellow card.",
      },
      {
        q: "What about drugs and substances?",
        a: "Zero tolerance. Any person found with illegal substances will be removed, police will be contacted, and they will be permanently banned.",
      },
      {
        q: "What if equipment is damaged?",
        a: "Any intentional damage to equipment results in full financial liability. You break it, you pay for it.",
      },
      {
        q: "Is smoking allowed?",
        a: "Smoking is allowed on the premises but NOT inside the clubhouse.",
      },
    ],
  },
  {
    name: "Leagues",
    icon: FaUsers,
    color: "#a855f7",
    faqs: [
      {
        q: "When do leagues start?",
        a: "Leagues are coming soon! Season 1 dates will be announced on our website and social media channels.",
      },
      {
        q: "How much does it cost?",
        a: "Fees vary per league (R600-R800 per team per season). Payment is due before the first match.",
      },
      {
        q: "Can individuals join without a team?",
        a: "Yes! Use our Find Players feature to connect with teams looking for additional members.",
      },
    ],
  },
];

export default function HelpPage() {
  const [openCategory, setOpenCategory] = useState(FAQ_CATEGORIES[0].name);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="py-20 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <FaQuestionCircle className="mx-auto text-green-400 mb-4" size={36} />
          <h1
            className="font-black uppercase tracking-widest mb-3"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontFamily: "Impact, Arial Black, sans-serif",
            }}
          >
            HELP & <span className="text-green-400">FAQ</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Got questions? We&apos;ve got answers. Browse by category or search
            below.
          </p>
        </motion.div>
      </section>

      {/* Category Tabs */}
      <section className="max-w-4xl mx-auto px-6 pb-6">
        <div className="flex flex-wrap justify-center gap-2">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = openCategory === cat.name;
            return (
              <motion.button
                key={cat.name}
                onClick={() => {
                  setOpenCategory(cat.name);
                  setOpenFaq(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer border transition-all ${
                  isActive
                    ? "text-white"
                    : "text-gray-500 border-gray-800 hover:border-gray-700 hover:text-gray-400"
                } shadow-sm hover:shadow-lg hover:shadow-green-400/20 focus:ring-2 focus:ring-green-400/40`}
                style={
                  isActive
                    ? {
                        borderColor: cat.color,
                        background: `${cat.color}15`,
                        color: cat.color,
                      }
                    : {}
                }
                whileHover={{
                  scale: 1.08,
                  rotate: 1,
                  boxShadow: "0 0 16px 2px #22c55e33",
                }}
                whileTap={{ scale: 0.96, rotate: -1 }}
              >
                <Icon size={12} /> {cat.name}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <AnimatePresence mode="wait">
          {FAQ_CATEGORIES.filter((c) => c.name === openCategory).map((cat) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {cat.faqs.map((faq, _i) => {
                const isOpen = openFaq === `${cat.name}-${_i}`;
                return (
                  <motion.div
                    key={_i}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: _i * 0.05 }}
                  >
                    <button
                      onClick={() =>
                        setOpenFaq(isOpen ? null : `${cat.name}-${i}`)
                      }
                      className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-gray-800/30 transition-colors duration-300 hover:scale-[1.01] active:scale-95 group"
                    >
                      <span className="text-sm font-bold text-gray-200">
                        {faq.q}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaChevronDown size={12} style={{ color: cat.color }} />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </AnimatePresence>
      </section>

      {/* Still need help? */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <FaPhone className="mx-auto text-green-400 mb-4" size={24} />
          <h3
            className="font-black uppercase tracking-widest text-xl mb-2"
            style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
          >
            Still Need <span className="text-green-400">Help</span>?
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Our team is here to help. Get in touch any way you prefer.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/27637820245"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600/20 border border-green-600/40 text-green-400 text-sm font-bold"
            >
              <FaWhatsapp /> WhatsApp
            </a>
            <a
              href="tel:+27637820245"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600/20 border border-blue-600/40 text-blue-400 text-sm font-bold"
            >
              <FaPhone /> 063 782 0245
            </a>
            <a
              href="mailto:fivearena@gmail.com"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600/20 border border-purple-600/40 text-purple-400 text-sm font-bold"
            >
              <FaEnvelope /> Email Us
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
