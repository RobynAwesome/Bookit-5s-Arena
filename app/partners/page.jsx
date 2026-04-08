'use client';

import { motion } from 'framer-motion';
import { FaHandshake, FaStar, FaExternalLinkAlt } from 'react-icons/fa';

const SPONSORS = [
  { id: 1, name: 'Hellenic FC', tier: 'Platinum Partner', desc: 'Home of the 5s Arena World Cup.', link: 'https://hellenicfc.co.za' },
  { id: 2, name: 'Robyn Awesome Sports Gear', tier: 'Gold Affiliate', desc: 'Official kit supplier. Use code 5SARENA for 10% off.', link: 'https://store.fivesarena.com' },
  { id: 3, name: 'Cape Town Energy Drinks', tier: 'Silver Sponsor', desc: 'Fueling our athletes during late-night fixtures.', link: '#' },
];

const GUEST_POSTS = [
  { id: 1, title: 'How to Build a Winning 5-a-side Team', author: 'Coach Mike', date: 'April 2026', link: '/blog/winning-team' },
  { id: 2, title: 'Nutrition for Short Format Football', author: 'Dr. Sarah Jones', date: 'May 2026', link: '/blog/nutrition' },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            className="w-20 h-20 mx-auto bg-blue-900/40 border-2 border-blue-500/50 rounded-2xl flex items-center justify-center mb-6"
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FaHandshake className="text-blue-400 text-4xl" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-4" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
            PARTNERS & <span className="text-blue-400">AFFILIATES</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover the brands and organizations that make 5s Arena possible. We are proud to work alongside them.
          </p>
        </div>

        {/* Sponsors & Affiliates Grid */}
        <h2 className="text-2xl font-black uppercase tracking-widest mb-8 border-b border-gray-800 pb-4 text-center">
          Official Sponsors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {SPONSORS.map((sponsor, i) => (
            <motion.a 
              key={sponsor.id}
              href={sponsor.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className={`bg-gray-900 border rounded-2xl p-8 text-center flex flex-col items-center justify-between group overflow-hidden relative cursor-pointer ${
                sponsor.tier.includes('Platinum') ? 'border-blue-500' : 
                sponsor.tier.includes('Gold') ? 'border-yellow-500' : 'border-gray-500'
              }`}
            >
              <div className={`absolute top-0 right-0 p-2 text-[10px] font-black uppercase tracking-widest bg-gray-800 rounded-bl-xl ${
                sponsor.tier.includes('Platinum') ? 'text-blue-400 border-b border-l border-blue-500' : 
                sponsor.tier.includes('Gold') ? 'text-yellow-400 border-b border-l border-yellow-500' : 'text-gray-400 border-b border-l border-gray-500'
              }`}>
                {sponsor.tier}
              </div>

              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-6 mt-4">
                <FaStar className={
                  sponsor.tier.includes('Platinum') ? 'text-blue-400 text-2xl' : 
                  sponsor.tier.includes('Gold') ? 'text-yellow-400 text-2xl' : 'text-gray-400 text-2xl'
                } />
              </div>
              
              <div>
                <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-3" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                  {sponsor.name}
                </h3>
                <p className="text-sm text-gray-400 mb-6">{sponsor.desc}</p>
              </div>

              <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                Visit Site <FaExternalLinkAlt size={10} />
              </span>
            </motion.a>
          ))}
        </div>

        {/* Guest Content / Cross Promotion */}
        <h2 className="text-2xl font-black uppercase tracking-widest mb-8 border-b border-gray-800 pb-4 text-center">
          Partner Content & Advice
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GUEST_POSTS.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 border-gray-700 rounded-2xl p-6 transition-colors shadow-lg"
            >
              <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
              <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-4">
                By {post.author} &middot; {post.date}
              </p>
              <button disabled className="text-sm text-gray-500 flex items-center gap-2 border border-gray-700 rounded-lg px-4 py-2 cursor-not-allowed">
                Read Article (Coming Soon)
              </button>
            </motion.div>
          ))}
        </div>
        
        <p className="text-center text-xs text-gray-500 uppercase tracking-widest mt-16 border-t border-gray-800 pt-8">
          All affiliate links are marked and we may earn a small commission on purchases made through them.  
        </p>

      </div>
    </div>
  );
}
