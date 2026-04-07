'use client';

import { useState, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  FaUserShield, FaSignInAlt, FaUserPlus, FaEnvelope, FaLock,
  FaUser, FaShieldAlt, FaTrophy, FaStar, FaBolt,
  FaGithub, FaApple, FaMicrosoft, FaGlobe, FaTicketAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(168,85,247,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(34,197,94,0.05) 0%, transparent 50%)',
      }} />

      {/* Floating geometric shapes (Purple/Violet theme) */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${8 + (i * 8) % 85}%`,
            top: `${5 + (i * 13) % 90}%`,
            width: `${4 + (i % 4) * 3}px`,
            height: `${4 + (i % 4) * 3}px`,
            borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
            transform: i % 3 === 2 ? 'rotate(45deg)' : 'none',
            background: i % 2 === 0 ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.1)',
          }}
          animate={{
            y: [0, -20 - (i * 5), 0],
            x: [0, (i % 2 === 0 ? 10 : -10), 0],
            opacity: [0.15, 0.5, 0.15],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 4 + i * 0.7, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        />
      ))}

      {/* Horizontal scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)' }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export default function ManagerRegisterPage() {
  const router = useRouter();
  const recaptchaRef = useRef(null);

  const [mode, setMode] = useState('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!recaptchaToken) { setError('Please complete the verification check.'); return; }

    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, recaptchaToken, role: 'manager' }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      recaptchaRef.current?.reset();
      setRecaptchaToken('');
      setLoading(false);
      return;
    }
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result?.error) setError(result.error);
    else { router.push('/'); router.refresh(); }
  };

  const inputClass = (field) =>
    `block w-full px-4 py-3.5 bg-gray-800/40 border rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500/40 focus:border-purple-600/50 outline-none transition-all placeholder-gray-600 backdrop-blur-sm ${
      focusedField === field ? 'border-purple-600/50 bg-gray-800/60' : 'border-gray-700/40'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden bg-gray-950">
      <ParticleField />

      <div className="w-full max-w-5xl relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* ── Left: Manager Value Prop ── */}
        <motion.div
          className="flex-1 text-center lg:text-left max-w-sm"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 text-[10px] font-black tracking-widest uppercase"
          >
            <FaUserShield size={11} /> Staff Enrollment
          </motion.div>

          <h1 className="font-black text-white text-5xl uppercase tracking-tight mb-4 leading-none" style={{ fontFamily: 'Impact, sans-serif' }}>
            MANAGE YOUR <span className="text-purple-500">LEGACY</span>
          </h1>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            As a 5s Arena Manager, you gain control over squad rosters, team rewards, and tournament registrations. Lead your team to glory in the 2026 World Cup.
          </p>

          <div className="space-y-4">
             {[
               { icon: <FaTrophy />, title: 'Squad Control', desc: 'Manage players and team logos.' },
               { icon: <FaStar />, title: 'Exclusive Rewards', desc: 'Earn staff-only loyalty points.' },
               { icon: <FaGlobe />, title: 'WC Eligibility', desc: 'Direct entry for verified managers.' }
             ].map((f, i) => (
               <motion.div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-900/40 border border-gray-800/50" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i*0.1 }}>
                 <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0 border border-purple-500/20">
                   {f.icon}
                 </div>
                 <div className="text-left">
                   <h3 className="text-white text-xs font-black uppercase tracking-widest">{f.title}</h3>
                   <p className="text-gray-500 text-[10px] mt-0.5">{f.desc}</p>
                 </div>
               </motion.div>
             ))}
          </div>
        </motion.div>

        {/* ── Right: Reg Card ── */}
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="bg-gray-900/80 backdrop-blur-2xl shadow-2xl rounded-3xl border border-purple-500/20 overflow-hidden">
            <div className="bg-purple-600 p-6 text-center">
              <h2 className="text-white font-black uppercase tracking-widest text-xl">Manager Registration</h2>
              <p className="text-purple-200 text-[10px] font-bold uppercase tracking-widest mt-1">Authorized Staff Only</p>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-950/40 border border-red-800/50 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                    <FaUser size={10} className="text-purple-500" /> Full Name
                  </label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} className={inputClass('name')} placeholder="Manager Name" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                    <FaEnvelope size={10} className="text-purple-500" /> Professional Email
                  </label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} className={inputClass('email')} placeholder="manager@arena.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required onFocus={() => setFocusedField('pass')} onBlur={() => setFocusedField(null)} className={inputClass('pass')} placeholder="••••••" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Confirm</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required onFocus={() => setFocusedField('conf')} onBlur={() => setFocusedField(null)} className={inputClass('conf')} placeholder="••••••" />
                  </div>
                </div>

                <div className="bg-gray-800/20 rounded-xl border border-gray-700/40 p-3 flex justify-center backdrop-blur-sm">
                  <ReCAPTCHA ref={recaptchaRef} sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY} onChange={(token) => setRecaptchaToken(token || '')} theme="dark" />
                </div>

                <motion.button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-black text-white uppercase tracking-widest bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_10px_30px_rgba(147,51,234,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50">
                  {loading ? 'Creating Squad...' : 'Initialize Manager Account'}
                </motion.button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                <Link href="/login" className="text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:text-purple-400 transition-colors">
                  Already have access? Sign In
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
