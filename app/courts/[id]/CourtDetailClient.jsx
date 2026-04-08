'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaCalendarAlt, FaStar, FaClock, FaMapMarkerAlt, FaFutbol } from 'react-icons/fa';
import BookingForm from '@/components/BookingForm';
import InfoTooltip from '@/components/InfoTooltip';
import { normalizeAvailabilityLabel } from '@/lib/bookingSlots';

const infoCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function CourtDetailClient({ court }) {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Hero image with Ken Burns */}
      <div className="relative overflow-hidden rounded-2xl" style={{ height: undefined }}>
        <div
          className="court-card-bg w-full"
          style={{
            backgroundImage: `url(/images/courts/${court.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 42%',
            height: 'clamp(280px, 38vw, 360px)',
            willChange: 'transform',
          }}
        />
        {/* Gradient overlay — bottom to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        {/* Court name */}
        <div className="absolute bottom-16 left-0 p-6 pb-0">
          <h1
            className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white drop-shadow-lg"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {court.name}
          </h1>
        </div>
        {/* Tab switcher — sits at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-4 flex gap-3">
          <motion.button
            type="button"
            onClick={() => setActiveTab('info')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'info'
                ? 'bg-green-500 text-white shadow-[0_0_18px_rgba(34,197,94,0.55)]'
                : 'bg-gray-800/70 text-gray-300 border border-gray-600 backdrop-blur-sm hover:border-green-500 hover:text-green-300'
            }`}
          >
            <FaInfoCircle size={12} /> Court Info
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setActiveTab('book')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'book'
                ? 'bg-green-500 text-white shadow-[0_0_18px_rgba(34,197,94,0.55)]'
                : 'bg-gray-800/70 text-gray-300 border border-gray-600 backdrop-blur-sm hover:border-green-500 hover:text-green-300'
            }`}
          >
            <FaCalendarAlt size={12} /> Book Now
          </motion.button>
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'info' ? (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 px-6 pb-6"
          >
            {court.description && (
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{court.description}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Amenities */}
              <motion.div
                custom={0}
                variants={infoCardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-start gap-3 cursor-default"
              >
                <FaStar className="text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                    Amenities{' '}
                    <InfoTooltip
                      text="Facilities available at this court. All courts have floodlights for evening play."
                      position="right"
                      size={12}
                    />
                  </p>
                  <p className="text-white text-sm font-medium">{court.amenities}</p>
                </div>
              </motion.div>

              {/* Availability */}
              <motion.div
                custom={1}
                variants={infoCardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-start gap-3 cursor-default"
              >
                <FaClock className="text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                    Availability{' '}
                    <InfoTooltip
                      text="Operating hours for this court. Bookings outside these hours are not available. Contact us for special arrangements."
                      position="right"
                      size={12}
                    />
                  </p>
                  <p className="text-white text-sm font-medium">{normalizeAvailabilityLabel(court.availability)}</p>
                </div>
              </motion.div>

              {/* Address */}
              <motion.div
                custom={2}
                variants={infoCardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-start gap-3 cursor-default"
              >
                <FaMapMarkerAlt className="text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Address</p>
                  <p className="text-white text-sm font-medium">{court.address}</p>
                </div>
              </motion.div>

              {/* Price per Hour */}
              <motion.div
                custom={3}
                variants={infoCardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="bg-green-900/20 border border-green-800/40 rounded-xl p-4 flex items-start gap-3 cursor-default"
              >
                <FaFutbol className="text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-green-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                    Price per Hour{' '}
                    <InfoTooltip
                      text="Rate per hour. Total cost = hourly rate × duration. You can book 1–3 hours per session. Pay cash at the venue on the day."
                      position="top"
                      size={12}
                    />
                  </p>
                  <p className="text-green-400 text-2xl font-black">R{court.price_per_hour}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="book"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <BookingForm
              courtId={court._id}
              courtName={court.name}
              pricePerHour={court.price_per_hour}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
