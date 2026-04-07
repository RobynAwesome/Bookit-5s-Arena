'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FaChartBar, FaUsers, FaGlobe, FaDesktop, FaMobile, FaTablet,
  FaExternalLinkAlt, FaRobot, FaSpinner, FaMousePointer,
  FaPaperPlane, FaLightbulb, FaExclamationTriangle, FaCheckCircle, FaInfoCircle,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import InfoTooltip from '@/components/InfoTooltip';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color = 'text-green-400' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className={`text-2xl mb-2 ${color}`}>{icon}</div>
      <p className="text-2xl font-black text-white">{value ?? '—'}</p>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1 truncate">{sub}</p>}
    </div>
  );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────

function BarChart({ data }) {
  if (!data || !data.length) {
    return <div className="text-center text-gray-600 py-10 text-sm">No data yet</div>;
  }
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-40 w-full overflow-x-auto pb-1">
      {data.map((d) => {
        const pct = Math.max((d.count / max) * 100, 2);
        return (
          <div key={d.date} className="flex flex-col items-center gap-1 flex-1 min-w-[24px] group">
            <div className="relative w-full flex justify-center">
              <div
                style={{
                  height: `${(pct / 100) * 140}px`,
                  background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
                  borderRadius: '4px 4px 0 0',
                  minHeight: '4px',
                  width: '80%',
                  opacity: 0.85,
                  transition: 'opacity 0.15s',
                }}
                className="group-hover:opacity-100"
                title={`${d.date}: ${d.count} views`}
              />
              <span className="absolute -top-5 text-[10px] text-green-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {d.count}
              </span>
            </div>
            <span className="text-[9px] text-gray-600 rotate-45 origin-left whitespace-nowrap">
              {d.date.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, max, color = '#22c55e' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ─── Insight Icon Styles ──────────────────────────────────────────────────────

const insightStyles = {
  success: { icon: <FaCheckCircle />, color: 'text-green-400', bg: 'bg-green-900/30 border-green-800/50' },
  warning: { icon: <FaExclamationTriangle />, color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-800/50' },
  info: { icon: <FaInfoCircle />, color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800/50' },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const canView = useFeatureAccess('admin.analytics.view');
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI state
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Booking stats for AI
  const [bookingStats, setBookingStats] = useState(null);

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session.user.activeRole !== 'admin') { router.push('/'); return; }
  }, [status, session, router]);

  const fetchData = useCallback(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    setInsights([]);
    setChatMessages([]);

    Promise.all([
      fetch(`/api/admin/analytics?days=${days}`).then((r) => r.json()),
      fetch('/api/admin/stats').then((r) => r.json()).catch(() => null),
    ]).then(([analyticsData, stats]) => {
      setData(analyticsData);
      setBookingStats(stats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [status, days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleGenerateInsights = async () => {
    if (!data) return;
    setInsightsLoading(true);
    try {
      const res = await fetch('/api/admin/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyticsData: data, bookingStats }),
      });
      const result = await res.json();
      setInsights(result.insights || []);
    } catch {
      setInsights([{ type: 'warning', title: 'Error', message: 'Failed to generate insights. Please try again.' }]);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const question = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: question }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/admin/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, analyticsData: data, bookingStats }),
      });
      const result = await res.json();
      setChatMessages((prev) => [...prev, { role: 'ai', text: result.answer || 'Sorry, I could not process that.' }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-green-400 animate-pulse text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-400 font-bold uppercase tracking-widest text-sm">Feature Disabled</p>
          <p className="text-gray-500 text-xs">Analytics has been disabled for your account.</p>
        </div>
      </div>
    );
  }

  const topPage = data?.topPages?.[0]?.path || '—';
  const topReferrer = data?.topReferrers?.[0]?.referrer || 'direct';
  const totalDevice = (data?.deviceBreakdown?.desktop || 0) + (data?.deviceBreakdown?.mobile || 0) + (data?.deviceBreakdown?.tablet || 0);

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-white" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
              Analytics
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Website traffic and engagement for the last {days} days{' '}
              <InfoTooltip text="This page shows website traffic, visitor behaviour, and booking performance. Use the AI assistant below for insights and to ask questions about your data." size={14} />
            </p>
          </div>

          <div className="flex gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all
                  ${days === d
                    ? 'bg-green-900/40 border border-green-700 text-green-400'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Top stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<FaChartBar />} label="Page Views" value={data?.totalPageViews?.toLocaleString() ?? '0'} color="text-green-400" />
          <StatCard icon={<FaUsers />} label="Unique Visitors" value={data?.totalVisitors?.toLocaleString() ?? '0'} color="text-blue-400" />
          <StatCard icon={<FaExternalLinkAlt />} label="Top Page" value={topPage} sub={`${data?.topPages?.[0]?.views ?? 0} views`} color="text-purple-400" />
          <StatCard icon={<FaGlobe />} label="Top Source" value={topReferrer} sub={`${data?.topReferrers?.[0]?.visits ?? 0} visits`} color="text-yellow-400" />
        </div>

        {/* Page Views Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
            Page Views — Last {days} Days{' '}
            <InfoTooltip text="Daily page view count. Hover over each bar for exact numbers. Spikes may indicate successful social media posts or promotions." size={12} />
          </h2>
          <BarChart data={data?.pageViewsByDay || []} />
        </div>

        {/* Top Pages + Traffic Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                Top Pages <InfoTooltip text="Most visited pages. If the booking page isn't here, visitors may browse without converting — add more booking CTAs." size={12} />
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-left">Path</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Views</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topPages || []).length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-600 text-xs">No data</td></tr>
                )}
                {(data?.topPages || []).map((p, i) => (
                  <tr key={i} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-white truncate max-w-[160px]">{p.path}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs text-right">{p.views.toLocaleString()}</td>
                    <td className="px-5 py-3 text-green-500 text-xs text-right font-bold">{p.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                Traffic Sources <InfoTooltip text="Where visitors come from. 'direct' = typed URL or bookmark. Other sources show which channels drive traffic to your site." size={12} />
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-left">Referrer</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Visits</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topReferrers || []).length === 0 && (
                  <tr><td colSpan={2} className="px-5 py-8 text-center text-gray-600 text-xs">No referrer data</td></tr>
                )}
                {(data?.topReferrers || []).map((r, i) => (
                  <tr key={i} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-white">{r.referrer || 'direct'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs text-right">{r.visits.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white mb-5 flex items-center gap-2" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
            Device Breakdown <InfoTooltip text="How visitors access your site. High mobile usage = make sure booking flow is mobile-friendly. Consider a sticky 'Book Now' button on mobile." size={12} />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { key: 'desktop', label: 'Desktop', icon: <FaDesktop />, color: '#22c55e' },
              { key: 'mobile',  label: 'Mobile',  icon: <FaMobile />,  color: '#3b82f6' },
              { key: 'tablet',  label: 'Tablet',  icon: <FaTablet />,  color: '#a855f7' },
            ].map(({ key, label, icon, color }) => {
              const count = data?.deviceBreakdown?.[key] || 0;
              const pct = totalDevice > 0 ? Math.round((count / totalDevice) * 100) : 0;
              return (
                <div key={key} className="bg-gray-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2" style={{ color }}>
                      {icon}
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-300">{label}</span>
                    </div>
                    <span className="text-white font-black text-lg">{pct}%</span>
                  </div>
                  <ProgressBar value={count} max={totalDevice} color={color} />
                  <p className="text-gray-600 text-xs">{count.toLocaleString()} sessions</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Tracking */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
              Event Tracking <InfoTooltip text="Custom events tracked on your site (button clicks, form submissions, etc). Shows which features users interact with most." size={12} />
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-left">Event</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Count</th>
              </tr>
            </thead>
            <tbody>
              {(data?.topEvents || []).length === 0 && (
                <tr>
                  <td colSpan={2} className="px-5 py-8 text-center text-gray-600 text-xs">
                    Page views are tracked automatically. Custom events will appear here as users interact with the site.
                  </td>
                </tr>
              )}
              {(data?.topEvents || []).map((e, i) => (
                <tr key={i} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <FaMousePointer className="text-yellow-500" size={11} />
                      <span className="font-mono text-xs text-white">{e.event}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs text-right font-bold">{e.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── AI Analytics Assistant ─────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)' }}>
                <FaRobot className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                  AI Analytics Assistant{' '}
                  <InfoTooltip text="Your free AI analytics advisor. It reads your real booking and traffic data to provide actionable insights. Click 'Generate Insights' for a full analysis, or type a question below." size={14} />
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Free -- analyses your data in real-time, no API key needed</p>
              </div>
            </div>
            <motion.button
              onClick={handleGenerateInsights}
              disabled={insightsLoading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-wait"
              style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)', boxShadow: '0 0 15px rgba(34,197,94,0.3)' }}
            >
              {insightsLoading ? <FaSpinner className="animate-spin" size={13} /> : <FaLightbulb size={13} />}
              {insightsLoading ? 'Analysing...' : 'Generate Insights'}
            </motion.button>
          </div>

          {/* AI Insight Cards */}
          <AnimatePresence>
            {insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 py-5 border-b border-gray-800"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.map((insight, i) => {
                    const style = insightStyles[insight.type] || insightStyles.info;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`border rounded-xl p-4 ${style.bg}`}
                      >
                        <div className={`flex items-center gap-2 mb-2 ${style.color}`}>
                          {style.icon}
                          <span className="text-xs font-bold uppercase tracking-widest">{insight.title}</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{insight.message}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Interface */}
          <div className="px-6 py-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-1.5">
              <FaRobot size={10} className="text-green-400" /> Ask the AI{' '}
              <InfoTooltip text="Type a question about your data — revenue, cancellations, peak hours, popular courts, device usage, or how to grow bookings." size={12} />
            </p>

            {/* Chat messages */}
            <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-6 text-gray-700 text-sm">
                  Ask me anything about your analytics — revenue, peak hours, popular courts, or how to grow bookings.
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-green-900/30 border border-green-800/50 text-green-200'
                      : 'bg-gray-800 border border-gray-700 text-gray-300'
                  }`}>
                    {msg.role === 'ai' && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <FaRobot className="text-green-400" size={10} />
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">AI Assistant</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </motion.div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 flex items-center gap-2">
                    <FaSpinner className="animate-spin text-green-400" size={12} />
                    <span className="text-xs text-gray-400">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="e.g. How is my revenue doing? What are my peak hours?"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none placeholder-gray-600"
              />
              <motion.button
                onClick={handleChatSend}
                disabled={!chatInput.trim() || chatLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-3 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)' }}
              >
                <FaPaperPlane size={14} />
              </motion.button>
            </div>

            {/* Quick question chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {['How is my revenue?', 'Peak hours?', 'Most popular court?', 'How to grow bookings?', 'Device breakdown?'].map((q) => (
                <button
                  key={q}
                  onClick={() => { setChatInput(q); }}
                  className="text-[10px] font-bold text-gray-500 hover:text-green-400 bg-gray-800 hover:bg-gray-800/80 border border-gray-700 hover:border-green-800 rounded-lg px-2.5 py-1.5 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
