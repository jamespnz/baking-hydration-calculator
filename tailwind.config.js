/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          base: '#1A1A1A',
          panel: '#222222',
          raised: '#2A2A2A',
          line: '#3A3A3A',
          inset: '#141414',
        },
        ice: {
          DEFAULT: '#F4F6F8',
          dim: '#C7CDD4',
        },
        slateblue: {
          DEFAULT: '#7FA7C7',
          bright: '#9BC4E8',
          dim: '#5A7A95',
        },
        amber: {
          safety: '#FFB020',
          deep: '#B8740A',
          glow: 'rgba(255,176,32,0.18)',
        },
        terminal: {
          green: '#3FB950',
          red: '#F85149',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'inner-line': 'inset 0 0 0 1px #3A3A3A',
        amber: '0 0 0 1px rgba(255,176,32,0.5), 0 0 12px rgba(255,176,32,0.15)',
      },
    },
  },
  plugins: [],
};
