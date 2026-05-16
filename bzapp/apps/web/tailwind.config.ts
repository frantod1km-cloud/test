import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          0: '#0a0a0c',
          1: '#111114',
          2: '#17171c',
          3: '#1f1f26',
        },
        border: {
          DEFAULT: '#26262e',
          strong: '#34343f',
        },
        text: {
          1: '#ededf0',
          2: '#a1a1aa',
          3: '#71717a',
        },
        accent: {
          DEFAULT: 'var(--accent, #5b8cff)',
          strong: 'var(--accent-strong, #2e5fff)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
      },
    },
  },
  plugins: [],
};

export default config;
