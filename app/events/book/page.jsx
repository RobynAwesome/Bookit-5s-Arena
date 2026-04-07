"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  FaBirthdayCake,
  FaStar,
  FaBuilding,
  FaTrophy,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaCheck,
  FaArrowLeft,
  FaCalendarCheck,
  FaTimes,
} from "react-icons/fa";

const PACKAGES = [
  {
    id: "birthday",
    name: "Kids Birthday",
    icon: FaBirthdayCake,
    color: "from-pink-500 to-rose-600",
    accent: "border-pink-500",
    image: "/images/events/Birthday%20Parties.png",
    duration: "2 hours",
    maxGuests: 15,
    features: [
      "Action-packed party on our 5-a-side pitch",
      "Dedicated coach & organised football fun",
      "All equipment, bibs & footballs provided",
      "Full setup & cleanup included",
      "Clubhouse & bar access for parents",
    ],
  },
  {
    id: "premium-birthday",
    name: "Premium Birthday",
    icon: FaStar,
    color: "from-amber-500 to-orange-600",
    accent: "border-amber-500",
    image: "/images/events/Birthday%20Parties.png",
    duration: "2 hours",
    maxGuests: 30,
    features: [
      "Ultimate bash across the full pitch",
      "2 dedicated coaches",
      "Trophies, medals & awards for every player",
      "Private party area with decorations",
      "VIP clubhouse access with food & drink",
    ],
  },
  {
    id: "corporate",
    name: "Corporate Team Building",
    icon: FaBuilding,
    color: "from-blue-500 to-indigo-600",
    accent: "border-blue-500",
    image: "/images/events/Corporate%20Events.png",
    duration: "3 hours",
    maxGuests: 20,
    features: [
      "3 hours of competitive 5-a-side action",
      "Up to 20 players across 2 courts",
      "Professional referee & tournament bracket",
      "Equipment & custom team colours",
      "Bar & restaurant for post-match networking",
    ],
  },
  {
    id: "social",
    name: "Social Tournament",
    icon: FaTrophy,
    color: "from-green-500 to-emerald-600",
    accent: "border-green-500",
    image: "/images/events/Tournaments.png",
    duration: "3 hours",
    maxGuests: 40,
    features: [
      "5v5 tournament format",
      "Round-robin + knockout rounds",
      "Trophies, medals & prizes",
      "Professional referee & live scoreboard",
      "Full access to bar & sound system",
    ],
  },
];

function EventBookingContent() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("package");

  const [selectedPkg, setSelectedPkg] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "10:00",
    guests: "",
    specialRequests: "",
    termsAccepted: false,
  });
  const [showTerms, setShowTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (preselected) {
      const pkg = PACKAGES.find((p) => p.id === preselected);
      if (pkg && (!selectedPkg || selectedPkg.id !== pkg.id)) {
        setSelectedPkg(pkg);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselected]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitted(true);
    setSubmitting(false);
  };

  const today = new Date().toISOString().split("T")[0];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FaCheck className="text-green-400 text-3xl" />
          </motion.div>
          <h2
            className="text-2xl font-black text-white uppercase tracking-wider mb-3"
            style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
          >
            Booking Confirmed!
          </h2>
          <p className="text-gray-400 mb-2">
            Your{" "}
            <span className="text-green-400 font-bold">
              {selectedPkg?.name}
            </span>{" "}
            event has been submitted.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Our team will contact you within 24 hours to finalise details.{" "}
            <br />
            <strong className="text-yellow-400 mt-2 block">
              IMPORTANT: Please use &quot;5&apos;s Arena World Cup&quot; as your
              payment reference for all deposits and EFTs.
            </strong>
          </p>
          <div className="flex gap-3">
            <Link href="/events" className="flex-1">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm text-center transition-colors cursor-pointer"
              >
                Back to Events
              </motion.div>
            </Link>
            <Link href="/" className="flex-1">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-sm text-center transition-colors cursor-pointer"
              >
                Home
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors"
          >
            <FaArrowLeft size={10} /> Back to Events
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <FaCalendarCheck className="text-green-400 text-2xl" />
          </motion.div>
          <h1
            className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest mb-2"
            style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
          >
            Book Your <span className="text-green-400">Event</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Choose a package, pick your date, and we&apos;ll handle the rest.
          </p>
        </motion.div>

        {/* Step 1: Package Selection */}
        {!selectedPkg ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">
                1
              </span>
              Choose Your Package
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PACKAGES.map((pkg, i) => {
                const Icon = pkg.icon;
                return (
                  <motion.button
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/50 transition-all text-left group cursor-pointer`}
                  >
                    <div className="relative h-32 overflow-hidden">
                      <Image
                        src={pkg.image}
                        alt={pkg.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/30 to-transparent" />
                      <div className="absolute bottom-3 left-4 flex items-center gap-2">
                        <div
                          className={`w-10 h-10 bg-linear-to-br ${pkg.color} rounded-lg flex items-center justify-center`}
                        >
                          <Icon className="text-white text-lg" />
                        </div>
                        <div>
                          <h3 className="text-white font-black text-sm uppercase tracking-wider">
                            {pkg.name}
                          </h3>
                          <p className="text-gray-400 text-[10px]">
                            {pkg.duration} &bull; Up to {pkg.maxGuests} guests
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Step 2: Booking Form */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Package details */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden sticky top-24">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={selectedPkg.image}
                    alt={selectedPkg.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3
                      className="text-white font-black text-lg uppercase tracking-wider"
                      style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                    >
                      {selectedPkg.name}
                    </h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaClock size={11} /> {selectedPkg.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaUsers size={11} /> Up to {selectedPkg.maxGuests}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {selectedPkg.features.map((f, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start gap-2 text-gray-400 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <FaCheck className="text-green-400 text-[10px] mt-1.5 shrink-0" />
                        {f}
                      </motion.li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setSelectedPkg(null)}
                    className="mt-4 text-[10px] text-gray-600 hover:text-gray-400 uppercase tracking-widest font-bold transition-colors cursor-pointer"
                  >
                    ← Change Package
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-[10px] font-black">
                    2
                  </span>
                  Event Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                        <FaUser size={9} /> Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-600/50 outline-none transition-all placeholder-gray-600"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                        <FaPhone size={9} /> Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-600/50 outline-none transition-all placeholder-gray-600"
                        placeholder="+27 63 782 0245"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                      <FaEnvelope size={9} /> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-600/50 outline-none transition-all placeholder-gray-600"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="border-t border-gray-800 pt-4 mt-4" />

                  {/* Event Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                        <FaCalendarAlt size={9} /> Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                        min={today}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-600/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                        <FaClock size={9} /> Time
                      </label>
                      <select
                        name="time"
                        value={form.time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-600/50 outline-none transition-all cursor-pointer"
                      >
                        {[
                          "09:00",
                          "10:00",
                          "11:00",
                          "12:00",
                          "13:00",
                          "14:00",
                          "15:00",
                          "16:00",
                          "17:00",
                          "18:00",
                          "19:00",
                          "20:00",
                        ].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                        <FaUsers size={9} /> Guests
                      </label>
                      <input
                        type="number"
                        name="guests"
                        value={form.guests}
                        onChange={handleChange}
                        required
                        min="1"
                        max={selectedPkg.maxGuests}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-600/50 outline-none transition-all"
                        placeholder={`Max ${selectedPkg.maxGuests}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-widest">
                      Special Requests
                    </label>
                    <textarea
                      name="specialRequests"
                      value={form.specialRequests}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-600/50 outline-none transition-all placeholder-gray-600 resize-none"
                      placeholder="Any special requirements, dietary needs, etc."
                    />
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-800/50">
                    <input
                      type="checkbox"
                      id="terms"
                      name="termsAccepted"
                      checked={form.termsAccepted}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          termsAccepted: e.target.checked,
                        }))
                      }
                      required
                      className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-900 text-green-600 focus:ring-green-500 focus:ring-offset-gray-950 cursor-pointer"
                    />
                    <label
                      htmlFor="terms"
                      className="text-[11px] text-gray-400 leading-tight cursor-pointer"
                    >
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-green-500 hover:text-green-400 font-bold underline decoration-green-500/30"
                      >
                        Terms & Conditions
                      </button>
                      , including the 50% non-refundable deposit policy and the
                      mandatory{" "}
                      <strong>&quot;5&apos;s Arena World Cup&quot;</strong>{" "}
                      payment reference requirement.
                    </label>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={submitting || !form.termsAccepted}
                    className="w-full py-4 rounded-xl text-sm font-black text-white uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden"
                    style={{
                      background: form.termsAccepted
                        ? "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)"
                        : "#374151",
                      backgroundSize: "200% 200%",
                    }}
                    animate={
                      form.termsAccepted
                        ? {
                            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                            boxShadow: [
                              "0 0 20px rgba(16,185,129,0.3)",
                              "0 0 35px rgba(16,185,129,0.5)",
                              "0 0 20px rgba(16,185,129,0.3)",
                            ],
                          }
                        : {}
                    }
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    whileHover={form.termsAccepted ? { scale: 1.02 } : {}}
                    whileTap={form.termsAccepted ? { scale: 0.97 } : {}}
                  >
                    {form.termsAccepted && (
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%)",
                          backgroundSize: "200% 100%",
                        }}
                        animate={{ backgroundPosition: ["-100% 0", "200% 0"] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <FaCalendarCheck />{" "}
                      {submitting ? "Submitting..." : "Submit Booking Request"}
                    </span>
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Terms Modal */}
        <AnimatePresence>
          {showTerms && (
            <motion.div
              className="fixed inset-0 z-100 flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => setShowTerms(false)}
              />
              <motion.div
                className="relative bg-gray-950 border border-gray-800 rounded-3xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <button
                  onClick={() => setShowTerms(false)}
                  className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
                >
                  <FaTimes size={18} />
                </button>
                <h3
                  className="text-2xl font-black text-white uppercase tracking-widest mb-6"
                  style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                >
                  Terms & <span className="text-green-400">Conditions</span>
                </h3>
                <div className="prose prose-invert prose-sm max-w-none text-gray-400 space-y-4">
                  <section>
                    <h4 className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />{" "}
                      1. Booking & Cancellation
                    </h4>
                    <p>
                      All event bookings require a 50% non-refundable deposit to
                      secure the date. Cancellations made within 7 days of the
                      event will forfeit the entire deposit.
                    </p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />{" "}
                      2. Payment Reference
                    </h4>
                    <p className="bg-green-900/20 border border-green-800/50 p-3 rounded-xl text-green-400 font-bold">
                      CRITICAL: All electronic transfers (EFT) must use the
                      specific reference &quot;5&apos;s Arena World Cup&quot;.
                      Failure to use this reference may result in delays or loss
                      of booking visibility in our accounting system.
                    </p>
                  </section>
                  <section>
                    <h4 className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />{" "}
                      3. Pitch Rules
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Correct footwear (astro turf trainers or smooth soles)
                        only. No metal studs.
                      </li>
                      <li>
                        Players must arrive 15 minutes before the scheduled
                        time.
                      </li>
                      <li>
                        Alcohol is only permitted in the designated
                        bar/clubhouse area.
                      </li>
                    </ul>
                  </section>
                  <section>
                    <h4 className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />{" "}
                      4. Liability
                    </h4>
                    <p>
                      5&apos;s Arena and its staff are not responsible for
                      injuries or lost property. All players participate at
                      their own risk.
                    </p>
                  </section>
                </div>
                <motion.button
                  onClick={() => {
                    setForm((prev) => ({ ...prev, termsAccepted: true }));
                    setShowTerms(false);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
                >
                  I Accept These Terms
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function EventBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <EventBookingContent />
    </Suspense>
  );
}
