import formsPlugin from '@tailwindcss/forms'

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 深空底色
        void:    { DEFAULT: '#07070f', 50: '#0d0d1a', 100: '#111120', 200: '#16162a', 300: '#1e1e38' },
        // 主色 — 紫羅蘭
        violet:  { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
        // 強調色 — 琥珀金
        gold:    { 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
        // 保留原始 indigo 別名
        lounge:  { DEFAULT: '#7c3aed', hover: '#6d28d9' },
      },
      fontFamily: {
        sans:  ['Inter', 'ui-sans-serif', 'system-ui'],
        mono:  ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
        display: ['Syne', 'Inter', 'ui-sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 16px 2px rgba(139,92,246,0.35)',
        'glow-gold':   '0 0 16px 2px rgba(251,191,36,0.35)',
        'glow-green':  '0 0 12px 2px rgba(34,197,94,0.30)',
        'glow-red':    '0 0 12px 2px rgba(239,68,68,0.30)',
        'glass':       '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'gradient-lounge': 'linear-gradient(135deg, #0d0d1a 0%, #0f0a1e 50%, #0a0d18 100%)',
        'gradient-card':   'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'gradient-violet': 'linear-gradient(135deg, #7c3aed, #a855f7)',
        'gradient-gold':   'linear-gradient(135deg, #d97706, #fbbf24)',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':       { opacity: '1',   transform: 'scale(1.04)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px 1px rgba(139,92,246,0.2)' },
          '50%':       { boxShadow: '0 0 20px 4px rgba(139,92,246,0.5)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'pulse-ring':  'pulse-ring 2s ease-in-out infinite',
        'fade-up':     'fade-up 0.35s ease-out both',
        'glow-pulse':  'glow-pulse 3s ease-in-out infinite',
        shimmer:       'shimmer 2.5s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [formsPlugin],
}
