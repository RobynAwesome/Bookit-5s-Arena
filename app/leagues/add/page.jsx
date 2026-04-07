"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrophy } from "react-icons/fa";
import { motion } from "framer-motion";
import InfoTooltip from "@/components/InfoTooltip";

const LEAGUE_FORMATS = [
  { value: "round-robin", label: "Round Robin" },
  { value: "knockout", label: "Knockout" },
  { value: "group-stage", label: "Group Stage + Knockout" },
  { value: "league", label: "League (Home & Away)" },
];

const AddLeaguePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    format: "",
    maxTeams: "",
    entryFee: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    prizePool: "",
    rules: "",
    image: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.name ||
      !form.description ||
      !form.format ||
      !form.maxTeams ||
      !form.entryFee ||
      !form.startDate ||
      !form.registrationDeadline
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxTeams: Number(form.maxTeams),
          entryFee: Number(form.entryFee),
          prizePool: form.prizePool ? Number(form.prizePool) : 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add league. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none w-full placeholder-gray-500";
  const labelClass =
    "block text-gray-300 uppercase tracking-widest text-xs mb-2 font-semibold";

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center max-w-md w-full">
          <FaTrophy className="mx-auto text-4xl text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            League Created!
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Your new league has been added successfully.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setSuccess(false);
                setForm({
                  name: "",
                  description: "",
                  format: "",
                  maxTeams: "",
                  entryFee: "",
                  startDate: "",
                  endDate: "",
                  registrationDeadline: "",
                  prizePool: "",
                  rules: "",
                  image: "",
                });
              }}
              className="px-5 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition"
            >
              Add Another
            </button>
            <button
              onClick={() => router.push("/leagues")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition"
              style={{
                background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
              }}
            >
              View Leagues
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1
            className="text-4xl uppercase text-white"
            style={{
              fontFamily: "Impact, Arial Black, sans-serif",
              letterSpacing: "4px",
            }}
          >
            Add a League
          </h1>
          <div
            className="mt-2 h-1 w-16 rounded-full"
            style={{ background: "linear-gradient(135deg, #15803d, #22c55e)" }}
          />
        </div>

        {/* Form Card */}
        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3 mb-6">
            <FaTrophy className="text-green-500 text-xl" />
            <h2 className="text-white text-lg font-bold uppercase tracking-widest">
              League Details
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950 border border-red-800 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* League Name */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  League Name <span className="text-red-400">*</span>{" "}
                  <InfoTooltip
                    text="The official name for your league. This will be displayed on the fixtures page and all league-related communications."
                    size={14}
                  />
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Cape Town 5s Premier League"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Description <span className="text-red-400">*</span>{" "}
                  <InfoTooltip
                    text="A brief overview of the league — skill level, who it's for, what makes it unique. This helps teams decide whether to register."
                    size={14}
                  />
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Describe the league, skill level, schedule..."
                  className={inputClass}
                />
              </div>

              {/* Format */}
              <div>
                <label className={labelClass}>
                  Format <span className="text-red-400">*</span>{" "}
                  <InfoTooltip
                    text="Round Robin: every team plays each other. Knockout: single elimination. Group Stage: groups then knockout. League: full home & away season."
                    size={14}
                  />
                </label>
                <select
                  name="format"
                  value={form.format}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select format...</option>
                  {LEAGUE_FORMATS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Teams */}
              <div>
                <label className={labelClass}>
                  Max Teams <span className="text-red-400">*</span>{" "}
                  <InfoTooltip
                    text="Maximum number of teams that can register. Registration closes automatically when this limit is reached."
                    size={14}
                  />
                </label>
                <input
                  type="number"
                  name="maxTeams"
                  value={form.maxTeams}
                  onChange={handleChange}
                  required
                  min="2"
                  placeholder="e.g. 16"
                  className={inputClass}
                />
              </div>

              {/* Entry Fee */}
              <div>
                <label className={labelClass}>
                  Entry Fee (R) <span className="text-red-400">*</span>{" "}
                  <InfoTooltip
                    text="Per-team entry fee in South African Rand. Set to 0 for a free league. This is charged once per team upon registration."
                    size={14}
                  />
                </label>
                <input
                  type="number"
                  name="entryFee"
                  value={form.entryFee}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="e.g. 500"
                  className={inputClass}
                />
              </div>

              {/* Prize Pool */}
              <div>
                <label className={labelClass}>
                  Prize Pool (R){" "}
                  <InfoTooltip
                    text="Total prize money for the league (optional). This is split among top finishers. Leave blank or set to 0 if there's no cash prize."
                    size={14}
                  />
                </label>
                <input
                  type="number"
                  name="prizePool"
                  value={form.prizePool}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 5000"
                  className={inputClass}
                />
              </div>

              {/* Start Date */}
              <div>
                <label className={labelClass}>
                  Start Date <span className="text-red-400">*</span>{" "}
                  <InfoTooltip
                    text="The date the first matches of the league will be played. Must be after the registration deadline."
                    size={14}
                  />
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* End Date */}
              <div>
                <label className={labelClass}>
                  End Date{" "}
                  <InfoTooltip
                    text="Estimated end date for the league (optional). Useful for teams planning their availability over the season."
                    size={14}
                  />
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Registration Deadline */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Registration Deadline <span className="text-red-400">*</span>{" "}
                  <InfoTooltip
                    text="Last date teams can register. After this date, no new teams will be accepted. Should be before the league start date."
                    size={14}
                  />
                </label>
                <input
                  type="date"
                  name="registrationDeadline"
                  value={form.registrationDeadline}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Rules */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Rules & Regulations{" "}
                  <InfoTooltip
                    text="Key rules for the league — match duration, squad size, substitution rules, yellow/red card policies, etc."
                    size={14}
                  />
                </label>
                <textarea
                  name="rules"
                  value={form.rules}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. 5-a-side, 20 min halves, max 3 subs per match..."
                  className={inputClass}
                />
              </div>

              {/* Image */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Image Filename{" "}
                  <InfoTooltip
                    text="A banner or logo image for the league. Place the file in /public/images/leagues/ before adding. Supported formats: JPG, PNG, WebP."
                    size={14}
                  />
                </label>
                <input
                  type="text"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="e.g. premier-league.jpg (must be in /public/images/leagues/)"
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Place the image file in{" "}
                  <code className="text-gray-400">/public/images/leagues/</code>{" "}
                  before adding.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 25px rgba(34,197,94,0.4)",
                }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 px-6 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
                }}
              >
                {loading ? "Creating League..." : "Create League"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddLeaguePage;
