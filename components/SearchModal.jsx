'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  FaSearch, FaFutbol, FaTrophy, FaGavel,
  FaStar, FaUser, FaChartBar, FaTimes, FaNewspaper,
  FaBolt, FaPaintBrush, FaPlus, FaUsers
} from 'react-icons/fa';

const PAGES = [
  // Public (Guests & Everyone)
  { name: 'Book a Court', href: '/#courts', icon: FaFutbol, category: 'Booking', auth: 'public' },
  { name: 'Events & Services', href: '/events-and-services', icon: FaBolt, category: 'Booking', auth: 'public' },
  { name: 'Register for Tournament', href: '/tournament', icon: FaTrophy, category: 'Competition', auth: 'public' },
  { name: 'Fixtures & Live Scores', href: '/fixtures', icon: FaFutbol, category: 'Competition', auth: 'public' },

  // Authenticated Users (User)
  { name: 'Competitions', href: '/leagues', icon: FaTrophy, category: 'Competition', auth: 'user' },
  { name: 'Rules of the Game', href: '/rules-of-the-game', icon: FaGavel, category: 'Info', auth: 'user' },
  { name: 'Rewards', href: '/rewards', icon: FaStar, category: 'Account', auth: 'user' },
  { name: 'My Bookings', href: '/bookings', icon: FaBolt, category: 'Account', auth: 'user' },
  { name: 'Profile Settings', href: '/profile', icon: FaUser, category: 'Account', auth: 'user' },
  { name: 'Arena Creator', href: '/creator', icon: FaPaintBrush, category: 'Info', auth: 'user' },

  // Managers
  { name: 'Squad Management', href: '/manager/squad', icon: FaUsers, category: 'Staff', auth: 'manager' },
  { name: 'Manager Rewards', href: '/rewards', icon: FaStar, category: 'Staff', auth: 'manager' },

  // Admins Only
  { name: 'Admin Dashboard', href: '/admin/dashboard', icon: FaChartBar, category: 'Admin', auth: 'admin' },
  { name: 'User Management', href: '/admin/users', icon: FaUser, category: 'Admin', auth: 'admin' },
  { name: 'Add Event', href: '/events/add', icon: FaPlus, category: 'Admin', auth: 'admin' },
  { name: 'Add Newsletter', href: '/admin/newsletter', icon: FaNewspaper, category: 'Admin', auth: 'admin' },
  { name: 'Rights Management', href: '/admin/rights', icon: FaUser, category: 'Admin', auth: 'admin' },
];

const SearchModal = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const router = useRouter();

  const userRole = session?.user?.role;
  const isAuthenticated = !!session;
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';

  // Filter based on authentication role and query
  const filtered = PAGES.filter((p) => {
    // 1. Strict Role-Based Filtering
    if (p.auth === 'admin' && !isAdmin) return false;
    if (p.auth === 'manager' && !isManager && !isAdmin) return false;
    
    // Explicit Guest Safety: If guest, ONLY show public items.
    // If not public and not authenticated, hide it.
    if (!isAuthenticated && p.auth !== 'public') return false;

    // 2. Query matching
    return (
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    );
  });

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  const navigate = (href) => {
    setIsOpen(false);
    if (href.startsWith('/#')) {
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = href;
    } else {
      router.push(href);
    }
  };

  const categories = [...new Set(filtered.map((p) => p.category))];

  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-400 text-xs hover:border-green-500/40 hover:text-gray-300 transition-all cursor-pointer shrink-0"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FaSearch size={12} />
        <span className="hidden md:inline">Search…</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-700 text-gray-500 text-[10px] font-mono ml-2">
          ⌘K
        </kbd>
      </motion.button>

      {/* Modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90vw] max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
                <FaSearch className="text-green-400 flex-shrink-0" size={14} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages…"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
                />
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-300 cursor-pointer">
                  <FaTimes size={12} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No pages found for &ldquo;{query}&rdquo;</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat} className="mb-2">
                      <p className="text-green-500 text-[10px] uppercase tracking-widest font-bold px-3 py-1">{cat}</p>
                      {filtered.filter((p) => p.category === cat).map((page) => {
                        const Icon = page.icon;
                        return (
                          <motion.button
                            key={page.href}
                            onClick={() => navigate(page.href)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-gray-300 hover:bg-green-600/10 hover:text-white transition-all cursor-pointer"
                            whileHover={{ x: 3 }}
                          >
                            <Icon size={14} className="text-green-400 flex-shrink-0" />
                            <span className="text-sm">{page.name}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-800 px-4 py-2 flex items-center justify-between text-gray-600 text-[10px]">
                <span>Navigate with ↑↓ · Open with ↵</span>
                <span>ESC to close</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SearchModal;
