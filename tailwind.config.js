/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  future: {
    useLegacyColorPalette: true,
  },
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#030712",
        accent: "#22c55e",
      },
      fontFamily: {
        impact: ["Impact", "Arial Black", "sans-serif"],
      },
      animation: {
        "pulse-neon": "pulse-neon 2s infinite ease-in-out",
        "ring-pulse": "ringPulse 2.2s ease-out infinite",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": {
            boxShadow: "0 0 15px var(--glow), 0 0 30px var(--glow)",
            borderColor: "var(--accent)",
          },
          "50%": {
            boxShadow: "0 0 30px var(--glow), 0 0 60px var(--glow)",
            borderColor: "#fff",
          },
        },
        ringPulse: {
          "0%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.6)" },
          "70%": { boxShadow: "0 0 0 12px rgba(34,197,94,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
        },
      },
    },
  },
  plugins: [],
};
