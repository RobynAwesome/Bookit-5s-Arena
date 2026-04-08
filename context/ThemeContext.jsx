'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const THEMES = {
  dark: {
    name: 'Dark',
    icon: 'dark',
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
    icon: 'light',
    bg: '#f8fafc',
    text: '#0f172a',
    accent: '#16a34a',
    card: '#ffffff',
    border: '#e2e8f0',
    glow: 'rgba(22,163,74,0.2)',
    btnFrom: '#166534',
    btnTo: '#16a34a',
  },
  read: {
    name: 'Read',
    icon: 'read',
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
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    const saved = localStorage.getItem('5s_theme');
    if (saved === 'crazy') {
      localStorage.setItem('5s_theme', 'dark');
      return 'dark';
    }

    return saved && THEMES[saved] ? saved : 'dark';
  });

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
