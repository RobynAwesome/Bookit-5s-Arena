'use client';

import { motion } from 'framer-motion';

const AMENITIES = [
  { emoji: '💡', label: 'Floodlit Courts' },
  { emoji: '🔊', label: 'Sound System' },
  { emoji: '🍺', label: 'Bar & Restaurant' },
  { emoji: '🚗', label: 'Secure Parking' },
  { emoji: '🌦️', label: 'All-Weather Turf' },
  { emoji: '⚽', label: 'Synthetic Grass' },
];

export default function AmenitiesStrip() {
  return (
    <div className="bg-green-600 py-8 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {AMENITIES.map((a, i) => (
            <motion.div
              key={i}
              className="amenity-badge text-white flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.12, transition: { duration: 0.2 } }}
            >
              <motion.span
                className="amenity-icon text-3xl leading-none"
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: i * 0.6 + 1 }}
              >
                {a.emoji}
              </motion.span>
              <span className="font-bold uppercase tracking-wide text-sm">{a.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
