/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Pitch Deep Dark Palette
        charcoal: {
          950: "#060709", // pitch dark backdrop
          900: "#0B0D11", // deep dark surface
          850: "#10141A", // elevated cards
          800: "#181E27", // borders & active cards
          700: "#222B38", // secondary borders
          600: "#323E50", // accents
          500: "#E5E7EB", // bold light text
          400: "#F3F4F6", // bold white text
          300: "#FFFFFF", // pure bold white
          200: "#FFFFFF", // pure bold white
          100: "#FFFFFF", // pure bold white
        },
        
        // Vibrant Fiery Orange Accents
        orange: {
          400: "#FFA055",
          500: "#FF6B00",
          600: "#EA580C",
          glow: "#FF6B00",
        },
        
        // Compatibility color mapping
        ink: "#FF6B00",            // Primary accent becomes electric orange
        parchment: "#181B20",      // Dark charcoal surface
        forest: "#10B981",         // Green
        gold: "#F59E0B",           // Amber
        rose: "#F43F5E",           // Alert crimson
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
        display: ["'Syne'", "'Outfit'", "sans-serif"],
        serif: ["'Syne'", "'Outfit'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        'orange-glow': '0 0 25px -4px rgba(255, 107, 0, 0.55)',
        'orange-sm': '0 0 14px -2px rgba(255, 107, 0, 0.45)',
        'fiery-glow': '0 0 35px 2px rgba(255, 107, 0, 0.4), 0 0 15px rgba(255, 69, 0, 0.3)',
      },
      animation: {
        'flame-pulse': 'flamePulse 2.5s ease-in-out infinite alternate',
        'fiery-shift': 'fieryShift 4s ease infinite',
        'ember-flicker': 'emberFlicker 1.8s ease-in-out infinite alternate',
        'laser-scan': 'laserScan 2s linear infinite',
      },
      keyframes: {
        flamePulse: {
          '0%': { boxShadow: '0 0 18px rgba(255, 107, 0, 0.35), inset 0 0 12px rgba(255, 69, 0, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(255, 107, 0, 0.75), inset 0 0 20px rgba(255, 69, 0, 0.4)' },
        },
        fieryShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        emberFlicker: {
          '0%': { opacity: '0.85', filter: 'drop-shadow(0 0 8px #FF6B00)' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 16px #FF4500)' },
          '100%': { opacity: '0.9', filter: 'drop-shadow(0 0 12px #FFA500)' },
        },
        laserScan: {
          '0%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0%)' },
        }
      }
    },
  },
  plugins: [],
};
