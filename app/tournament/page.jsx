"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FaTrophy,
  FaCheck,
  FaArrowRight,
  FaFutbol,
  FaUsers,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaChevronDown,
  FaUpload,
  FaMoneyBillWave,
  FaFileUpload,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { WORLD_CUP_TEAMS } from "@/lib/worldCupTeams";
import PlayerShowcase from "@/components/tournament/PlayerShowcase";
import CountrySelector from "@/components/tournament/CountrySelector";

const POSITIONS = ["GK", "DEF", "MID", "FWD"];
const emptyPlayer = () => ({ name: "", position: "MID", isReserve: false });

/* ═══════════════════════════════════════════════════════════ */
export default function TournamentPage() {
  const [step, setStep] = useState(0);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [rulesRead, setRulesRead] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentFile, setPaymentFile] = useState(null);
  const [paymentUploading, setPaymentUploading] = useState(false);
  const [paymentFileError, setPaymentFileError] = useState("");

  /* Form state */
  const [form, setForm] = useState({
    managerName: "",
    managerEmail: "",
    managerPhone: "",
    teamName: "",
    worldCupTeam: "",
    communicationPref: "whatsapp",
    players: [
      emptyPlayer(),
      emptyPlayer(),
      emptyPlayer(),
      emptyPlayer(),
      emptyPlayer(),
    ],
    supportGuests: [],
  });

  /* Tournament info from API */
  const [tournamentInfo, setTournamentInfo] = useState(null);

  useEffect(() => {
    fetch("/api/tournament")
      .then((r) => r.json())
      .then(setTournamentInfo)
      .catch(() => {});
  }, []);

  const updatePlayer = (idx, field, value) => {
    setForm((prev) => {
      const players = [...prev.players];
      players[idx] = { ...players[idx], [field]: value };
      return { ...prev, players };
    });
  };

  const addPlayer = (isReserve = false) => {
    if (form.players.length >= 8) return;
    setForm((prev) => ({
      ...prev,
      players: [...prev.players, { ...emptyPlayer(), isReserve }],
    }));
  };

  const addSupportGuest = () => {
    if (form.supportGuests.length >= 3) return;
    setForm((prev) => ({
      ...prev,
      supportGuests: [...prev.supportGuests, { name: "", role: "" }],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tournament", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          agreedToTerms: true,
          agreedToRules: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data.message);
      setStep(4); // Go to payment step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpload = async () => {
    if (!paymentFile) return;
    setPaymentFileError("");
    // Enforce PDF only
    if (paymentFile.type !== "application/pdf") {
      setPaymentFileError(
        "Only PDF files are allowed. Please upload your deposit slip as a PDF.",
      );
      return;
    }
    setPaymentUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", paymentFile);
      formData.append("teamName", form.teamName);
      formData.append("managerEmail", form.managerEmail);
      const res = await fetch("/api/tournament/payment", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setStep(5); // Congrats
    } catch (err) {
      setError(err.message);
    } finally {
      setPaymentUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/tournament/backgrounds/tourment-background-page.jpg"
          alt="Tournament background"
          fill
          className="object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-linear-to-b from-gray-950/60 via-gray-950/90 to-gray-950" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        {/* Progress indicator */}
        {step > 0 && step < 5 && (
          <div className="flex items-center justify-center gap-1.5 mb-10 flex-wrap">
            {["Rules & T&Cs", "Register", "Payment"].map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                <motion.div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                    step > i + 2
                      ? "bg-green-600 border-green-500 text-white"
                      : step === i + 3
                        ? "border-green-500 text-green-400"
                        : "border-gray-700 text-gray-600"
                  }`}
                >
                  {step > i + 3 ? <FaCheck size={8} /> : i + 1}
                </motion.div>
                <span
                  className={`text-[9px] uppercase tracking-widest font-bold ${
                    step >= i + 3 ? "text-green-400" : "text-gray-600"
                  }`}
                >
                  {label}
                </span>
                {i < 2 && (
                  <div
                    className={`w-6 h-px ${step > i + 3 ? "bg-green-500" : "bg-gray-700"}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 0: Gate */}
          {step === 0 && (
            <motion.div
              key="gate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-900/30 border-2 border-green-500/50 flex items-center justify-center"
                animate={{
                  boxShadow: [
                    "0 0 0 rgba(34,197,94,0)",
                    "0 0 40px rgba(34,197,94,0.3)",
                    "0 0 0 rgba(34,197,94,0)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FaTrophy className="text-green-400" size={40} />
              </motion.div>
              <h1
                className="font-black uppercase mb-4"
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  fontFamily: "Impact, Arial Black, sans-serif",
                }}
              >
                5s ARENA <span className="text-green-400">WORLD CUP</span>
              </h1>
              <p className="text-gray-400 text-lg mb-2">
                May 29 – 31, 2026 · Hellenic Football Club
              </p>
              <p className="text-gray-500 text-sm mb-8">
                {tournamentInfo
                  ? `${tournamentInfo.registeredCount}/${tournamentInfo.totalSlots} teams registered`
                  : "Loading..."}
              </p>

              <motion.button
                onClick={() => setShowTermsModal(true)}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-green-600 text-white font-black uppercase tracking-widest text-sm cursor-pointer"
                style={{ boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 50px rgba(34,197,94,0.6)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FaFutbol size={16} /> Register Your Team{" "}
                <FaArrowRight size={12} />
              </motion.button>

              <PlayerShowcase />
            </motion.div>
          )}

          {/* Registration Form (Step 3) */}
          {step === 3 && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2
                className="text-2xl font-black uppercase tracking-widest mb-6 text-center"
                style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
              >
                🎉 <span className="text-green-400">WELCOME</span> TO THE WORLD
                CUP!
              </h2>
              {error && (
                <div className="bg-red-900/30 border border-red-800 rounded-xl p-3 mb-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="text-green-400 text-xs font-bold uppercase tracking-widest mb-4">
                    Manager / Captain
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      value={form.managerName}
                      onChange={(e) =>
                        setForm({ ...form, managerName: e.target.value })
                      }
                      placeholder="Full Name *"
                      className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm outline-none focus:border-green-500"
                    />
                    <input
                      value={form.managerEmail}
                      onChange={(e) =>
                        setForm({ ...form, managerEmail: e.target.value })
                      }
                      placeholder="Email *"
                      className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm outline-none focus:border-green-500"
                    />
                    <input
                      value={form.managerPhone}
                      onChange={(e) =>
                        setForm({ ...form, managerPhone: e.target.value })
                      }
                      placeholder="Phone *"
                      className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm outline-none focus:border-green-500"
                    />
                    <input
                      value={form.teamName}
                      onChange={(e) =>
                        setForm({ ...form, teamName: e.target.value })
                      }
                      placeholder="Team Name *"
                      className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm outline-none focus:border-green-500"
                    />
                  </div>
                </div>

                <CountrySelector
                  selectedTeam={form.worldCupTeam}
                  onSelect={(teamStr) =>
                    setForm({ ...form, worldCupTeam: teamStr })
                  }
                />

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="text-green-400 text-xs font-bold uppercase tracking-widest mb-4">
                    Starting Players (5)
                  </h3>
                  <div className="space-y-2">
                    {form.players.map((p, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={p.name}
                          onChange={(e) =>
                            updatePlayer(i, "name", e.target.value)
                          }
                          placeholder={`Player ${i + 1} Name`}
                          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm outline-none focus:border-green-500"
                        />
                        <select
                          value={p.position}
                          onChange={(e) =>
                            updatePlayer(i, "position", e.target.value)
                          }
                          className="bg-gray-800 border border-gray-700 rounded-lg px-2 text-xs text-gray-400"
                        >
                          {POSITIONS.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(0)}
                    className="text-gray-500 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-green-600 text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-green-900/20 hover:scale-105 transition-all"
                  >
                    {loading ? "Processing..." : "Proceed to Payment"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <FaFileUpload className="text-yellow-400 text-4xl mx-auto mb-4" />
              <h2 className="text-2xl font-black uppercase tracking-widest mb-4">
                Upload <span className="text-yellow-400">Proof of Payment</span>
              </h2>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                Team saved! Please upload your deposit slip. Use{" "}
                <strong className="text-white">&quot;{form.teamName} WC26&quot;</strong>{" "}
                as reference.
              </p>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 max-w-sm mx-auto text-left">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-bold">
                  Banking Details
                </p>
                <p className="text-sm font-bold">Capitec Bank</p>
                <p className="text-sm">Account: Hellenic Courts</p>
                <p className="text-sm">Number: 2503477980</p>
              </div>

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  setPaymentFileError("");
                  const file = e.target.files?.[0];
                  if (file && file.type !== "application/pdf") {
                    setPaymentFile(null);
                    setPaymentFileError(
                      "Only PDF files are allowed. Please upload your deposit slip as a PDF.",
                    );
                  } else {
                    setPaymentFile(file || null);
                  }
                }}
                className="mb-2 block mx-auto text-xs text-gray-500"
              />
              <p className="text-xs text-yellow-400 mb-4">
                Only PDF files are accepted. Please scan or export your deposit
                slip as a PDF before uploading.
              </p>
              {paymentFileError && (
                <div className="mb-4 text-red-400 text-xs font-bold">
                  {paymentFileError}
                </div>
              )}
              <button
                onClick={handlePaymentUpload}
                disabled={!paymentFile || paymentUploading}
                className="px-8 py-3 rounded-xl bg-green-600 text-white font-black uppercase tracking-widest text-sm w-full max-w-xs"
              >
                {paymentUploading ? "Uploading..." : "Submit POP"}
              </button>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-900/40">
                <FaCheck className="text-white text-3xl" />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-widest mb-4">
                Nation <span className="text-green-400">Secured!</span>
              </h2>
              <p className="text-gray-400 mb-8">
                Your registration is pending payment verification. You&apos;ll
                receive a notification within 24 hours.
              </p>
              <Link
                href="/profile"
                className="inline-block px-10 py-4 rounded-xl bg-gray-800 text-white font-black uppercase tracking-widest text-sm border border-gray-700 hover:bg-gray-700 transition-all"
              >
                Go to Dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* T&C Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            className="fixed inset-0 z-100 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowTermsModal(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              initial={{ scale: 0.9, y: 20 }}
            >
              <button
                onClick={() => setShowTermsModal(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-20"
              >
                <FaTimes size={18} />
              </button>
              <div className="p-6 bg-gray-800 border-b border-gray-700">
                <h2 className="text-xl font-black uppercase tracking-widest text-white">
                  World Cup Rules & T&Cs
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-300">
                <div>
                  <h3 className="text-green-400 font-bold uppercase mb-2">
                    1. Payment & Reference
                  </h3>
                  <p>
                    ZAR 3,000.00 non-negotiable. Use team name + WC26 as
                    reference. Bank deposit only.
                  </p>
                </div>
                <div>
                  <h3 className="text-green-400 font-bold uppercase mb-2">
                    2. Conduct
                  </h3>
                  <p>
                    Managers are responsible for player conduct. No refunds
                    after 48h before event.
                  </p>
                </div>
                <div>
                  <h3 className="text-green-400 font-bold uppercase mb-2">
                    3. Media
                  </h3>
                  <p>
                    Participants consent to photography and videography for
                    promotional use.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-gray-800/50 border-t border-gray-700 space-y-4">
                <label className="flex items-center gap-3 items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 accent-green-600"
                  />
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                    I irrevocably agree to the tournament regulations.
                  </span>
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-400 font-bold uppercase text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowTermsModal(false);
                      setStep(3);
                    }}
                    disabled={!termsAccepted}
                    className={`flex-1 py-3 rounded-xl font-black uppercase text-xs transition-all ${termsAccepted ? "bg-green-600 text-white" : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}
                  >
                    Accept & Register
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
