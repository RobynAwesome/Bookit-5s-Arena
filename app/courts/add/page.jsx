'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaFutbol } from 'react-icons/fa';
import { motion } from 'framer-motion';
import InfoTooltip from '@/components/InfoTooltip';

const AddCourtPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    capacity: 10,
    amenities: '',
    availability: '',
    price_per_hour: '',
    image: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.description || !form.address || !form.price_per_hour) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/courts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price_per_hour: Number(form.price_per_hour),
          capacity: Number(form.capacity),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add court. Please try again.');
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
          <FaFutbol className="mx-auto text-4xl text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Court Added!</h2>
          <p className="text-gray-400 text-sm mb-8">Your new court has been submitted successfully.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setSuccess(false);
                setForm({ name: '', description: '', address: '', capacity: 10, amenities: '', availability: '', price_per_hour: '', image: '' });
              }}
              className="px-5 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition"
            >
              Add Another
            </button>
            <button
              onClick={() => router.push('/my-courts')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition"
              style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)' }}
            >
              View My Courts
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
            Add a Court
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
            <FaFutbol className="text-green-500 text-xl" />
            <h2 className="text-white text-lg font-bold uppercase tracking-widest">Court Details</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950 border border-red-800 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Court Name */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Court Name <span className="text-red-400">*</span>{' '}
                  <InfoTooltip text="A unique, recognisable name for your court. This is what players will see when browsing available courts." size={14} />
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Premier Court"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Description <span className="text-red-400">*</span>{' '}
                  <InfoTooltip text="Describe the court surface (grass, turf, indoor), size, and what it's best suited for. This helps players pick the right court." size={14} />
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Describe the court, surface type, ideal for..."
                  className={inputClass}
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Address <span className="text-red-400">*</span>{' '}
                  <InfoTooltip text="The full street address of the court. Include suburb and city so players can find it easily on maps." size={14} />
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Pringle Rd, Milnerton, Cape Town"
                  className={inputClass}
                />
              </div>

              {/* Price */}
              <div>
                <label className={labelClass}>
                  Price per Hour (R) <span className="text-red-400">*</span>{' '}
                  <InfoTooltip text="Hourly rental rate in South African Rand. This is what players will be charged per hour when they book this court." size={14} />
                </label>
                <input
                  type="number"
                  name="price_per_hour"
                  value={form.price_per_hour}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="e.g. 400"
                  className={inputClass}
                />
              </div>

              {/* Capacity */}
              <div>
                <label className={labelClass}>
                  Capacity (players){' '}
                  <InfoTooltip text="Maximum number of players allowed on this court at one time. Default is 10 for 5-a-side. Adjust for larger or smaller formats." size={14} />
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  min="2"
                  className={inputClass}
                />
              </div>

              {/* Availability */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Availability Hours{' '}
                  <InfoTooltip text="The hours this court is open for bookings, e.g. '10:00 AM - 22:00 PM'. Players won't be able to book outside these hours." size={14} />
                </label>
                <input
                  type="text"
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                  placeholder="e.g. 10:00 AM - 22:00 PM"
                  className={inputClass}
                />
              </div>

              {/* Amenities */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Amenities{' '}
                  <InfoTooltip text="List the facilities available at this court — floodlights, change rooms, parking, water, etc. Separate with commas." size={14} />
                </label>
                <input
                  type="text"
                  name="amenities"
                  value={form.amenities}
                  onChange={handleChange}
                  placeholder="e.g. Floodlights, Change rooms, Secure Parking"
                  className={inputClass}
                />
              </div>

              {/* Image */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Image Filename{' '}
                  <InfoTooltip text="The filename of the court photo (e.g. court-5.jpg). Upload the image to /public/images/courts/ first, then enter the filename here." size={14} />
                </label>
                <input
                  type="text"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="e.g. court-5.jpg (must be in /public/images/courts/)"
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Place the image file in <code className="text-gray-400">/public/images/courts/</code> before adding.
                </p>
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
                {loading ? 'Adding Court...' : 'Add Court'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddCourtPage;
