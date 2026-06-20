import type { Config } from 'tailwindcss';

// Design tokens for Hookcast — a "video editing bay" aesthetic:
// cool graphite paper instead of warm cream, ink for surfaces/text,
// a coral "hook" accent for the 0-3s attention window, and a signal
// teal for "this performed" indicators. See /docs/PRD.md for the
// full rationale.
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#ECEEEF',
        'paper-dim': '#E1E3E5',
        ink: {
          DEFAULT: '#13151A',
          800: '#1B1E25',
          600: '#3A3F4A',
          400: '#5B6168',
          200: '#9CA1A8',
        },
        hook: {
          DEFAULT: '#FF5A36',
          dim: '#E14B2A',
          tint: '#FFE7DF',
        },
        signal: {
          DEFAULT: '#19A38C',
          tint: '#DFF4EF',
        },
        warn: {
          DEFAULT: '#D9A441',
          tint: '#FBF1DD',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(19,21,26,0.06), 0 8px 24px -12px rgba(19,21,26,0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
