import { motion } from 'framer-motion'

export default function Login() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* 背景光暈 */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 60%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="glass noise-overlay relative w-full max-w-sm mx-4 p-8 space-y-7"
      >
        {/* 標題 */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 0 24px rgba(139,92,246,0.5)' }}>
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Syne, Inter, sans-serif', color: '#f1f5f9' }}>
            RP Lounge
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>管理系統 · 請輸入您的帳戶資訊</p>
        </div>

        {/* 表單 */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>電子郵件</label>
            <input
              type="email"
              placeholder="lounge@example.com"
              className="lounge-input"
              aria-label="電子郵件"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>密碼</label>
            <input
              type="password"
              placeholder="••••••••"
              className="lounge-input"
              aria-label="密碼"
            />
          </div>
        </div>

        <button
          className="btn-violet w-full py-2.5 rounded-lg text-sm font-semibold text-white"
          aria-label="登入"
        >
          登入系統
        </button>

        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          RP Lounge Manager v1.0
        </p>
      </motion.div>
    </div>
  )
}

