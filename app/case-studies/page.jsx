'use client';

import { motion } from 'framer-motion';
import { FaChartLine, FaTrophy, FaEye, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

const CASE_STUDIES = [
  {
    id: 1,
    title: 'The Milnerton Cup 2025',
    category: 'Tournament Success',
    stats: { teams: 24, goals: 312, attendance: '1,200+' },
    description: 'How we hosted a 24-team knockout tournament in a single weekend, resulting in the highest attendance record for a local 5-a-side event.',
    image: '/images/tournament/backgrounds/hero-background.jpg'
  },
  {
    id: 2,
    title: 'Corporate League: Tech Edition',
    category: 'Corporate Events',
    stats: { companies: 16, weeks: 8, engagement: 'Priceless' },
    description: 'Bringing together Cape Town\'s top tech companies for an 8-week structured networking and football league.',
    image: '/images/tournament/backgrounds/tourment-background-page.jpg'
  },
  {
    id: 3,
    title: 'Venue Transformation (Q4 2024)',
    category: 'Facility Upgrade',
    stats: { courts: 4, turf: 'FIFA Grade', lights: 'LED 800W' },
    description: 'The story of how 5s Arena upgraded its facilities to become the premier floodlit venue in the Northern Suburbs.',
    image: '/images/tournament/backgrounds/tourment-background-page.jpg'
  }
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            className="w-20 h-20 mx-auto bg-purple-900/40 border-2 border-purple-500/50 rounded-2xl flex items-center justify-center mb-6"
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FaChartLine className="text-purple-400 text-3xl" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-4" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
            PROVEN <span className="text-purple-400">RESULTS</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore our portfolio of past events, tournaments, and venue improvements. See how 5s Arena consistently delivers world-class football experiences.
          </p>
        </div>

        <div className="space-y-12">
          {CASE_STUDIES.map((study, i) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl group flex flex-col md:flex-row hover:border-gray-700 transition-colors"
            >
              <div className="md:w-2/5 h-64 md:h-auto relative overflow-hidden">
                <Image 
                  src={study.image} 
                  alt={study.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-gray-900 to-transparent md:via-gray-900/50" />
                <div className="absolute top-4 left-4 bg-gray-950/80 backdrop-blur-md border border-gray-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400">
                  {study.category}
                </div>
              </div>
              
              <div className="p-8 md:p-10 md:w-3/5 flex flex-col justify-center">
                <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-4" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                  {study.title}
                </h2>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                  {study.description}
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {Object.entries(study.stats).map(([k, v]) => (
                    <div key={k} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-white mb-1">{v}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{k}</p>
                    </div>
                  ))}
                </div>
                
                <button disabled className="mt-auto self-start inline-flex items-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl text-xs font-bold text-gray-500 uppercase tracking-widest cursor-not-allowed">
                  <FaEye size={12} /> Read Full Report (Coming Soon)
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center border-t border-gray-800 pt-12">
          <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-4">
            Host Your Next Major Event With Us
          </h3>
          <Link href="/events/book" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]">
            <FaTrophy /> Enquire Now <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
