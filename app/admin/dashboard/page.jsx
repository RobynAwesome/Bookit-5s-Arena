"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PDFViewer from "@/components/PDFViewer";
import {
  FaCalendarAlt,
  FaFutbol,
  FaMoneyBillWave,
  FaClock,
  FaFilter,
  FaTimes,
  FaUsers,
  FaCheckCircle,
  FaBan,
  FaArrowUp,
  FaChartBar,
  FaUserSecret,
  FaCogs,
  FaShieldAlt,
  FaBullhorn,
  FaTrophy,
  FaUpload,
} from "react-icons/fa";
import { motion } from "framer-motion";
import InfoTooltip from "@/components/InfoTooltip";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

const statusBadge = (status) => {
  const map = {
    confirmed: "bg-green-900/40 text-green-400 border-green-700/50",
    pending: "bg-yellow-900/40 text-yellow-400 border-yellow-700/50",
    cancelled: "bg-red-900/40 text-red-400 border-red-700/50",
  };
  return map[status] || "bg-gray-800 text-gray-400 border-gray-700";
};

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [teams, setTeams] = useState([]);
  const [verifying, setVerifying] = useState(null);
  const [pdfModal, setPdfModal] = useState(null); // { url, teamName }
  const canGodMode = useFeatureAccess('admin.dashboard.godmode');

  const fetchStats = useCallback(
    (params) => {
      const p = params || new URLSearchParams();
      if (!params) {
        if (fromDate) p.set("from", fromDate);
        if (toDate) p.set("to", toDate);
        if (statusFilter) p.set("status", statusFilter);
      }
      setLoading(true);
      fetch(`/api/admin/stats?${p.toString()}`)
        .then((r) => r.json())
        .then((data) => {
          setStats(data);
          setLoading(false);
        });
    },
    [fromDate, toDate, statusFilter],
  );

  const fetchTeams = useCallback(() => {
    fetch("/api/tournament")
      .then((r) => r.json())
      .then((data) => setTeams(data.teams || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session.user.activeRole !== "admin") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      fetchStats(new URLSearchParams());
      fetchTeams();
    }
  }, [status, session, router, fetchStats, fetchTeams]);

  const handleVerify = async (teamId, action) => {
    setVerifying(teamId);
    try {
      const res = await fetch("/api/admin/tournament/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, action }),
      });
      if (res.ok) fetchTeams();
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(null);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-lg">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const inputClass =
    "bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all";
  const maxRevenue = Math.max(
    ...(stats.revenueTrend?.map((d) => d.revenue) ?? [1]),
    1,
  );

  const topCards = [
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: <FaCalendarAlt className="text-2xl text-blue-400" />,
      bg: "bg-blue-900/20 border-blue-800/40",
      sub: `${stats.upcomingBookings} upcoming`,
      tip: "All bookings across all statuses (confirmed, pending and cancelled) for the selected date range.",
    },
    {
      label: "Total Revenue",
      value: `R${stats.totalRevenue.toLocaleString()}`,
      icon: <FaMoneyBillWave className="text-2xl text-green-400" />,
      bg: "bg-green-900/20 border-green-800/40",
      sub: `Avg R${stats.avgBookingValue}/booking`,
      sub2:
        stats.paidCount > 0
          ? `R${(stats.paidRevenue ?? 0).toLocaleString()} confirmed paid`
          : null,
      tip: 'Total revenue across confirmed bookings. "Confirmed paid" reflects only those with payment verified via Stripe or manually marked paid.',
    },
    {
      label: "Total Courts",
      value: stats.totalCourts,
      icon: <FaFutbol className="text-2xl text-yellow-400" />,
      bg: "bg-yellow-900/20 border-yellow-800/40",
      sub: stats.mostBookedCourt
        ? `⭐ ${stats.mostBookedCourt.name}`
        : "No data yet",
      tip: "Number of active courts on the platform. ⭐ indicates your most popular court by booking count.",
    },
    {
      label: "Registered Users",
      value: stats.totalUsers,
      icon: <FaUsers className="text-2xl text-purple-400" />,
      bg: "bg-purple-900/20 border-purple-800/40",
      sub: "Total accounts",
      tip: "Total registered member accounts. Guest bookings (pay at venue) are not counted here.",
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gray-950 py-10 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1
              className="text-3xl font-black uppercase tracking-widest text-white"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              Admin Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Revenue, bookings &amp; business insights
            </p>
          </div>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/admin/bookings"
                className="px-4 py-2 text-xs font-bold text-gray-400 bg-gray-800 border border-gray-700 rounded-xl hover:text-white hover:border-gray-600 transition-all uppercase tracking-widest"
              >
                Manage Bookings
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/admin/analytics"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-400 bg-gray-800 border border-gray-700 rounded-xl hover:text-white hover:border-gray-600 transition-all uppercase tracking-widest"
              >
                <FaChartBar size={11} /> Analytics
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/admin/integrations"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-400 bg-gray-800 border border-gray-700 rounded-xl hover:text-white hover:border-gray-600 transition-all uppercase tracking-widest"
              >
                <FaCogs size={11} /> Integrations
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/admin/sandbox"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:text-white hover:border-cyan-400 transition-all uppercase tracking-widest"
              >
                <FaShieldAlt size={11} /> Sandbox
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-wrap gap-4 items-end shadow-lg">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              Period
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClass}
            >
              <option value="">All Bookings</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
          <button
            onClick={() => fetchStats()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 bg-green-600 shadow-lg shadow-green-900/30"
          >
            <FaFilter size={11} /> Apply
          </button>
          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
              setStatusFilter("");
              fetchStats(new URLSearchParams());
            }}
            className="flex items-center gap-2 px-5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
          >
            <FaTimes size={11} /> Clear
          </button>
        </div>

        {/* Top cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {topCards.map((card) => (
            <div
              key={card.label}
              className={`border rounded-2xl p-5 flex flex-col items-center text-center gap-2 shadow-lg ${card.bg}`}
            >
              <div className="p-3 rounded-xl bg-gray-900/60">{card.icon}</div>
              <p className="text-2xl font-black text-white">{card.value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide leading-tight">
                {card.label}
              </p>
              <p className="text-xs text-gray-600">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* God-Mode Control Center */}
        {canGodMode && (
        <div className="bg-black/60 border-2 border-red-600/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)] relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="bg-red-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              <FaShieldAlt className="text-white text-2xl" />
            </div>
            <div>
              <h2
                className="text-2xl font-black text-white uppercase tracking-widest leading-none"
                style={{ fontFamily: "Impact, sans-serif" }}
              >
                God-Mode <span className="text-red-600">Command</span>
              </h2>
              <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em] mt-2">
                System Status: Critical Priority
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-5 bg-gray-900/80 border border-gray-800 hover:border-red-500 rounded-2xl transition-all group">
                <FaUserSecret className="text-2xl text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  Ghost Log
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-5 bg-gray-900/80 border border-gray-800 hover:border-blue-500 rounded-2xl transition-all group">
                <FaCogs className="text-2xl text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  Flags
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-5 bg-gray-900/80 border border-gray-800 hover:border-yellow-500 rounded-2xl transition-all group">
                <FaBullhorn className="text-2xl text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  Broadcast
                </span>
              </button>
              <button className="flex flex-col items-center justify-center p-5 bg-gray-900/80 border border-gray-800 hover:border-red-600 rounded-2xl transition-all group">
                <FaBan className="text-2xl text-red-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  Banhammer
                </span>
              </button>
            </div>
            <div className="lg:col-span-2 bg-gray-950 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
              <textarea
                placeholder="Global notify..."
                className="flex-1 bg-transparent text-gray-300 text-xs font-mono outline-none resize-none placeholder:text-gray-700"
              />
              <button className="px-6 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 transition-all">
                Execute Dispatch
              </button>
            </div>
          </div>
        </div>
        )}

        {/* ── TOURNAMENT REGISTRATIONS (POP AUDIT) ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3
              className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              <FaTrophy className="text-yellow-500" /> Tournament POP Audit
              <InfoTooltip
                text="Manage tournament entries. 'Pending' teams have uploaded POP but need verification."
                size={12}
              />
            </h3>
            <span className="text-[10px] text-gray-500 font-bold">
              {teams.length} total entries
            </span>
          </div>
          {!teams.length ? (
            <p className="p-10 text-center text-gray-600 text-sm italic">
              No registrations found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-gray-800/50 text-gray-400 uppercase tracking-widest border-b border-gray-800 font-bold">
                    <th className="px-6 py-4">Team</th>
                    <th className="px-6 py-4">Nation</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Audit</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {teams.map((team) => (
                    <tr
                      key={team._id}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{team.teamName}</p>
                        <p className="text-[10px] text-gray-500">
                          {team.managerName}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {team.worldCupTeam}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-black uppercase text-[8px] border ${
                            team.paymentStatus === "confirmed"
                              ? "bg-green-900/40 text-green-400 border-green-700/50"
                              : team.paymentStatus === "pending"
                                ? "bg-yellow-900/40 text-yellow-400 border-yellow-700/50"
                                : team.paymentStatus === "rejected"
                                  ? "bg-red-900/40 text-red-400 border-red-700/50"
                                  : "bg-gray-800 text-gray-500 border-gray-700"
                          }`}
                        >
                          {team.paymentStatus || "unpaid"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {team.paymentScreenshot ? (
                          <>
                            <button
                              onClick={() =>
                                setPdfModal({
                                  url: `/uploads/payments/${team.paymentScreenshot}`,
                                  teamName: team.teamName,
                                })
                              }
                              className="text-blue-400 hover:text-blue-200 flex items-center gap-1 underline"
                            >
                              <FaUpload size={10} /> View PDF
                            </button>
                            <Link
                              href={`/uploads/payments/${team.paymentScreenshot}`}
                              target="_blank"
                              className="ml-2 text-gray-400 hover:text-gray-200 text-xs underline"
                            >
                              Download
                            </Link>
                          </>
                        ) : (
                          <span className="text-gray-700">None</span>
                        )}
                      </td>
                      {/* PDF Modal */}
                      {pdfModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                          <div
                            className="absolute inset-0"
                            onClick={() => setPdfModal(null)}
                          />
                          <div className="relative z-10 bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl flex flex-col items-center">
                            <h2 className="text-lg font-black mb-4 text-gray-900">
                              Deposit Slip: {pdfModal.teamName}
                            </h2>
                            <PDFViewer
                              url={pdfModal.url}
                              className="w-full h-96 border rounded-xl bg-white"
                            />
                            <button
                              onClick={() => setPdfModal(null)}
                              className="mt-4 px-6 py-2 rounded-xl bg-gray-900 text-white font-bold uppercase text-xs"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {team.paymentStatus !== "confirmed" && (
                            <button
                              onClick={() => handleVerify(team._id, "confirm")}
                              disabled={verifying === team._id}
                              className="w-7 h-7 rounded-lg bg-green-900/30 text-green-500 border border-green-700/50 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all"
                            >
                              <FaCheckCircle size={12} />
                            </button>
                          )}
                          {team.paymentStatus !== "rejected" && (
                            <button
                              onClick={() => handleVerify(team._id, "reject")}
                              disabled={verifying === team._id}
                              className="w-7 h-7 rounded-lg bg-red-900/30 text-red-500 border border-red-700/50 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                            >
                              <FaBan size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => handleVerify(team._id, "reset")}
                            disabled={verifying === team._id}
                            className="w-7 h-7 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center border border-gray-700 hover:bg-gray-700 transition-all"
                          >
                            <FaClock size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Revenue trend + Status breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h3
              className="text-sm font-black uppercase tracking-widest text-white mb-5 flex items-center gap-2"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              <FaArrowUp className="text-green-400" /> Revenue — Last 7 Days
            </h3>
            <div className="flex items-end gap-2 h-32">
              {stats.revenueTrend?.map((day) => {
                const heightPct = (day.revenue / maxRevenue) * 100;
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full rounded-t-lg bg-green-600 transition-all duration-500"
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    />
                    <span className="text-[10px] text-gray-500">
                      {new Date(day.date + "T12:00:00").toLocaleDateString(
                        "en-ZA",
                        { weekday: "short" },
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h3
              className="text-sm font-black uppercase tracking-widest text-white mb-5 flex items-center gap-2"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              <FaChartBar className="text-blue-400" /> Status
            </h3>
            <div className="space-y-4">
              {["confirmed", "pending", "cancelled"].map((s) => (
                <div key={s}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize">{s}</span>
                    <span className="font-bold">
                      {stats.statusCounts?.[s] || 0}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${(stats.statusCounts?.[s] / stats.totalBookings) * 100 || 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Court Breakdown + Recent Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3
                className="text-sm font-black uppercase tracking-widest text-white"
                style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
              >
                Court Performance
              </h3>
            </div>
            <div className="divide-y divide-gray-800">
              {stats.courtBreakdown?.map((c) => (
                <div
                  key={c._id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/40 transition-colors"
                >
                  <span className="font-semibold text-sm">{c.name}</span>
                  <span className="font-bold text-green-400">
                    R{c.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3
                className="text-sm font-black uppercase tracking-widest text-white"
                style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
              >
                Recent Bookings
              </h3>
            </div>
            <div className="divide-y divide-gray-800">
              {stats.recentBookings?.slice(0, 5).map((b) => (
                <div
                  key={b._id}
                  className="px-6 py-3.5 hover:bg-gray-800/40 transition-colors flex justify-between"
                >
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {b.courtName}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {b.userName} · {b.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400 text-sm">
                      R{b.total_price}
                    </p>
                    <span
                      className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${statusBadge(b.status)}`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
