'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaFilter, FaTimes, FaFutbol, FaCalendarAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import InfoTooltip from '@/components/InfoTooltip';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

const STATUS_STYLES = {
  confirmed: 'bg-green-900/40 text-green-400 border border-green-800/60',
  pending:   'bg-yellow-900/40 text-yellow-400 border border-yellow-800/60',
  cancelled: 'bg-red-900/40 text-red-400 border border-red-800/60',
};

const TABS = [
  { key: 'courts', label: 'Courts', icon: FaFutbol },
  { key: 'events', label: 'Events', icon: FaCalendarAlt },
];

const AdminBookings = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const canView = useFeatureAccess('admin.bookings.view');
  const [activeTab, setActiveTab] = useState('courts');

  // Courts state
  const [bookings, setBookings] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  // Events state
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [evFromDate, setEvFromDate] = useState('');
  const [evToDate, setEvToDate] = useState('');
  const [evStatusFilter, setEvStatusFilter] = useState('');
  const [evTypeFilter, setEvTypeFilter] = useState('');
  const [updatingEvent, setUpdatingEvent] = useState(null);

  // Fetch court bookings
  const fetchBookings = useCallback(() => {
    const params = new URLSearchParams();
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    if (statusFilter) params.set('status', statusFilter);
    setLoadingCourts(true);
    fetch(`/api/admin/bookings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => { setBookings(Array.isArray(data) ? data : []); setLoadingCourts(false); });
  }, [fromDate, toDate, statusFilter]);

  // Fetch event bookings
  const fetchEvents = useCallback(() => {
    const params = new URLSearchParams();
    if (evFromDate) params.set('from', evFromDate);
    if (evToDate) params.set('to', evToDate);
    if (evStatusFilter) params.set('status', evStatusFilter);
    if (evTypeFilter) params.set('type', evTypeFilter);
    setLoadingEvents(true);
    fetch(`/api/admin/events?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => { setEvents(Array.isArray(data) ? data : []); setLoadingEvents(false); });
  }, [evFromDate, evToDate, evStatusFilter, evTypeFilter]);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated' && session.user.activeRole !== 'admin') { router.push('/'); return; }
    if (status === 'authenticated') {
      const syncId = setTimeout(() => {
        fetchBookings();
        fetchEvents();
      }, 0);

      return () => clearTimeout(syncId);
    }
  }, [status, session, router, fetchBookings, fetchEvents]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdating(bookingId);
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setBookings((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
    );
    setUpdating(null);
  };

  const handleMarkPaid = async (bookingId) => {
    setUpdating(bookingId);
    await fetch(`/api/admin/bookings/${bookingId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus: 'paid' }),
    });
    setBookings((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, paymentStatus: 'paid' } : b))
    );
    setUpdating(null);
  };

  const handleEventStatusChange = async (eventId, newStatus) => {
    setUpdatingEvent(eventId);
    await fetch(`/api/admin/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setEvents((prev) =>
      prev.map((e) => (e._id === eventId ? { ...e, status: newStatus } : e))
    );
    setUpdatingEvent(null);
  };

  const inputClass = 'bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all';

  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-400 font-bold uppercase tracking-widest text-sm">Feature Disabled</p>
          <p className="text-gray-500 text-xs">Bookings management has been disabled for your account.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-950 py-10 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1
            className="text-3xl font-black uppercase tracking-widest text-white"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            Manage Bookings
          </h1>
          <span className="block text-gray-500 text-sm mt-1">
            Physical bookings only — all payments collected at venue in cash{' '}
            <InfoTooltip text="All court and event bookings are pay-at-venue. Use the tabs to switch between courts and events. Mark bookings paid once cash is received in person." size={14} />
          </span>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={isActive ? { background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)' } : {}}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'courts' && (
            <motion.div
              key="courts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Court Filters */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-wrap gap-4 items-end shadow-lg">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    From{' '}
                    <InfoTooltip text="Filter bookings from this date onwards. Leave empty to show all past bookings." size={12} />
                  </label>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    To{' '}
                    <InfoTooltip text="Filter bookings up to this date. Leave empty to include all future bookings." size={12} />
                  </label>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    Status{' '}
                    <InfoTooltip text="Filter by booking status: Pending (awaiting confirmation), Confirmed (approved), or Cancelled." size={12} />
                  </label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <button
                  onClick={fetchBookings}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)', boxShadow: '0 0 15px rgba(34,197,94,0.3)' }}
                >
                  <FaFilter size={11} /> Apply
                </button>
                <button
                  onClick={() => { setFromDate(''); setToDate(''); setStatusFilter(''); }}
                  className="flex items-center gap-2 px-5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                >
                  <FaTimes size={11} /> Clear
                </button>
              </div>

              {/* Court Bookings Table */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                {loadingCourts ? (
                  <p className="text-center py-16 text-green-400 animate-pulse">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <p className="text-center py-16 text-gray-600">No court bookings found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800 text-left">
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">User</th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Court</th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Time</th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Dur.</th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Total</th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Cash Payment{' '}
                            <InfoTooltip text="All bookings are pay-at-venue (cash). Use 'Mark Paid' once the player has paid at the venue." size={12} />
                          </th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Update{' '}
                            <InfoTooltip text="Change the booking status. Confirm once the player has arrived and is ready to play." size={12} />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-white">{b.user?.name ?? 'Unknown'}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{b.user?.email}</p>
                            </td>
                            <td className="px-5 py-4 text-gray-300 font-medium">{b.court?.name ?? 'Unknown'}</td>
                            <td className="px-5 py-4 text-gray-400">{b.date}</td>
                            <td className="px-5 py-4 text-gray-400">{b.start_time}</td>
                            <td className="px-5 py-4 text-gray-400">{b.duration}h</td>
                            <td className="px-5 py-4 font-bold text-green-400">R{b.total_price?.toLocaleString()}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_STYLES[b.status] ?? 'bg-gray-800 text-gray-500'}`}>
                                {b.status ?? 'unknown'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-col gap-1.5 items-start">
                                <div className="flex items-center gap-1.5">
                                  {b.paymentStatus !== 'paid' && b.status === 'confirmed' && (
                                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Confirmed but cash not yet received" />
                                  )}
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    b.paymentStatus === 'paid'
                                      ? 'bg-green-900/40 text-green-400 border border-green-800/60'
                                      : b.paymentStatus === 'refunded'
                                      ? 'bg-blue-900/40 text-blue-400 border border-blue-800/60'
                                      : 'bg-amber-900/40 text-amber-400 border border-amber-800/60'
                                  }`}>
                                    {b.paymentStatus === 'paid' ? 'Cash Received' : b.paymentStatus === 'refunded' ? 'Refunded' : 'Awaiting Cash'}
                                  </span>
                                </div>
                                {b.paymentStatus !== 'paid' && b.paymentStatus !== 'refunded' && b.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleMarkPaid(b._id)}
                                    disabled={updating === b._id}
                                    className="text-[10px] font-bold text-green-400 hover:text-green-300 border border-green-800/60 hover:border-green-600 rounded px-1.5 py-0.5 transition-all disabled:opacity-50"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <select
                                defaultValue={b.status}
                                onChange={(e) => handleStatusChange(b._id, e.target.value)}
                                disabled={updating === b._id}
                                className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-all"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Event Filters */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-wrap gap-4 items-end shadow-lg">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    From{' '}
                    <InfoTooltip text="Filter event bookings from this preferred date onwards." size={12} />
                  </label>
                  <input type="date" value={evFromDate} onChange={(e) => setEvFromDate(e.target.value)} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    To{' '}
                    <InfoTooltip text="Filter event bookings up to this preferred date." size={12} />
                  </label>
                  <input type="date" value={evToDate} onChange={(e) => setEvToDate(e.target.value)} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    Status{' '}
                    <InfoTooltip text="Filter by event status: Pending (awaiting review), Confirmed (approved), or Cancelled." size={12} />
                  </label>
                  <select value={evStatusFilter} onChange={(e) => setEvStatusFilter(e.target.value)} className={inputClass}>
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    Type{' '}
                    <InfoTooltip text="Filter by event type: Birthday, Corporate, Tournament, or Social gathering." size={12} />
                  </label>
                  <select value={evTypeFilter} onChange={(e) => setEvTypeFilter(e.target.value)} className={inputClass}>
                    <option value="">All Types</option>
                    <option value="birthday">Birthday</option>
                    <option value="corporate">Corporate</option>
                    <option value="tournament">Tournament</option>
                    <option value="social">Social</option>
                  </select>
                </div>
                <button
                  onClick={fetchEvents}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)', boxShadow: '0 0 15px rgba(34,197,94,0.3)' }}
                >
                  <FaFilter size={11} /> Apply
                </button>
                <button
                  onClick={() => { setEvFromDate(''); setEvToDate(''); setEvStatusFilter(''); setEvTypeFilter(''); }}
                  className="flex items-center gap-2 px-5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                >
                  <FaTimes size={11} /> Clear
                </button>
              </div>

              {/* Events Table */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                {loadingEvents ? (
                  <p className="text-center py-16 text-green-400 animate-pulse">Loading event bookings...</p>
                ) : events.length === 0 ? (
                  <p className="text-center py-16 text-gray-600">No event bookings found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800 text-left">
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Contact</th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Type{' '}
                            <InfoTooltip text="The category of event: Birthday, Corporate team building, Tournament, or Social gathering." size={12} />
                          </th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Package</th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Time</th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Guests{' '}
                            <InfoTooltip text="Number of guests the client expects. Use this to allocate the right space and resources." size={12} />
                          </th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                          <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Update{' '}
                            <InfoTooltip text="Change the event booking status. Confirm once you've reviewed and approved the event details." size={12} />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((ev) => (
                          <tr key={ev._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-semibold text-white">{ev.contactName}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{ev.contactEmail}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{ev.contactPhone}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                ev.type === 'birthday' ? 'bg-pink-900/40 text-pink-400 border border-pink-800/60' :
                                ev.type === 'corporate' ? 'bg-blue-900/40 text-blue-400 border border-blue-800/60' :
                                ev.type === 'tournament' ? 'bg-amber-900/40 text-amber-400 border border-amber-800/60' :
                                'bg-purple-900/40 text-purple-400 border border-purple-800/60'
                              }`}>
                                {ev.type}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-gray-300 font-medium">{ev.packageName}</td>
                            <td className="px-5 py-4 text-gray-400">
                              {ev.preferredDate ? new Date(ev.preferredDate).toLocaleDateString('en-ZA') : '—'}
                            </td>
                            <td className="px-5 py-4 text-gray-400">{ev.preferredTime || '—'}</td>
                            <td className="px-5 py-4 text-gray-400 font-medium">{ev.guestCount}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_STYLES[ev.status] ?? 'bg-gray-800 text-gray-500'}`}>
                                {ev.status ?? 'unknown'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <select
                                defaultValue={ev.status}
                                onChange={(e) => handleEventStatusChange(ev._id, e.target.value)}
                                disabled={updatingEvent === ev._id}
                                className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-all"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AdminBookings;
