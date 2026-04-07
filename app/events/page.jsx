"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBirthdayCake,
  FaBuilding,
  FaTrophy,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaCheck,
  FaStar,
  FaChevronDown,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import AnimatedTitle from "@/components/AnimatedTitle";

const packages = [
  {
    id: "birthday",
    type: "birthday",
    name: "Kids Birthday",
    icon: FaBirthdayCake,
    color: "from-pink-500 to-rose-600",
    accent: "pink",
    features: [
      "Up to 15 kids",
      "2hrs court time",
      "1 dedicated coach",
      "Equipment + bibs provided",
      "Setup & cleanup included",
    ],
  },
  {
    id: "premium-birthday",
    type: "birthday",
    name: "Premium Birthday",
    icon: FaStar,
    color: "from-amber-500 to-orange-600",
    accent: "amber",
    features: [
      "Up to 30 kids",
      "2hrs court time",
      "2 coaches",
      "Equipment + bibs + trophies",
      "Setup + dedicated party area",
    ],
  },
  {
    id: "corporate",
    type: "corporate",
    name: "Corporate Team Building",
    icon: FaBuilding,
    color: "from-blue-500 to-indigo-600",
    accent: "blue",
    features: [
      "Up to 20 players",
      "3hrs total",
      "2 courts available",
      "Referee + bibs",
      "Tournament format",
    ],
  },
  {
    id: "social",
    type: "social",
    name: "Social Tournament",
    icon: FaTrophy,
    color: "from-green-500 to-emerald-600",
    accent: "green",
    features: [
      "Per team entry",
      "League format",
      "Prizes for winners",
      "Referee included",
    ],
  },
];

const WHATSAPP_NUMBER = "27637820245";
const PHONE_NUMBER = "+27637820245";
const EMAIL = "fivearena@gmail.com";

const EVENT_IMAGES = [
  "/images/events/birthday-parties.png",
  "/images/events/Tournaments.png",
  "/images/events/corporate-events.png",
  "/images/events/holiday-clinics.png",
];

const TERMS = [
  "All event bookings must be confirmed via phone call, WhatsApp, or email.",
  "A 50% deposit is required to secure your booking date.",
  "Full payment is due 48 hours before the event.",
  "Cancellations made less than 72 hours before the event are non-refundable.",
  "The venue reserves the right to reschedule in case of severe weather.",
  "All participants must sign a waiver before the event.",
  "Event times are subject to court availability.",
  "Catering and refreshments are not included unless specified.",
];

export default function EventsPage() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [contactMethod, setContactMethod] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-cycle hero images every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % EVENT_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setContactMethod(null);
    setTermsAccepted(false);
    setShowTerms(true);
    setTimeout(() => {
      document
        .getElementById("booking-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const pkgMessage = (pkg) =>
    encodeURIComponent(
      `Hi! I'd like to book the ${pkg.name} package at 5s Arena. Could you please let me know about availability and pricing?`,
    );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero with auto-cycling Ken Burns court images */}
      <section className="relative py-28 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={EVENT_IMAGES[currentImageIndex]}
              alt="Events at 5s Arena"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.08 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              onError={() =>
                setCurrentImageIndex((prev) => (prev + 1) % EVENT_IMAGES.length)
              }
            />
          </AnimatePresence>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(2,6,23,0.75) 0%, rgba(2,6,23,0.85) 40%, rgba(2,6,23,0.95) 70%, rgba(2,6,23,1) 100%)",
            }}
          />
          {/* Green accent overlay */}
          <div className="absolute inset-0 bg-green-900/10 mix-blend-overlay" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-5xl mx-auto text-center"
        >
          <AnimatedTitle
            text={[
              { text: "Events & ", highlight: false },
              { text: "Services", highlight: true },
            ]}
            subtitle="Birthday celebrations, corporate team building, social tournaments — your next unforgettable event starts here at 5s Arena."
            icon={<FaStar />}
            size="xl"
            align="center"
          />
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900/30 border border-amber-700/50 rounded-full text-amber-400 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <FaInfoCircle />
            All bookings are made via Call, WhatsApp, or Email — contact us to
            get a custom quote
          </motion.div>
        </motion.div>
      </section>

      {/* Package Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg, i) => {
            const Icon = pkg.icon;
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 50, rotateX: 8 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.25 },
                }}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/50 hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] transition-all duration-300 group"
              >
                {/* Card header with court image — hover zoom only */}
                <div className="relative h-44 overflow-hidden">
                  <motion.img
                    src={EVENT_IMAGES[i % EVENT_IMAGES.length]}
                    alt={pkg.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.15]"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/30 to-transparent" />
                  <div className="absolute bottom-4 left-5 flex items-center gap-3">
                    <motion.div
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20"
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="text-white text-xl" />
                    </motion.div>
                    <h3
                      className="text-lg font-black text-white uppercase tracking-wider drop-shadow-lg"
                      style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                    >
                      {pkg.name}
                    </h3>
                  </div>
                </div>

                {/* Features */}
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feat, j) => (
                      <motion.li
                        key={j}
                        className="flex items-center gap-3 text-gray-300"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.12 + j * 0.05 + 0.3 }}
                      >
                        <FaCheck className="text-green-400 text-sm shrink-0" />
                        <span>{feat}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <p className="text-gray-500 text-xs mb-4 italic">
                    Contact us for pricing — packages are customised to your
                    needs
                  </p>

                  <motion.button
                    onClick={() => handleSelectPackage(pkg)}
                    className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 0 25px rgba(34,197,94,0.5)",
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <FaCalendarAlt size={14} /> Book Event &rarr;
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Booking Contact Section */}
      <AnimatePresence>
        {selectedPackage && (
          <section
            id="booking-section"
            className="max-w-2xl mx-auto px-4 pb-12"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8"
            >
              {contactMethod === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaCheck className="text-green-400 text-3xl" />
                  </div>
                  <h3
                    className="text-2xl font-black text-white uppercase tracking-wider mb-3"
                    style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                  >
                    Reservation Started!
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Our team will respond within 24 hours to finalise your{" "}
                    <span className="text-green-400 font-bold">
                      {selectedPackage.name}
                    </span>{" "}
                    booking.
                  </p>
                  <p className="text-amber-400 text-sm mb-6 flex items-center justify-center gap-2">
                    <FaExclamationTriangle />
                    Please check your email for a confirmation — get in contact
                    to finalise your booking
                  </p>
                  <motion.button
                    onClick={() => {
                      setSelectedPackage(null);
                      setContactMethod(null);
                    }}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Browse Packages
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  <h2
                    className="text-2xl font-black text-white uppercase tracking-wider mb-2"
                    style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                  >
                    Book: {selectedPackage.name}
                  </h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Choose how you&apos;d like to get in touch. Our team will
                    confirm availability and provide a custom quote for your
                    event.
                  </p>

                  {/* T&Cs Section */}
                  {showTerms && !termsAccepted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mb-6 bg-gray-800/50 border border-gray-700 rounded-xl p-5"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3 flex items-center gap-2">
                        <FaInfoCircle size={10} /> Terms & Conditions
                      </h4>
                      <ul className="space-y-2 text-xs text-gray-400 mb-4">
                        {TERMS.map((term, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">•</span>{" "}
                            {term}
                          </li>
                        ))}
                      </ul>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => {
                            setTermsAccepted(e.target.checked);
                            if (e.target.checked) setShowTerms(false);
                          }}
                          className="w-5 h-5 rounded accent-green-500"
                        />
                        <span className="text-sm text-gray-300 font-bold">
                          I agree to the Terms & Conditions
                        </span>
                      </label>
                    </motion.div>
                  )}

                  {termsAccepted && (
                    <div className="mb-4 flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest">
                      <FaCheck size={10} /> Terms accepted — choose your contact
                      method
                    </div>
                  )}

                  {/* Contact Method Buttons */}
                  <div
                    className={`space-y-4 mb-8 ${!termsAccepted ? "opacity-40 pointer-events-none" : ""}`}
                  >
                    {/* WhatsApp */}
                    <motion.a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${pkgMessage(selectedPackage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        setTimeout(() => setContactMethod("sent"), 500)
                      }
                      className="flex items-center gap-4 w-full p-5 rounded-xl bg-green-600/10 border border-green-600/30 hover:border-green-500 hover:bg-green-600/20 text-white transition-all group cursor-pointer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center shrink-0 group-hover:shadow-[0_0_20px_rgba(37,211,102,0.5)] transition-shadow">
                        <FaWhatsapp className="text-white text-2xl" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">WhatsApp Us</p>
                        <p className="text-gray-400 text-sm">
                          Instant response · Message pre-filled with your
                          package
                        </p>
                      </div>
                    </motion.a>

                    {/* Phone Call */}
                    <motion.a
                      href={`tel:${PHONE_NUMBER}`}
                      onClick={() =>
                        setTimeout(() => setContactMethod("sent"), 500)
                      }
                      className="flex items-center gap-4 w-full p-5 rounded-xl bg-blue-600/10 border border-blue-600/30 hover:border-blue-500 hover:bg-blue-600/20 text-white transition-all group cursor-pointer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shrink-0 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-shadow">
                        <FaPhone className="text-white text-xl" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">Call Us</p>
                        <p className="text-gray-400 text-sm">
                          Speak to Mashoto · 063 782 0245
                        </p>
                      </div>
                    </motion.a>

                    {/* Email */}
                    <motion.a
                      href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Event Booking: ${selectedPackage.name}`)}&body=${encodeURIComponent(`Hi 5s Arena,\n\nI'd like to enquire about the ${selectedPackage.name} package.\n\nPlease let me know about availability and pricing.\n\nThank you!`)}`}
                      onClick={() =>
                        setTimeout(() => setContactMethod("sent"), 500)
                      }
                      className="flex items-center gap-4 w-full p-5 rounded-xl bg-purple-600/10 border border-purple-600/30 hover:border-purple-500 hover:bg-purple-600/20 text-white transition-all group cursor-pointer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shrink-0 group-hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-shadow">
                        <FaEnvelope className="text-white text-xl" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">Email Us</p>
                        <p className="text-gray-400 text-sm">
                          fivearena@gmail.com · We reply within 24hrs
                        </p>
                      </div>
                    </motion.a>
                  </div>

                  {/* T&Cs Notice */}
                  <div className="border-t border-gray-800 pt-6">
                    <p className="text-amber-400 text-sm flex items-start gap-2 mb-4">
                      <FaExclamationTriangle className="shrink-0 mt-0.5" />
                      By contacting us to book, you agree to our Terms &
                      Conditions below. A confirmation email will be sent once
                      your reservation is processed.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </section>
        )}
      </AnimatePresence>

      {/* Terms & Conditions */}
      <section className="max-w-2xl mx-auto px-4 pb-20">
        <motion.div
          className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={() => setShowTerms(!showTerms)}
            className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
            whileHover={{ backgroundColor: "rgba(31,41,55,0.5)" }}
          >
            <div className="flex items-center gap-3">
              <FaInfoCircle className="text-gray-500" />
              <span className="text-gray-300 font-bold uppercase tracking-wider text-sm">
                Terms & Conditions — Event Bookings
              </span>
            </div>
            <motion.div
              animate={{ rotate: showTerms ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaChevronDown className="text-gray-500" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showTerms && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 space-y-3">
                  {TERMS.map((term, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <span className="text-green-400 text-sm font-bold mt-0.5">
                        {i + 1}.
                      </span>
                      <p className="text-gray-400 text-sm">{term}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}
