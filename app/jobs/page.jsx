"use client";

import { motion } from "framer-motion";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaArrowRight,
} from "react-icons/fa";

const JOBS = [
  {
    id: 1,
    title: "5-a-Side Referee (Weekend Leagues)",
    type: "Part-Time",
    location: "Milnerton, CT",
    salary: "R150 - R200 per match",
    description:
      "We are looking for experienced and fair referees to officiate our Saturday and Sunday social leagues. Must have a strong understanding of 5-a-side rules and excellent communication skills.",
    urgent: true,
  },
  {
    id: 2,
    title: "Sports Bar Bartender / Server",
    type: "Part-Time / Evenings",
    location: "Milnerton, CT",
    salary: "R50/hr + Tips",
    description:
      "Join the 5s Arena clubhouse team! Fast-paced environment serving our players post-match drinks and snacks. Previous bar experience preferred.",
    urgent: false,
  },
  {
    id: 3,
    title: "Content Creator / Match Videographer",
    type: "Contract / Freelance",
    location: "Cape Town Region",
    salary: "Negotiable",
    description:
      "Love football and have an eye for a great shot? We need someone to film match highlights, conduct post-match interviews, and create high-energy social media content for the 5s Arena World Cup.",
    urgent: false,
  },
];

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            className="w-20 h-20 mx-auto bg-green-900/40 border-2 border-green-500/50 rounded-2xl flex items-center justify-center mb-6 rotate-3"
            animate={{ rotate: [3, -3, 3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <FaBriefcase className="text-green-400 text-3xl" />
          </motion.div>
          <h1
            className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-4"
            style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
          >
            JOIN THE <span className="text-green-400">SQUAD</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Find active job openings, volunteer opportunities, and freelance
            gigs at 5s Arena. Help us build the ultimate football experience.
          </p>
        </div>

        <div className="space-y-6">
          {JOBS.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 hover:border-gray-700 transition-colors shadow-xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {job.urgent && (
                      <span className="px-3 py-1 bg-red-900/40 border border-red-500/50 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-md animate-pulse">
                        Urgent
                      </span>
                    )}
                    <span className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 text-[10px] font-bold uppercase tracking-widest rounded-md">
                      {job.type}
                    </span>
                  </div>

                  <h2
                    className="text-2xl font-black uppercase tracking-widest text-white mb-4"
                    style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                  >
                    {job.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-gray-600" />{" "}
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaMoneyBillWave className="text-gray-600" /> {job.salary}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    {job.description}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col justify-end">
                  <a
                    href="mailto:jobs@fivesarena.com?subject=Application for ${job.title}"
                    className="flex justify-center items-center gap-2 w-full md:w-auto px-8 py-3 bg-gray-800 hover:bg-green-600 text-white hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] rounded-xl text-sm font-bold uppercase tracking-widest transition-all cursor-pointer group-hover:border-green-500 border border-gray-700"
                  >
                    Apply Now{" "}
                    <FaArrowRight
                      size={10}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center border-t border-gray-800 pt-10">
          <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-2">
            Don&apos;t see your role?
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            We&apos;re always looking for passionate people to join the 5s Arena
            family. Drop us your CV and we&apos;ll keep it on file.
          </p>
          <a
            href="mailto:jobs@fivesarena.com?subject=General Application"
            className="text-green-400 font-bold uppercase tracking-widest text-sm hover:text-green-300"
          >
            Send Open Application →
          </a>
        </div>
      </div>
    </div>
  );
}
