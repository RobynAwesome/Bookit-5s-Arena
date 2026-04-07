'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import InfoTooltip from '@/components/InfoTooltip';

const EVENT_TYPES = [
  { value: 'birthday', label: 'Birthday Party' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'social', label: 'Social Gathering' },
];

const AddEventPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    type: '',
    packageName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    preferredDate: '',
    preferredTime: '',
    guestCount: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.type || !form.packageName || !form.contactName || !form.contactEmail || !form.contactPhone || !form.preferredDate || !form.guestCount) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          guestCount: Number(form.guestCount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add event. Please try again.');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none w-full placeholder-gray-500';
  const labelClass = 'block text-gray-300 uppercase tracking-widest text-xs mb-2 font-semibold';

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center max-w-md w-full">
          <FaCalendarAlt className="mx-auto text-4xl text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Event Created!</h2>
          <p className="text-gray-400 text-sm mb-8">Your event booking request has been submitted successfully.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setSuccess(false);
                setForm({ type: '', packageName: '', contactName: '', contactEmail: '', contactPhone: '', preferredDate: '', preferredTime: '', guestCount: '', message: '' });
              }}
              className="px-5 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition"
            >
              Add Another
            </button>
            <button
              onClick={() => router.push('/events')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition"
              style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)' }}
            >
              View Events
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
            style={{ fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: '4px' }}
          >
            Add an Event
          </h1>
          <div className="mt-2 h-1 w-16 rounded-full" style={{ background: 'linear-gradient(135deg, #15803d, #22c55e)' }} />
        </div>

        {/* Form Card */}
        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3 mb-6">
            <FaCalendarAlt className="text-green-500 text-xl" />
            <h2 className="text-white text-lg font-bold uppercase tracking-widest">Event Details</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950 border border-red-800 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Event Type */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Event Type <span className="text-red-400">*</span>{' '}
                  <InfoTooltip text="Select the type of event you want to host. This helps us prepare the right setup and amenities for your group." size={14} />
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select event type...</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Package Name */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Package Name <span className="text-red-400">*</span>{' '}
                  <InfoTooltip text="Give your event package a name, e.g. 'Gold Birthday Package' or 'Team Building Day'. This appears on your booking confirmation." size={14} />
                </label>
                <input
                  type="text"
                  name="packageName"
                  value={form.packageName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Gold Birthday Package"
                  className={inputClass}
                />
              </div>

              {/* Contact Name */}
              <div>
                <label className={labelClass}>
                  Contact Name <span className="text-red-400">*</span>{' '}
                  <InfoTooltip text="Full name of the person responsible for the booking. We'll use this for all event correspondence." size={14} />
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John Smith"
                  className={inputClass}
                />
              </div>

              {/* Contact Email */}
              <div>
                <label className={labelClass}>
                  Contact Email <span className="text-red-400">*</span>{' '}
                  <InfoTooltip text="Email address for booking confirmation and event updates. Double-check this is correct!" size={14} />
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  required
                  placeholder="e.g. john@example.com"
                  className={inputClass}
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className={labelClass}>
                  Contact Phone <span className="text-red-400">*</span>{' '}
                  <InfoTooltip text="South African phone number (e.g. 0821234567 or +27821234567). We may call to confirm event details." size={14} />
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 0821234567"
                  className={inputClass}
                />
              </div>

              {/* Guest Count */}
              <div>
                <label className={labelClass}>
                  Guest Count <span className="text-red-400">*</span>{' '}
                  <InfoTooltip text="Total number of guests expected (1–100). This helps us allocate the right space and resources for your event." size={14} />
                </label>
                <input
                  type="number"
                  name="guestCount"
                  value={form.guestCount}
                  onChange={handleChange}
                  required
                  min="1"
                  max="100"
                  placeholder="e.g. 20"
                  className={inputClass}
                />
              </div>

              {/* Preferred Date */}
              <div>
                <label className={labelClass}>
                  Preferred Date <span className="text-red-400">*</span>{' '}
                  <InfoTooltip text="Choose your preferred event date. Must be a future date. We'll confirm availability within 24 hours." size={14} />
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={form.preferredDate}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Preferred Time */}
              <div>
                <label className={labelClass}>
                  Preferred Time{' '}
                  <InfoTooltip text="Optional — specify a start time if you have a preference. Our operating hours are typically 10:00–22:00." size={14} />
                </label>
                <input
                  type="time"
                  name="preferredTime"
                  value={form.preferredTime}
                  onChange={handleChange}
                  placeholder="e.g. 14:00"
                  className={inputClass}
                />
              </div>

              {/* Message */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Additional Message{' '}
                  <InfoTooltip text="Any special requests, dietary requirements, decorations, or other details we should know about for your event." size={14} />
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any special requests, dietary needs, or notes..."
                  className={inputClass}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(34,197,94,0.4)' }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 px-6 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)' }}
              >
                {loading ? 'Submitting Event...' : 'Submit Event'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddEventPage;
