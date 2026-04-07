'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaComments, FaTimes, FaPaperPlane, FaFutbol, FaRobot, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

const QUICK_QUESTIONS = [
  'How do I book a court?',
  'What are the prices?',
  'Where are you located?',
  'How do rewards work?',
  'Can I cancel a booking?',
  'Do you host events?',
];

export default function SupportChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hey! 👋 I\'m the 5s Arena assistant. Ask me anything about bookings, prices, rewards, events, or finding us!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'bot',
        text: data.answer || 'Sorry, I couldn\'t process that. Try asking something else!',
        suggestions: data.suggestions,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Oops, something went wrong. Please try again or WhatsApp us at +27 63 782 0245.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setOpen(true); setHasUnread(false); }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)', boxShadow: '0 0 30px rgba(34,197,94,0.4)' }}
          >
            <FaComments size={22} />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-950 animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: 520, maxHeight: 'calc(100vh - 6rem)' }}
          >
            {/* Header */}
            <div className="bg-green-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center">
                <FaFutbol size={14} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">5s Arena Support</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  <p className="text-[10px] text-green-200">Always online</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-green-200 hover:text-white transition-colors p-1 cursor-pointer"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Quick booking links */}
            <div className="px-3 py-2 flex gap-2 border-b border-gray-800/50 flex-shrink-0">
              <Link href="/bookings" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-green-900/30 border border-green-800/40 text-green-400 text-[10px] font-bold uppercase tracking-wider hover:bg-green-900/50 transition-colors">
                <FaFutbol size={9} /> Courts
              </Link>
              <Link href="/events" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-900/30 border border-amber-800/40 text-amber-400 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-900/50 transition-colors">
                <FaCalendarAlt size={9} /> Events
              </Link>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.015\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              }}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-green-700 text-white rounded-br-md'
                      : 'bg-gray-800 text-gray-200 rounded-bl-md border border-gray-700'
                  }`}>
                    {msg.role === 'bot' && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <FaRobot size={10} className="text-green-400" />
                        <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider">5s Bot</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-[13px]">{msg.text}</div>
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestions.map((s, si) => (
                          <button
                            key={si}
                            onClick={() => sendMessage(s)}
                            className="text-[9px] font-bold text-green-300 bg-green-900/30 border border-green-800/50 rounded-full px-2.5 py-1 hover:bg-green-900/50 transition-colors cursor-pointer"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick questions (show if only greeting message) */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-[9px] font-bold text-gray-400 bg-gray-800 border border-gray-700 rounded-full px-2.5 py-1.5 hover:border-green-700 hover:text-green-400 transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-2.5 border-t border-gray-800 flex items-center gap-2 flex-shrink-0 bg-gray-900">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                maxLength={500}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-700 transition-colors"
              />
              <motion.button
                onClick={() => sendMessage()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={!input.trim() || loading}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  input.trim() && !loading
                    ? 'bg-green-600 text-white hover:bg-green-500'
                    : 'bg-gray-800 text-gray-600'
                }`}
              >
                <FaPaperPlane size={12} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
