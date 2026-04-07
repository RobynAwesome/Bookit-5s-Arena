'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaSun, FaMoon, FaBookOpen, FaGhost, FaTimes, FaShareAlt } from 'react-icons/fa';

const modes = [
  { id: 'dark', name: 'Dark', icon: FaMoon, bg: 'bg-gray-950', text: 'text-gray-300', accent: 'text-green-400' },
  { id: 'light', name: 'Light', icon: FaSun, bg: 'bg-white', text: 'text-gray-800', accent: 'text-green-600' },
  { id: 'read', name: 'Read', icon: FaBookOpen, bg: 'bg-[#f4ecd8]', text: 'text-[#5b4636]', accent: 'text-[#8b4513]' },
  { id: 'crazy', name: 'Crazy', icon: FaGhost, bg: 'bg-black', text: 'text-green-500', accent: 'text-pink-500' },
];

export default function BlogReader({ children, title, author, date }) {
  const [mode, setMode] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentMode = modes.find((m) => m.id === mode);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${currentMode.bg} ${currentMode.text} pt-24 pb-20 px-4 relative overflow-hidden`}>
      {/* Crazy Mode background effects */}
      <AnimatePresence>
        {mode === 'crazy' && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-0"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 255, 0, 0.1) 1px, rgba(0, 255, 0, 0.1) 2px)',
                backgroundSize: '100% 3px',
              }}
            />
            <motion.div
              animate={{ 
                x: [0, 10, -10, 5, 0],
                y: [0, -5, 5, -2, 0],
              }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="fixed top-20 right-20 text-[200px] font-black opacity-5 pointer-events-none select-none italic text-pink-500 z-0"
            >
              CRAZY
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Floating Controls */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                title={m.name}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>

        {/* Content Header */}
        <div className="mb-12">
          <h1 
            className={`text-4xl md:text-6xl font-black uppercase tracking-widest mb-6 ${mode === 'crazy' ? 'italic scale-110 origin-left text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]' : ''}`}
            style={{ 
              fontFamily: mode === 'crazy' ? 'Impact, fantasy' : 'Impact, sans-serif',
              textShadow: mode === 'crazy' ? '2px 2px #ff00ff, -2px -2px #00ffff' : 'none'
            }}
          >
            {title}
          </h1>
          <div className="flex gap-4 items-center font-bold uppercase tracking-widest text-xs">
            <span className={currentMode.accent}>By {author}</span>
            <span className="opacity-30">•</span>
            <span className="opacity-60">{date}</span>
          </div>
        </div>

        {/* Article Body */}
        <article className={`prose lg:prose-xl max-w-none transition-all duration-500 ${
          mode === 'light' ? 'prose-slate' : 
          mode === 'read' ? 'prose-stone' : 
          mode === 'crazy' ? 'prose-invert font-mono' :
          'prose-invert'
        } ${
          mode === 'crazy' ? 'selection:bg-pink-500 selection:text-white' : 'selection:bg-green-500/30'
        }`}>
          {/* Custom style overrides for specific modes */}
          <style jsx global>{`
            .prose h2 { font-family: 'Impact', sans-serif !important; border-bottom: 2px solid currentColor; padding-bottom: 0.5rem; margin-top: 3rem; }
            ${mode === 'crazy' ? `
              .prose p { color: #22c55e !important; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
              .prose strong { color: #ec4899 !important; text-decoration: underline; }
              .prose li { color: #facc15 !important; }
            ` : mode === 'read' ? `
              .prose p { line-height: 1.8; font-size: 1.25rem; }
            ` : ''}
          `}</style>
          {children}
        </article>

        <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                <FaShareAlt /> Share
              </button>
            </div>
            <Link href="/blog" className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              mode === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-white'
            }`}>
              Return to Feed
            </Link>
        </div>
      </div>
    </div>
  );
}
