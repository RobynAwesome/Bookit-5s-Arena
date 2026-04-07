'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function CountUp({ to, duration = 1600 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start;
    const num = parseFloat(to);
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * num));
      if (progress < 1) requestAnimationFrame(step);
      else setValue(num);
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);

  return <span ref={ref}>{value}</span>;
}

export default function StatsBar({ courtsCount = 4 }) {
  const stats = [
    { emoji: '⚽', label: 'Courts', value: courtsCount, numeric: true, suffix: '' },
    { emoji: '💰', label: 'From', value: 400, numeric: true, suffix: '/hr', prefix: 'R' },
    { emoji: '🕙', label: 'Open', value: null, display: '10AM – 10PM' },
    { emoji: '📍', label: 'Location', value: null, display: 'Milnerton, CPT' },
  ];

  return (
    <div className="bg-black text-white py-7 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
            >
              <span className="text-2xl leading-none mb-1">{s.emoji}</span>
              <span
                className="font-black text-2xl text-white leading-none"
                style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
              >
                {s.numeric ? (
                  <>
                    {s.prefix}<CountUp to={s.value} />{s.suffix}
                  </>
                ) : s.display}
              </span>
              <span className="text-gray-400 text-xs uppercase tracking-widest">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
