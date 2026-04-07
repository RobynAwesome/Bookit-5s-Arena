'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

const EditBookingPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBooking(data);
        setDate(data.date);
        setStartTime(data.start_time);
        setDuration(data.duration);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, start_time: startTime, duration: Number(duration) }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Failed to update booking');
      setSaving(false);
      return;
    }

    router.push(`/bookings/${id}`);
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>;

  const courtName = booking?.court?.name ?? 'Court';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href={`/bookings/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <FaArrowLeft className="text-xs" /> Back to Booking
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Booking</h1>
      <p className="text-sm text-gray-500 mb-6">{courtName}</p>
      <hr className="mb-6" />

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="border rounded-md px-3 py-2 text-sm text-gray-700"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="border rounded-md px-3 py-2 text-sm text-gray-700"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm text-gray-700"
            >
              {[1, 2, 3, 4].map((h) => (
                <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <p className="text-xs text-gray-400">
          Note: Bookings cannot be edited within 8 hours of the scheduled start time.
          Operating hours are 10:00 – 22:00.
        </p>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditBookingPage;
