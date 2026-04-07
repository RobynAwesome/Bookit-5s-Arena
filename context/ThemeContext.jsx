'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const THEMES = {
  dark: {
    name: 'Dark',
    emoji: '🌙',
    bg: '#030712',
    text: '#f9fafb',
    accent: '#22c55e',
    card: '#111827',
    border: '#1f2937',
    glow: 'rgba(34,197,94,0.4)',
    btnFrom: '#15803d',
    btnTo: '#22c55e',
  },
  light: {
    name: 'Light',
    emoji: '☀️',
    bg: '#f8fafc',
    text: '#0f172a',
    accent: '#16a34a',
    card: '#ffffff',
    border: '#e2e8f0',
    glow: 'rgba(22,163,74,0.2)',
    btnFrom: '#166534',
    btnTo: '#16a34a',
  },
  crazy: {
    name: 'Crazy',
    emoji: '🔥',
    bg: '#0d0520',
    text: '#f3e8ff',
    accent: '#a855f7',
    card: '#160830',
    border: '#4c2280',
    glow: 'rgba(168,85,247,0.8)',
    btnFrom: '#7e22ce',
    btnTo: '#a855f7',
    animation: 'pulse-neon',
  },
  read: {
    name: 'Read',
    emoji: '📖',
    bg: '#faf7f2',
    text: '#1c1917',
    accent: '#16a34a',
    card: '#ffffff',
    border: '#d6d3d1',
    glow: 'rgba(22,163,74,0.15)',
    btnFrom: '#166534',
    btnTo: '#16a34a',
    fontFamily: 'Georgia, "Times New Roman", serif',
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('5s_theme');
    if (saved && THEMES[saved]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(saved);
    } else {
      // Force 'dark' as the absolute default for the "God-Mode" aesthetic
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('5s_theme', theme);
    const t = THEMES[theme];
    
    // Sync theme class to html element for Tailwind/CSS scoping
    const html = document.documentElement;
    html.classList.remove('dark', 'light', 'crazy', 'read');
    html.classList.add(theme);
    // Read mode: apply serif font family
    html.style.setProperty('--font-body', t.fontFamily || 'inherit');

    document.documentElement.style.setProperty('--bg-primary', t.bg);
    document.documentElement.style.setProperty('--text-primary', t.text);
    document.documentElement.style.setProperty('--accent', t.accent);
    document.documentElement.style.setProperty('--card-bg', t.card);
    document.documentElement.style.setProperty('--border', t.border);
    document.documentElement.style.setProperty('--glow', t.glow);
    document.documentElement.style.setProperty('--btn-from', t.btnFrom);
    document.documentElement.style.setProperty('--btn-to', t.btnTo);
  }, [theme]);

  const cycleTheme = () => {
    const keys = Object.keys(THEMES);
    const idx = keys.indexOf(theme);
    setTheme(keys[(idx + 1) % keys.length]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes: THEMES, current: THEMES[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

export { THEMES };
export default ThemeContext;
